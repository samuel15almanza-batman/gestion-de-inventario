-- Añadir columna fecha_entrada a la tabla productos
ALTER TABLE public.productos ADD COLUMN fecha_entrada TEXT;

-- Actualizar los registros existentes para que tengan la fecha de creación como fecha de entrada por defecto
UPDATE public.productos SET fecha_entrada = to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

-- Hacer la columna NOT NULL después de haber llenado los datos existentes
ALTER TABLE public.productos ALTER COLUMN fecha_entrada SET NOT NULL;