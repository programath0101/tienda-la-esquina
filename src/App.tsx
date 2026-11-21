import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BookOpen, RefreshCw } from 'lucide-react';
import { supabase, type Categoria } from './lib/supabase';

type VistaActiva = 'inventario' | 'movimientos';

export default function App() {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('inventario');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState<boolean>(true);
  const [errorConexion, setErrorConexion] = useState<string | null>(null);

  const cargarCategorias = useCallback(async () => {
    setCargandoCategorias(true);
    setErrorConexion(null);

    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) {
      setCategorias([]);
      setErrorConexion(
        error.message || 'No se pudo consultar la tabla categorias en Supabase.'
      );
    } else {
      setCategorias(data ?? []);
    }

    setCargandoCategorias(false);
  }, []);

  useEffect(() => {
    void cargarCategorias();
  }, [cargarCategorias]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-6 sm:gap-8">
            <a
              href="#inventario"
              onClick={(e) => {
                e.preventDefault();
                setVistaActiva('inventario');
              }}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-lg font-bold tracking-tight text-[#111827]"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1D4ED8] text-white"
              >
                <BookOpen className="h-4 w-4" />
              </span>
              <span>Tienda La Esquina</span>
            </a>

            <nav aria-label="Navegación principal" className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setVistaActiva('inventario')}
                aria-current={vistaActiva === 'inventario' ? 'page' : undefined}
                className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  vistaActiva === 'inventario'
                    ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'text-[#475569] hover:bg-[#F7F8FA] hover:text-[#111827]'
                }`}
              >
                Inventario
              </button>
              <button
                type="button"
                onClick={() => setVistaActiva('movimientos')}
                aria-current={vistaActiva === 'movimientos' ? 'page' : undefined}
                className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  vistaActiva === 'movimientos'
                    ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'text-[#475569] hover:bg-[#F7F8FA] hover:text-[#111827]'
                }`}
              >
                Movimientos
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {vistaActiva === 'inventario' ? (
          <section aria-labelledby="titulo-inventario" className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <h1
                  id="titulo-inventario"
                  className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl"
                >
                  Inventario
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-[#475569]">
                  Esqueleto inicial y prueba de conexión con Supabase.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void cargarCategorias()}
                disabled={cargandoCategorias}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-medium text-[#111827] transition-colors duration-150 hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 text-[#475569] ${cargandoCategorias ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>Volver a consultar</span>
              </button>
            </div>

            {errorConexion && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 text-[#B91C1C] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div className="space-y-0.5 text-sm">
                    <p className="font-semibold">
                      Error al conectar con Supabase para leer las categorías.
                    </p>
                    <p className="font-mono text-xs text-[#991B1B]">{errorConexion}</p>
                    <p className="text-xs text-[#991B1B]">
                      Revisa la URL, la publishable key en configuración o las políticas de lectura de la tabla categorias.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void cargarCategorias()}
                  className="min-h-[40px] shrink-0 self-start whitespace-nowrap rounded-md border border-[#FCA5A5] bg-white px-3 py-1.5 text-sm font-medium text-[#B91C1C] transition-colors duration-150 hover:bg-[#FEE2E2] sm:self-center"
                >
                  Reintentar conexión
                </button>
              </div>
            )}

            <div className="overflow-hidden rounded-lg border border-[#E2E8F0] border-t-2 border-t-[#1D4ED8] bg-white">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3.5">
                <h2 className="text-base font-semibold text-[#111827]">
                  Categorías en el cuaderno
                </h2>
                {!cargandoCategorias && !errorConexion && (
                  <span className="font-mono text-xs tabular-nums text-[#475569]">
                    {categorias.length}{' '}
                    {categorias.length === 1 ? 'categoría' : 'categorías'}
                  </span>
                )}
              </div>

              {cargandoCategorias ? (
                <ul className="divide-y divide-[#E2E8F0]" aria-label="Cargando categorías">
                  {[1, 2, 3, 4].map((fila) => (
                    <li key={fila} className="flex items-center justify-between px-5 py-3.5">
                      <div className="h-4 w-36 rounded bg-[#E2E8F0]/70" />
                      <div className="h-4 w-10 rounded bg-[#E2E8F0]/50" />
                    </li>
                  ))}
                </ul>
              ) : errorConexion ? (
                <div className="px-5 py-8 text-sm text-[#475569]">
                  No hay categorías disponibles hasta que se restablezca la conexión.
                </div>
              ) : categorias.length === 0 ? (
                <div className="px-5 py-8 text-sm text-[#475569]">
                  Conexión exitosa, pero la tabla categorias aún no tiene registros.
                </div>
              ) : (
                <ul className="divide-y divide-[#E2E8F0]">
                  {categorias.map((categoria) => (
                    <li
                      key={categoria.id}
                      className="flex items-center px-5 py-3 text-sm font-medium text-[#111827]"
                    >
                      {categoria.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : (
          <section aria-labelledby="titulo-movimientos" className="space-y-4">
            <div className="space-y-1">
              <h1
                id="titulo-movimientos"
                className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl"
              >
                Movimientos
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#475569]">
                Esta sección se construirá en los siguientes pasos para registrar entradas y salidas de mercancía.
              </p>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] border-t-2 border-t-[#1D4ED8] bg-white p-6">
              <p className="text-sm text-[#475569]">
                Mientras tanto, puedes revisar la conexión con la base de datos desde la pestaña Inventario.
              </p>
              <button
                type="button"
                onClick={() => setVistaActiva('inventario')}
                className="mt-4 min-h-[40px] whitespace-nowrap rounded-md bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#1E40AF]"
              >
                Ir a Inventario
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
