-- Soporte para registro de salidas multi-producto (cabecera + detalle) con transacción.

ALTER TABLE public.salidas
  ALTER COLUMN "nombreProducto" DROP NOT NULL,
  ALTER COLUMN cantidad DROP NOT NULL;

ALTER TABLE public.salidas
  ADD COLUMN IF NOT EXISTS "totalProductos" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalCantidad" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.salida_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salida_id UUID NOT NULL REFERENCES public.salidas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
  nombre_producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.salida_items ENABLE ROW LEVEL SECURITY;

-- Crear la política, usando un bloque DO para evitar error de sintaxis IF NOT EXISTS en policies (Supabase/PostgreSQL 15 no soporta IF NOT EXISTS en CREATE POLICY directamente en todas las versiones)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'salida_items' 
    AND policyname = 'Permitir acceso total a salida_items para anon'
  ) THEN
    CREATE POLICY "Permitir acceso total a salida_items para anon" ON public.salida_items
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_salida_items_salida_id ON public.salida_items(salida_id);
CREATE INDEX IF NOT EXISTS idx_salida_items_producto_id ON public.salida_items(producto_id);

-- Migración de datos existentes (salidas de 1 producto) a la tabla detalle
INSERT INTO public.salida_items (salida_id, producto_id, nombre_producto, cantidad)
SELECT s.id, s."productoId", s."nombreProducto", s.cantidad
FROM public.salidas s
WHERE s."productoId" IS NOT NULL
  AND s.cantidad IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.salida_items si WHERE si.salida_id = s.id
  );

UPDATE public.salidas
SET
  "totalProductos" = COALESCE("totalProductos", 0) + 1,
  "totalCantidad" = COALESCE("totalCantidad", 0) + COALESCE(cantidad, 0)
WHERE "productoId" IS NOT NULL
  AND cantidad IS NOT NULL
  AND ("totalProductos" = 0 OR "totalCantidad" = 0);

CREATE OR REPLACE FUNCTION public.register_salida_multi(
  items JSONB,
  "destinatarioNombre" TEXT,
  "destinatarioFicha" TEXT,
  "destinatarioArea" TEXT,
  "firmaDigital" TEXT,
  fecha TEXT
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  salida_id UUID;
  total_productos INTEGER;
  total_cantidad INTEGER;
  r RECORD;
  p RECORD;
BEGIN
  IF items IS NULL OR jsonb_typeof(items) <> 'array' OR jsonb_array_length(items) = 0 THEN
    RAISE EXCEPTION 'Debe seleccionar al menos un producto';
  END IF;

  WITH req AS (
    SELECT
      (elem->>'productoId')::uuid AS producto_id,
      (elem->>'cantidad')::int AS cantidad
    FROM jsonb_array_elements(items) elem
  ),
  req_agg AS (
    SELECT producto_id, SUM(cantidad) AS cantidad
    FROM req
    GROUP BY producto_id
  )
  SELECT COUNT(*)::int, COALESCE(SUM(cantidad), 0)::int
  INTO total_productos, total_cantidad
  FROM req_agg;

  FOR r IN
    WITH req AS (
      SELECT
        (elem->>'productoId')::uuid AS producto_id,
        (elem->>'cantidad')::int AS cantidad
      FROM jsonb_array_elements(items) elem
    ),
    req_agg AS (
      SELECT producto_id, SUM(cantidad) AS cantidad
      FROM req
      GROUP BY producto_id
    )
    SELECT * FROM req_agg
  LOOP
    SELECT id, nombre, cantidad
    INTO p
    FROM public.productos
    WHERE id = r.producto_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado (%).', r.producto_id;
    END IF;

    IF p.cantidad < r.cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para "%". Disponible: %, solicitado: %', p.nombre, p.cantidad, r.cantidad;
    END IF;

    UPDATE public.productos
    SET cantidad = cantidad - r.cantidad
    WHERE id = r.producto_id;
  END LOOP;

  INSERT INTO public.salidas (
    fecha,
    "destinatarioNombre",
    "destinatarioFicha",
    "destinatarioArea",
    "firmaDigital",
    "totalProductos",
    "totalCantidad"
  ) VALUES (
    fecha,
    "destinatarioNombre",
    "destinatarioFicha",
    "destinatarioArea",
    "firmaDigital",
    total_productos,
    total_cantidad
  ) RETURNING id INTO salida_id;

  INSERT INTO public.salida_items (salida_id, producto_id, nombre_producto, cantidad)
  WITH req AS (
    SELECT
      (elem->>'productoId')::uuid AS producto_id,
      (elem->>'cantidad')::int AS cantidad
    FROM jsonb_array_elements(items) elem
  ),
  req_agg AS (
    SELECT producto_id, SUM(cantidad) AS cantidad
    FROM req
    GROUP BY producto_id
  )
  SELECT salida_id, p.id, p.nombre, r.cantidad
  FROM req_agg r
  JOIN public.productos p ON p.id = r.producto_id;

  RETURN salida_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_salida_multi(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

