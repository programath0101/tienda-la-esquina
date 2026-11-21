import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, Plus, Search } from 'lucide-react';
import {
  formatearPesos,
  supabase,
  type Categoria,
  type VistaProducto,
} from '../lib/supabase';

export function InventarioView() {
  const [productos, setProductos] = useState<VistaProducto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [totalMovimientos, setTotalMovimientos] = useState<number>(0);

  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');

  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const cargarInventario = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);

    const [resProductos, resCategorias, resMovimientos] = await Promise.all([
      supabase
        .from('vista_productos')
        .select('id, nombre, categoria, categoria_id, precio, stock_actual, stock_minimo, stock_bajo')
        .order('nombre', { ascending: true }),
      supabase.from('categorias').select('id, nombre').order('nombre', { ascending: true }),
      supabase.from('movimientos').select('id', { count: 'exact', head: true }),
    ]);

    const primerError = resProductos.error || resCategorias.error || resMovimientos.error;

    if (primerError) {
      setErrorCarga(
        primerError.message || 'No se pudieron cargar los datos del inventario desde Supabase.'
      );
      setCargando(false);
      return;
    }

    setProductos((resProductos.data as VistaProducto[]) ?? []);
    setCategorias((resCategorias.data as Categoria[]) ?? []);
    setTotalMovimientos(resMovimientos.count ?? 0);
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargarInventario();
  }, [cargarInventario]);

  const totalProductos = productos.length;
  const totalStockBajo = useMemo(
    () => productos.filter((producto) => producto.stock_bajo).length,
    [productos]
  );

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideNombre =
        termino === '' || producto.nombre.toLowerCase().includes(termino);
      const coincideCategoria =
        categoriaSeleccionada === 'todas' ||
        String(producto.categoria_id) === categoriaSeleccionada;

      return coincideNombre && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  const hayFiltrosActivos = busqueda.trim() !== '' || categoriaSeleccionada !== 'todas';

  return (
    <section aria-labelledby="titulo-inventario" className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1
            id="titulo-inventario"
            className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl"
          >
            Inventario
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#475569]">
            Lo que hay en la tienda y lo que toca pedir.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#1E40AF]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Nuevo producto</span>
        </button>
      </div>

      {errorCarga && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 text-[#B91C1C] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="space-y-0.5 text-sm">
              <p className="font-semibold">No se pudo cargar el inventario desde Supabase.</p>
              <p className="font-mono text-xs text-[#991B1B]">{errorCarga}</p>
              <p className="text-xs text-[#991B1B]">
                Verifica tu conexión o vuelve a consultar para actualizar los datos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void cargarInventario()}
            className="min-h-[40px] shrink-0 self-start whitespace-nowrap rounded-md border border-[#FCA5A5] bg-white px-3 py-1.5 text-sm font-medium text-[#B91C1C] transition-colors duration-150 hover:bg-[#FEE2E2] sm:self-center"
          >
            Reintentar carga
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-4">
          <p className="text-sm font-medium text-[#475569]">Productos</p>
          <p className="mt-1.5 font-mono text-3xl font-semibold tabular-nums text-[#111827]">
            {cargando ? '—' : totalProductos}
          </p>
        </div>

        <div
          className={`rounded-lg border px-5 py-4 ${
            !cargando && totalStockBajo > 0
              ? 'border-[#FECACA] bg-[#FEF2F2]'
              : 'border-[#E2E8F0] bg-white'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              !cargando && totalStockBajo > 0 ? 'text-[#991B1B]' : 'text-[#475569]'
            }`}
          >
            Con stock bajo
          </p>
          <p
            className={`mt-1.5 font-mono text-3xl font-semibold tabular-nums ${
              !cargando && totalStockBajo > 0 ? 'text-[#B91C1C]' : 'text-[#111827]'
            }`}
          >
            {cargando ? '—' : totalStockBajo}
          </p>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-4">
          <p className="text-sm font-medium text-[#475569]">Movimientos registrados</p>
          <p className="mt-1.5 font-mono text-3xl font-semibold tabular-nums text-[#111827]">
            {cargando ? '—' : totalMovimientos}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <label htmlFor="buscador-productos" className="sr-only">
            Buscar producto por nombre
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
          <input
            id="buscador-productos"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre..."
            className="min-h-[40px] w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm text-[#111827] placeholder:text-[#64748B]"
          />
        </div>

        <div className="relative sm:w-56">
          <label htmlFor="filtro-categoria" className="sr-only">
            Filtrar por categoría
          </label>
          <select
            id="filtro-categoria"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="min-h-[40px] w-full appearance-none rounded-md border border-[#E2E8F0] bg-white py-2 pl-3 pr-9 text-sm text-[#111827]"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={String(categoria.id)}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            aria-hidden="true"
          />
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={() => {
              setBusqueda('');
              setCategoriaSeleccionada('todas');
            }}
            className="min-h-[40px] self-start whitespace-nowrap px-2 text-sm font-medium text-[#1D4ED8] hover:underline sm:self-auto"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-[#E2E8F0] border-t-2 border-t-[#1D4ED8] bg-white">
        {cargando ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F7F8FA] text-xs font-semibold text-[#475569]">
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Mínimo</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {[1, 2, 3, 4, 5].map((fila) => (
                  <tr key={fila}>
                    <td className="px-5 py-3.5">
                      <div className="h-4 w-36 rounded bg-[#E2E8F0]/70" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-20 rounded bg-[#E2E8F0]/60" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="ml-auto h-4 w-16 rounded bg-[#E2E8F0]/60" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="ml-auto h-4 w-8 rounded bg-[#E2E8F0]/60" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="ml-auto h-4 w-8 rounded bg-[#E2E8F0]/60" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="h-5 w-16 rounded bg-[#E2E8F0]/60" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : productos.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-[#111827]">
              Todavía no hay productos registrados en el inventario.
            </p>
            <p className="mt-1 text-sm text-[#475569]">
              Cuando agregues productos aparecerán aquí con su precio, existencias y alertas.
            </p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-[#111827]">
              Ningún producto coincide con esa búsqueda o categoría.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                setCategoriaSeleccionada('todas');
              }}
              className="mt-3 min-h-[40px] whitespace-nowrap rounded-md border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-medium text-[#111827] transition-colors duration-150 hover:bg-[#F7F8FA]"
            >
              Mostrar todos los productos
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F7F8FA] text-xs font-semibold text-[#475569]">
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Mínimo</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {productosFiltrados.map((producto) => (
                  <tr
                    key={producto.id}
                    className="transition-colors duration-150 hover:bg-[#F7F8FA]"
                  >
                    <td className="px-5 py-3 font-medium text-[#111827]">
                      {producto.nombre}
                    </td>
                    <td className="px-4 py-3 text-[#475569]">{producto.categoria}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#111827]">
                      {formatearPesos(producto.precio)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-medium tabular-nums ${
                        producto.stock_bajo ? 'text-[#B91C1C]' : 'text-[#111827]'
                      }`}
                    >
                      {producto.stock_actual}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#475569]">
                      {producto.stock_minimo}
                    </td>
                    <td className="px-5 py-3">
                      {producto.stock_bajo ? (
                        <span className="inline-block whitespace-nowrap rounded border border-[#FECACA] bg-[#FEF2F2] px-2 py-0.5 text-xs font-medium text-[#B91C1C]">
                          Stock bajo
                        </span>
                      ) : (
                        <span className="inline-block whitespace-nowrap rounded border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#15803D]">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
