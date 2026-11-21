# Tienda La Esquina

Aplicación web en español para llevar el control de inventario de una tienda de barrio a partir de las entradas y salidas de mercancía, con alertas automáticas cuando un producto está por acabarse.

## Qué hace la app

- Consulta el inventario actual desde Supabase y calcula los productos con stock bajo (`stock_actual <= stock_minimo`).
- Permite buscar productos por nombre y filtrarlos por categoría.
- Crea productos nuevos con stock inicial `0` (el stock nunca se edita manualmente).
- Registra entradas y salidas de mercancía: un trigger en la base de datos actualiza el stock y rechaza salidas mayores a las unidades disponibles.

## Ventanas

1. **Inventario (V1)**: muestra tres indicadores (total de productos, productos con stock bajo y movimientos registrados), buscador por nombre, filtro por categoría y tabla de productos leída desde `vista_productos` con precios en pesos colombianos (`$12.500`).
2. **Nuevo producto (V2)**: formulario con los campos obligatorios nombre, categoría, precio de venta y stock mínimo. Crea el producto con `stock_actual = 0` y vuelve al inventario recargando los datos.
3. **Movimientos (V3)**: formulario para registrar una `Entrada` o `Salida` indicando producto (con su stock actual), cantidad y nota opcional, junto con el historial ordenado del movimiento más reciente al más antiguo.

## Variables de entorno

La aplicación lee la configuración de Supabase desde `src/config.ts` usando las siguientes variables públicas de Vite:

- `VITE_SUPABASE_URL`: URL del proyecto en Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: llave pública (`publishable key`) del proyecto en Supabase.

Copia `.env.example` a `.env` y completa ambos valores antes de ejecutar en tu entorno local o configurarlos en Vercel:

```bash
cp .env.example .env
```

## Cómo correrla en local

```bash
npm install
npm run dev
```

Para generar la versión de producción (solo cliente, lista para publicar en Vercel):

```bash
npm run build
```
