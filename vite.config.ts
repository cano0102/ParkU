import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { tablerIconsPorArchivo } from './vite.plugins'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

const SRC_DIR = path.resolve(__dirname, 'src').replace(/\\/g, '/')

/**
 * Librerías que van en su propio chunk con nombre fijo. Motivo: caché entre deploys —
 * cada build cambia el hash de casi todo el código de la app, pero React/router/query no
 * cambian de un deploy a otro, así que separándolos el navegador los reutiliza y solo
 * descarga lo que sí cambió. Además, con todo en un solo chunk de entrada la app inicial
 * pesaba 600 kB (173 kB gzip); ver `treeshake.moduleSideEffects` abajo.
 */
const VENDOR_CHUNKS: Record<string, string[]> = {
  'vendor-react': ['react', 'react-dom', 'scheduler'],
  'vendor-router': ['react-router', 'react-router-dom'],
  'vendor-query': ['@tanstack/query-core', '@tanstack/react-query', '@tanstack/query-persist-client-core', '@tanstack/react-query-persist-client', '@tanstack/query-sync-storage-persister'],
  'vendor-ui': ['sonner', 'next-themes'],
}

function vendorChunkDe(id: string): string | undefined {
  const m = id.replace(/\\/g, '/').match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)
  if (!m) return undefined
  const pkg = m[1]
  for (const [chunk, pkgs] of Object.entries(VENDOR_CHUNKS)) {
    if (pkgs.includes(pkg)) return chunk
  }
  return undefined
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    tablerIconsPorArchivo(),
  ],
  optimizeDeps: {
    // Con los iconos importados archivo por archivo (ver vite.plugins.ts), el paquete entero no
    // debe pre-empaquetarse: cada icono se sirve como el módulo ESM pequeño que ya es.
    exclude: ['@tabler/icons-react'],
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  define: {
    // Invalida la caché de React Query guardada en localStorage en cada despliegue (ver
    // services/core/cacheQueries.ts): un cambio en la forma de los datos nunca choca con
    // una copia vieja.
    __APP_BUILD_ID__: JSON.stringify(String(Date.now())),
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunkDe,
      },
      treeshake: {
        /**
         * Trata a todo módulo propio (src/) como libre de efectos secundarios al importarse.
         *
         * Sin esto, las páginas `lazy()` no se separaban de verdad: cada feature exporta sus
         * hooks por su barril `index.ts` junto a su página, y el layout (que sí va en el chunk
         * inicial) importa `@/features/reservas` solo por `useReservas`. Rollup no puede
         * demostrar que `export const X = memo(...)` de la página no tiene efectos al
         * evaluarse, así que arrastraba ReservasPage → ConductoresPage → ParqueaderosPage →
         * tesseract.js… al chunk inicial aunque nada de eso se usara ahí (600 kB). Con esta
         * regla, un módulo de src/ del que no se usa ninguna exportación se descarta.
         *
         * Ningún módulo de src/ depende de ejecutarse solo por ser importado: la única
         * importación por efecto es el CSS de main.tsx, y esa se excluye explícitamente.
         */
        moduleSideEffects: (id, external) => {
          if (external) return true
          const normalizado = id.replace(/\\/g, '/')
          if (!normalizado.startsWith(SRC_DIR + '/')) return true
          return /\.css(\?|$)/.test(normalizado)
        },
      },
    },
    // Ya se mide en el análisis de bundle cuando hace falta; calcularlo en cada build lo
    // alarga varios segundos sin cambiar el resultado.
    reportCompressedSize: false,
  },
})
