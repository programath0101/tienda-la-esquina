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

export type TipoMovimiento = 'entrada' | 'salida';

export interface Movimiento {
  id: number | string;
  producto_id: number | string;
  tipo: TipoMovimiento;
  cantidad: number;
  nota: string | null;
  creado_en: string;
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

export function formatearFechaMovimiento(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return iso;
  }

  const ahora = new Date();
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const inicioAyer = new Date(inicioHoy);
  inicioAyer.setDate(inicioHoy.getDate() - 1);

  const inicioFecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const hora = fecha.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (inicioFecha.getTime() === inicioHoy.getTime()) {
    return `Hoy ${hora}`;
  }
  if (inicioFecha.getTime() === inicioAyer.getTime()) {
    return `Ayer ${hora}`;
  }

  const diaMes = fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  });
  return `${diaMes} ${hora}`;
}
