-- Estructura base completa de la Base de Datos para Sistema de Gestión de Inventario

-- 1. Tabla de Productos
CREATE TABLE public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    cantidad INTEGER NOT NULL DEFAULT 0,
    precio NUMERIC NOT NULL DEFAULT 0,
    categoria TEXT,
    fecha_entrada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Salidas (Cabecera)
CREATE TABLE public.salidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha TEXT NOT NULL, -- Se guarda como ISO String desde el cliente
    "destinatarioNombre" TEXT NOT NULL,
    "destinatarioFicha" TEXT NOT NULL,
    "destinatarioArea" TEXT NOT NULL,
    "firmaDigital" TEXT NOT NULL, -- Base64 de la firma
    "totalProductos" INTEGER NOT NULL DEFAULT 0,
    "totalCantidad" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Detalle de Salidas (Items)
CREATE TABLE public.salida_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salida_id UUID NOT NULL REFERENCES public.salidas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    nombre_producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salida_items ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de acceso público (Anónimo)
-- Dado que el requerimiento especifica "sin registro de usuarios", se permite acceso anon
CREATE POLICY "Permitir acceso total a productos para anon" ON public.productos
FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso total a salidas para anon" ON public.salidas
FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acceso total a salida_items para anon" ON public.salida_items
FOR ALL TO anon USING (true) WITH CHECK (true);

-- 6. Índices para mejorar el rendimiento
CREATE INDEX idx_productos_categoria ON public.productos(categoria);
CREATE INDEX idx_salidas_fecha ON public.salidas(fecha);
CREATE INDEX idx_salida_items_salida_id ON public.salida_items(salida_id);
CREATE INDEX idx_salida_items_producto_id ON public.salida_items(producto_id);

-- 7. Función RPC para registrar una salida con múltiples productos (Transaccional)
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
      (elem->>'productoId')::uuid AS param_producto_id,
      (elem->>'cantidad')::int AS param_cantidad
    FROM jsonb_array_elements(items) elem
  ),
  req_agg AS (
    SELECT param_producto_id, SUM(param_cantidad) AS param_cantidad
    FROM req
    GROUP BY param_producto_id
  )
  SELECT COUNT(*)::int, COALESCE(SUM(param_cantidad), 0)::int
  INTO total_productos, total_cantidad
  FROM req_agg;

  FOR r IN
    WITH req AS (
      SELECT
        (elem->>'productoId')::uuid AS param_producto_id,
        (elem->>'cantidad')::int AS param_cantidad
      FROM jsonb_array_elements(items) elem
    ),
    req_agg AS (
      SELECT param_producto_id, SUM(param_cantidad) AS param_cantidad
      FROM req
      GROUP BY param_producto_id
    )
    SELECT * FROM req_agg
  LOOP
    SELECT id, nombre, cantidad
    INTO p
    FROM public.productos
    WHERE id = r.param_producto_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado (%).', r.param_producto_id;
    END IF;

    IF p.cantidad < r.param_cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para "%". Disponible: %, solicitado: %', p.nombre, p.cantidad, r.param_cantidad;
    END IF;

    UPDATE public.productos
    SET cantidad = cantidad - r.param_cantidad
    WHERE id = r.param_producto_id;
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
      (elem->>'productoId')::uuid AS param_producto_id,
      (elem->>'cantidad')::int AS param_cantidad
    FROM jsonb_array_elements(items) elem
  ),
  req_agg AS (
    SELECT param_producto_id, SUM(param_cantidad) AS param_cantidad
    FROM req
    GROUP BY param_producto_id
  )
  SELECT salida_id, p.id, p.nombre, r.param_cantidad
  FROM req_agg r
  JOIN public.productos p ON p.id = r.param_producto_id;

  RETURN salida_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_salida_multi(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
