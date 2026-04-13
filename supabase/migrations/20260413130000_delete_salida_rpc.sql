-- Restaurar stock al eliminar salida y eliminar en cascada
CREATE OR REPLACE FUNCTION public.delete_salida_restore_stock(p_salida_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- 1. Iterar sobre todos los items de la salida
  FOR v_item IN
    SELECT producto_id, cantidad
    FROM public.salida_items
    WHERE salida_id = p_salida_id
  LOOP
    -- 2. Devolver la cantidad al stock del producto
    UPDATE public.productos
    SET cantidad = cantidad + v_item.cantidad
    WHERE id = v_item.producto_id;
  END LOOP;

  -- 3. Eliminar la salida (esto borrará los salida_items por el ON DELETE CASCADE)
  DELETE FROM public.salidas WHERE id = p_salida_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_salida_restore_stock(UUID) TO anon;
