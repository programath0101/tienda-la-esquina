import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { InventarioView } from './components/InventarioView';

type VistaActiva = 'inventario' | 'movimientos';

export default function App() {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('inventario');

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
          <InventarioView />
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
                Mientras tanto, puedes consultar el inventario completo desde la pestaña Inventario.
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
