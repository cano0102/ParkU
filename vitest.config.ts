import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      // Umbrales diferenciados por carpeta (Fase 8), no uno global: la capa
      // más baja y más reutilizada (services/core, components/shared) exige
      // el estándar más alto porque un bug ahí se propaga a todo lo demás;
      // features/ tolera menos cobertura porque es la capa más grande y de
      // menor radio de impacto por archivo individual.
      thresholds: {
        'src/services/core/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/components/shared/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/services/api/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
        'src/features/**': { statements: 70, branches: 70, functions: 70, lines: 70 },
      },
    },
  },
})
