import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, ChevronDown, Info } from 'lucide-react';
import { supabase, type Categoria } from '../lib/supabase';

interface NuevoProductoViewProps {
  onCancelar: () => void;
  onGuardado: () => void;
}

interface ErroresFormulario {
  nombre?: string;
  categoriaId?: string;
  precio?: string;
  stockMinimo?: string;
}

export function NuevoProductoView({
  onCancelar,
  onGuardado,
}: NuevoProductoViewProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState<boolean>(true);
  const [errorSupabase, setErrorSupabase] = useState<string | null>(null);

  const [nombre, setNombre] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [precio, setPrecio] = useState<string>('');
  const [stockMinimo, setStockMinimo] = useState<string>('');

  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [guardando, setGuardando] = useState<boolean>(false);

  useEffect(() => {
    let activo = true;

    async function cargarCategorias() {
      setCargandoCategorias(true);
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nombre')
        .order('nombre', { ascending: true });

      if (!activo) return;

      if (error) {
        setErrorSupabase(error.message);
      } else {
        setCategorias((data as Categoria[]) ?? []);
      }
      setCargandoCategorias(false);
    }

    void cargarCategorias();

    return () => {
      activo = false;
    };
  }, []);

  async function manejarEnvio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorSupabase(null);

    const nuevosErrores: ErroresFormulario = {};

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      nuevosErrores.nombre = 'Falta el nombre. Escribe cómo se llama el producto.';
    }

    const categoriaElegida = categorias.find(
      (cat) => String(cat.id) === categoriaId
    );
    if (!categoriaId || !categoriaElegida) {
      nuevosErrores.categoriaId = 'Falta la categoría. Elige una opción de la lista.';
    }

    const precioLimpio = precio.trim();
    const precioNumero = Number(precioLimpio);
    if (
      !precioLimpio ||
      !Number.isFinite(precioNumero) ||
      !Number.isInteger(precioNumero) ||
      precioNumero <= 0
    ) {
      nuevosErrores.precio = 'Precio inválido. Ingresa un número entero mayor a 0.';
    }

    const stockMinimoLimpio = stockMinimo.trim();
    const stockMinimoNumero = Number(stockMinimoLimpio);
    if (
      stockMinimoLimpio === '' ||
      !Number.isFinite(stockMinimoNumero) ||
      !Number.isInteger(stockMinimoNumero) ||
      stockMinimoNumero < 0
    ) {
      nuevosErrores.stockMinimo =
        'Stock mínimo inválido. Ingresa un número entero igual o mayor a 0.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setGuardando(true);

    const { error } = await supabase.from('productos').insert({
      nombre: nombreLimpio,
      categoria_id: categoriaElegida!.id,
      precio: precioNumero,
      stock_actual: 0,
      stock_minimo: stockMinimoNumero,
    });

    setGuardando(false);

    if (error) {
      setErrorSupabase(error.message);
      return;
    }

    onGuardado();
  }

  return (
    <section aria-labelledby="titulo-nuevo-producto" className="space-y-6">
      <div className="space-y-2">
        <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-sm text-[#475569]">
          <button
            type="button"
            onClick={onCancelar}
            className="font-medium text-[#475569] transition-colors duration-150 hover:text-[#111827] hover:underline"
          >
            Inventario
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[#111827]">Nuevo producto</span>
        </nav>

        <h1
          id="titulo-nuevo-producto"
          className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl"
        >
          Nuevo producto
        </h1>
      </div>

      <form
        onSubmit={(e) => void manejarEnvio(e)}
        noValidate
        className="max-w-xl rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="campo-nombre"
              className="block text-sm font-medium text-[#111827]"
            >
              Nombre <span className="text-[#B91C1C]" aria-hidden="true">*</span>
            </label>
            <input
              id="campo-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errores.nombre) {
                  setErrores((prev) => ({ ...prev, nombre: undefined }));
                }
              }}
              placeholder="Ej. Aceite 1 L"
              aria-invalid={Boolean(errores.nombre)}
              aria-describedby={errores.nombre ? 'error-nombre' : undefined}
              className={`mt-1.5 min-h-[44px] w-full rounded-md border px-3 py-2 text-sm text-[#111827] placeholder:text-[#475569] sm:min-h-[40px] ${
                errores.nombre
                  ? 'border-[#FCA5A5] bg-[#FEF2F2]/40'
                  : 'border-[#E2E8F0] bg-white'
              }`}
            />
            {errores.nombre && (
              <p id="error-nombre" className="mt-1.5 text-xs font-medium text-[#B91C1C]">
                {errores.nombre}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="campo-categoria"
              className="block text-sm font-medium text-[#111827]"
            >
              Categoría <span className="text-[#B91C1C]" aria-hidden="true">*</span>
            </label>
            <div className="relative mt-1.5">
              <select
                id="campo-categoria"
                required
                disabled={cargandoCategorias}
                value={categoriaId}
                onChange={(e) => {
                  setCategoriaId(e.target.value);
                  if (errores.categoriaId) {
                    setErrores((prev) => ({ ...prev, categoriaId: undefined }));
                  }
                }}
                aria-invalid={Boolean(errores.categoriaId)}
                aria-describedby={errores.categoriaId ? 'error-categoria' : undefined}
                className={`min-h-[44px] w-full appearance-none rounded-md border py-2 pl-3 pr-9 text-sm text-[#111827] disabled:bg-[#F7F8FA] disabled:text-[#475569] sm:min-h-[40px] ${
                  errores.categoriaId
                    ? 'border-[#FCA5A5] bg-[#FEF2F2]/40'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              >
                <option value="">
                  {cargandoCategorias
                    ? 'Cargando categorías...'
                    : 'Selecciona una categoría'}
                </option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={String(categoria.id)}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]"
                aria-hidden="true"
              />
            </div>
            {errores.categoriaId && (
              <p id="error-categoria" className="mt-1.5 text-xs font-medium text-[#B91C1C]">
                {errores.categoriaId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="campo-precio"
                className="block text-sm font-medium text-[#111827]"
              >
                Precio de venta <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <div className="relative mt-1.5">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#475569]"
                >
                  $
                </span>
                <input
                  id="campo-precio"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  required
                  value={precio}
                  onChange={(e) => {
                    setPrecio(e.target.value);
                    if (errores.precio) {
                      setErrores((prev) => ({ ...prev, precio: undefined }));
                    }
                  }}
                  placeholder="12500"
                  aria-invalid={Boolean(errores.precio)}
                  aria-describedby={errores.precio ? 'error-precio' : undefined}
                  className={`min-h-[44px] w-full rounded-md border py-2 pl-7 pr-3 font-mono text-sm tabular-nums text-[#111827] placeholder:text-[#475569] sm:min-h-[40px] ${
                    errores.precio
                      ? 'border-[#FCA5A5] bg-[#FEF2F2]/40'
                      : 'border-[#E2E8F0] bg-white'
                  }`}
                />
              </div>
              {errores.precio && (
                <p id="error-precio" className="mt-1.5 text-xs font-medium text-[#B91C1C]">
                  {errores.precio}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="campo-stock-minimo"
                className="block text-sm font-medium text-[#111827]"
              >
                Stock mínimo <span className="text-[#B91C1C]" aria-hidden="true">*</span>
              </label>
              <input
                id="campo-stock-minimo"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                required
                value={stockMinimo}
                onChange={(e) => {
                  setStockMinimo(e.target.value);
                  if (errores.stockMinimo) {
                    setErrores((prev) => ({ ...prev, stockMinimo: undefined }));
                  }
                }}
                placeholder="4"
                aria-invalid={Boolean(errores.stockMinimo)}
                aria-describedby={
                  errores.stockMinimo ? 'error-stock-minimo' : 'ayuda-stock-minimo'
                }
                className={`mt-1.5 min-h-[44px] w-full rounded-md border px-3 py-2 font-mono text-sm tabular-nums text-[#111827] placeholder:text-[#475569] sm:min-h-[40px] ${
                  errores.stockMinimo
                    ? 'border-[#FCA5A5] bg-[#FEF2F2]/40'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              />
              {errores.stockMinimo ? (
                <p id="error-stock-minimo" className="mt-1.5 text-xs font-medium text-[#B91C1C]">
                  {errores.stockMinimo}
                </p>
              ) : (
                <p id="ayuda-stock-minimo" className="mt-1.5 text-xs text-[#475569]">
                  Por debajo o igual a este número sale la alerta.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] p-3.5 text-sm text-[#1E40AF]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              El producto empieza con stock 0. El stock solo cambia cuando registras una entrada o una salida.
            </p>
          </div>

          {errorSupabase && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-[#FECACA] bg-[#FEF2F2] p-3.5 text-sm text-[#B91C1C]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-semibold">No se pudo guardar el producto en Supabase.</p>
                <p className="font-mono text-xs text-[#991B1B]">{errorSupabase}</p>
                <p className="text-xs text-[#991B1B]">
                  Revisa los datos ingresados o tu conexión e intenta guardar de nuevo.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancelar}
              disabled={guardando}
              className="min-h-[44px] whitespace-nowrap rounded-md border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors duration-150 hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[40px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || cargandoCategorias}
              className="min-h-[44px] whitespace-nowrap rounded-md bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[40px]"
            >
              {guardando ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
