import { useState } from 'react';
import { InventarioView } from './components/InventarioView';
import { MovimientosView } from './components/MovimientosView';
import { NuevoProductoView } from './components/NuevoProductoView';

type VistaActiva = 'inventario' | 'nuevo-producto' | 'movimientos';

export default function App() {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('inventario');
  const [recargaInventario, setRecargaInventario] = useState<number>(0);

  const esSeccionInventario =
    vistaActiva === 'inventario' || vistaActiva === 'nuevo-producto';

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <a
            href="#inventario"
            onClick={(e) => {
              e.preventDefault();
              setVistaActiva('inventario');
            }}
            className="shrink-0 whitespace-nowrap py-1 text-lg font-bold tracking-tight text-[#111827]"
          >
            Tienda La Esquina
          </a>

          <nav aria-label="Navegación principal" className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setVistaActiva('inventario')}
              aria-current={esSeccionInventario ? 'page' : undefined}
              className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-150 sm:min-h-[40px] ${
                esSeccionInventario
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
              className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-150 sm:min-h-[40px] ${
                vistaActiva === 'movimientos'
                  ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'text-[#475569] hover:bg-[#F7F8FA] hover:text-[#111827]'
              }`}
            >
              Movimientos
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {vistaActiva === 'inventario' ? (
          <InventarioView
            key={recargaInventario}
            onNuevoProducto={() => setVistaActiva('nuevo-producto')}
          />
        ) : vistaActiva === 'nuevo-producto' ? (
          <NuevoProductoView
            onCancelar={() => setVistaActiva('inventario')}
            onGuardado={() => {
              setRecargaInventario((prev) => prev + 1);
              setVistaActiva('inventario');
            }}
          />
        ) : (
          <MovimientosView
            onMovimientoRegistrado={() => setRecargaInventario((prev) => prev + 1)}
          />
        )}
      </main>
    </div>
  );
}
