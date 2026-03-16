-- Tabla de Productos
CREATE TABLE public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    cantidad INTEGER NOT NULL DEFAULT 0,
    precio NUMERIC NOT NULL DEFAULT 0,
    categoria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Salidas
CREATE TABLE public.salidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "productoId" UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    "nombreProducto" TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha TEXT NOT NULL, -- Se guarda como ISO String desde el cliente
    "destinatarioNombre" TEXT NOT NULL,
    "destinatarioFicha" TEXT NOT NULL,
    "destinatarioArea" TEXT NOT NULL,
    "firmaDigital" TEXT NOT NULL, -- Base64 de la firma
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salidas ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso público (Anónimo)
-- Dado que el requerimiento especifica "sin registro de usuarios" y un "admin implícito",
-- permitimos todas las operaciones (SELECT, INSERT, UPDATE, DELETE) al rol anon.

CREATE POLICY "Permitir acceso total a productos para anon" ON public.productos
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir acceso total a salidas para anon" ON public.salidas
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_productos_categoria ON public.productos(categoria);
CREATE INDEX idx_salidas_productoId ON public.salidas("productoId");
CREATE INDEX idx_salidas_fecha ON public.salidas(fecha);
