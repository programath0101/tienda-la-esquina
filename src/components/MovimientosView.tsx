import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowDownLeft, ArrowUpRight, ChevronDown } from 'lucide-react';
import {
  formatearFechaMovimiento,
  supabase,
  type Movimiento,
  type TipoMovimiento,
  type VistaProducto,
} from '../lib/supabase';

interface MovimientosViewProps {
  onMovimientoRegistrado: () => void;
}

interface ErroresMovimiento {
  productoId?: string;
  cantidad?: string;
}

export function MovimientosView({ onMovimientoRegistrado }: MovimientosViewProps) {
  const [productos, setProductos] = useState<VistaProducto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [productoId, setProductoId] = useState<string>('');
  const [tipo, setTipo] = useState<TipoMovimiento>('entrada');
  const [cantidad, setCantidad] = useState<string>('');
  const [nota, setNota] = useState<string>('');

  const [errores, setErrores] = useState<ErroresMovimiento>({});
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState<boolean>(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);

    const [resProductos, resMovimientos] = await Promise.all([
      supabase
        .from('vista_productos')
        .select('id, nombre, categoria, categoria_id, precio, stock_actual, stock_minimo, stock_bajo')
        .order('nombre', { ascending: true }),
      supabase
        .from('movimientos')
        .select('id, producto_id, tipo, cantidad, nota, creado_en')
        .order('creado_en', { ascending: false }),
    ]);

    const primerError = resProductos.error || resMovimientos.error;

    if (primerError) {
      setErrorCarga(
        primerError.message || 'No se pudieron cargar los movimientos desde Supabase.'
      );
      setCargando(false);
      return;
    }

    const listaProductos = (resProductos.data as VistaProducto[]) ?? [];
    setProductos(listaProductos);
    setMovimientos((resMovimientos.data as Movimiento[]) ?? []);
    setProductoId((actual) => {
      if (actual && listaProductos.some((p) => String(p.id) === actual)) {
        return actual;
      }
      return '';
    });
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const nombresPorProducto = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const producto of productos) {
      mapa.set(String(producto.id), producto.nombre);
    }
    return mapa;
  }, [productos]);

  async function manejarRegistro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorRegistro(null);

    const nuevosErrores: ErroresMovimiento = {};
    const productoElegido = productos.find((p) => String(p.id) === productoId);

    if (!productoId || !productoElegido) {
      nuevosErrores.productoId = 'Falta el producto. Elige uno de la lista.';
    }

    const cantidadLimpia = cantidad.trim();
    const cantidadNumero = Number(cantidadLimpia);
    if (
      !cantidadLimpia ||
      !Number.isFinite(cantidadNumero) ||
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      nuevosErrores.cantidad = 'Cantidad inválida. Ingresa un número entero mayor que 0.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setRegistrando(true);

    const notaLimpia = nota.trim();

    const { error } = await supabase.from('movimientos').insert({
      producto_id: productoElegido!.id,
      tipo,
      cantidad: cantidadNumero,
      nota: notaLimpia || null,
    });

    setRegistrando(false);

    if (error) {
      setErrorRegistro(error.message);
      return;
    }

    setProductoId('');
    setTipo('entrada');
    setCantidad('');
    setNota('');
    setErrorRegistro(null);

    await cargarDatos();
    onMovimientoRegistrado();
  }

  return (
    <section aria-labelledby="titulo-movimientos" className="space-y-6">
      <div className="space-y-1">
        <h1
          id="titulo-movimientos"
          className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl"
        >
          Registrar movimiento
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#475569]">
          Una entrada suma al stock; una salida resta.
        </p>
      </div>

      {errorCarga && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 text-[#B91C1C] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold">No se pudieron cargar los datos desde Supabase.</p>
              <p className="font-mono text-xs text-[#991B1B]">{errorCarga}</p>
              <p className="text-xs text-[#991B1B]">
                Revisa tu conexión a internet o pulsa «Reintentar carga».
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void cargarDatos()}
            className="min-h-[44px] shrink-0 self-start whitespace-nowrap rounded-md border border-[#FCA5A5] bg-white px-3.5 py-2 text-sm font-medium text-[#B91C1C] transition-colors duration-150 hover:bg-[#FEE2E2] sm:min-h-[40px] sm:self-center"
          >
            Reintentar carga
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <form
          onSubmit={(e) => void manejarRegistro(e)}
          noValidate
          className="rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6 lg:col-span-5"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="movimiento-producto"
                className="block text-sm font-medium text-[#111827]"
              >
                Producto <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <div className="relative mt-1.5">
                <select
                  id="movimiento-producto"
                  disabled={cargando}
                  value={productoId}
                  onChange={(e) => {
                    setProductoId(e.target.value);
                    if (errores.productoId) {
                      setErrores((prev) => ({ ...prev, productoId: undefined }));
                    }
                    if (errorRegistro) {
                      setErrorRegistro(null);
                    }
                  }}
                  aria-invalid={Boolean(errores.productoId)}
                  aria-describedby={errores.productoId ? 'error-mov-producto' : undefined}
                  className={`min-h-[44px] w-full appearance-none rounded-md border py-2 pl-3 pr-9 text-sm text-[#111827] disabled:bg-[#F7F8FA] disabled:text-[#475569] sm:min-h-[40px] ${
                    errores.productoId
                      ? 'border-[#FCA5A5] bg-[#FEF2F2]/40'
                      : 'border-[#E2E8F0] bg-white'
                  }`}
                >
                  <option value="">
                    {cargando ? 'Cargando productos...' : 'Selecciona un producto'}
                  </option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={String(producto.id)}>
                      {producto.nombre} (stock: {producto.stock_actual})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]"
                  aria-hidden="true"
                />
              </div>
              {errores.productoId && (
                <p id="error-mov-producto" className="mt-1.5 text-xs font-medium text-[#B91C1C]">
                  {errores.productoId}
                </p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-[#111827]">
                Tipo <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </span>
              <div
                role="group"
                aria-label="Tipo de movimiento"
                className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-md border border-[#E2E8F0] bg-[#F7F8FA] p-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    setTipo('entrada');
                    if (errorRegistro) setErrorRegistro(null);
                  }}
                  aria-pressed={tipo === 'entrada'}
                  className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium transition-colors duration-150 sm:min-h-[38px] ${
                    tipo === 'entrada'
                      ? 'border border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                      : 'text-[#475569] hover:text-[#111827]'
                  }`}
                >
                  <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Entrada</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipo('salida');
                    if (errorRegistro) setErrorRegistro(null);
                  }}
                  aria-pressed={tipo === 'salida'}
                  className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium transition-colors duration-150 sm:min-h-[38px] ${
                    tipo === 'salida'
                      ? 'border border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'
                      : 'text-[#475569] hover:text-[#111827]'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  <span>Salida</span>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="movimiento-cantidad"
                className="block text-sm font-medium text-[#111827]"
              >
                Cantidad <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <input
                id="movimiento-cantidad"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={cantidad}
                onChange={(e) => {
                  setCantidad(e.target.value);
                  if (errores.cantidad) {
                    setErrores((prev) => ({ ...prev, cantidad: undefined }));
                  }
                  if (errorRegistro) {
                    setErrorRegistro(null);
                  }
                }}
                placeholder="Ej. 5"
                aria-invalid={Boolean(errores.cantidad)}
                aria-describedby={errores.cantidad ? 'error-mov-cantidad' : undefined}
                className={`mt-1.5 min-h-[44px] w-full rounded-md border px-3 py-2 font-mono text-sm tabular-nums text-[#111827] placeholder:text-[#475569] sm:min-h-[40px] ${
                  errores.cantidad
                    ? 'border-[#FCA5A5] bg-[#FEF2F2]/40'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              />
              {errores.cantidad && (
                <p id="error-mov-cantidad" className="mt-1.5 text-xs font-medium text-[#B91C1C]">
                  {errores.cantidad}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="movimiento-nota"
                className="block text-sm font-medium text-[#111827]"
              >
                Nota <span className="text-xs font-normal text-[#475569]">(opcional)</span>
              </label>
              <input
                id="movimiento-nota"
                type="text"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej. Ventas del día o Pedido al proveedor"
                className="mt-1.5 min-h-[44px] w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#475569] sm:min-h-[40px]"
              />
            </div>

            {errorRegistro && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-md border border-[#FECACA] bg-[#FEF2F2] p-3.5 text-sm text-[#B91C1C]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-medium">{errorRegistro}</p>
                  <p className="text-xs text-[#991B1B]">
                    Ajusta la cantidad o registra primero una entrada de mercancía.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={registrando || cargando || productos.length === 0}
                className="min-h-[44px] whitespace-nowrap rounded-md bg-[#1D4ED8] px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[40px]"
              >
                {registrando
                  ? 'Registrando...'
                  : tipo === 'entrada'
                    ? 'Registrar entrada'
                    : 'Registrar salida'}
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg border border-[#E2E8F0] border-t-2 border-t-[#1D4ED8] bg-white lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-base font-semibold text-[#111827]">
              Historial de movimientos
            </h2>
            {!cargando && (
              <span className="font-mono text-xs tabular-nums text-[#475569]">
                {movimientos.length}{' '}
                {movimientos.length === 1 ? 'registro' : 'registros'}
              </span>
            )}
          </div>

          {cargando ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F7F8FA] text-xs font-semibold text-[#475569]">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-right">Cant.</th>
                    <th className="px-4 py-3">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {[1, 2, 3, 4].map((fila) => (
                    <tr key={fila}>
                      <td className="px-4 py-3.5">
                        <div className="h-4 w-20 rounded bg-[#E2E8F0]/70" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="h-4 w-32 rounded bg-[#E2E8F0]/70" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="h-5 w-14 rounded bg-[#E2E8F0]/60" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="ml-auto h-4 w-8 rounded bg-[#E2E8F0]/60" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="h-4 w-28 rounded bg-[#E2E8F0]/60" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-[#111827]">
                Todavía no hay movimientos registrados.
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                Usa el formulario para anotar la primera entrada o salida de mercancía.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F7F8FA] text-xs font-semibold text-[#475569]">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-right">Cant.</th>
                    <th className="px-4 py-3">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {movimientos.map((mov) => {
                    const nombreProducto =
                      nombresPorProducto.get(String(mov.producto_id)) ??
                      `Producto #${mov.producto_id}`;

                    return (
                      <tr
                        key={mov.id}
                        className="transition-colors duration-150 hover:bg-[#F7F8FA]"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs tabular-nums text-[#475569]">
                          {formatearFechaMovimiento(mov.creado_en)}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#111827]">
                          {nombreProducto}
                        </td>
                        <td className="px-4 py-3">
                          {mov.tipo === 'entrada' ? (
                            <span className="inline-block whitespace-nowrap rounded border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#15803D]">
                              Entrada
                            </span>
                          ) : (
                            <span className="inline-block whitespace-nowrap rounded border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 text-xs font-medium text-[#B45309]">
                              Salida
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-[#111827]">
                          {mov.cantidad}
                        </td>
                        <td className="px-4 py-3 text-[#475569]">
                          {mov.nota ? mov.nota : <span className="text-[#475569]">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
