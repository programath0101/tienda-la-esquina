import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../config';

export interface Categoria {
  id: number | string;
  nombre: string;
}

export interface VistaProducto {
  id: number | string;
  nombre: string;
  categoria: string;
  categoria_id: number | string;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  stock_bajo: boolean;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export function formatearPesos(valor: number): string {
  const entero = Math.round(valor);
  const negativo = entero < 0;
  const digitos = Math.abs(entero)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negativo ? '-' : ''}$${digitos}`;
}
