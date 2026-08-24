import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';

export default tseslint.config(
  {
    // Scripts sueltos de verificación manual en la raíz (no son parte de la
    // app ni del toolchain) y artefactos de build: fuera del alcance del lint.
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '_tmp_*.mjs', '**/*.d.ts'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}', '*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: {
      'react-hooks': reactHooks,
      boundaries,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
      'boundaries/include': ['src/**/*.{ts,tsx}'],
      'boundaries/elements': [
        // Más específico primero: un hook de dominio dentro de una feature es
        // su propio tipo, para poder permitir el cruce feature -> feature-hook
        // (deuda temporal documentada en docs/CONVENTIONS.md, hasta que la
        // Fase 6 le dé a cada feature un barril index.ts) sin abrir la puerta
        // a que una feature importe páginas/componentes/helpers de otra.
        { type: 'feature-hook', pattern: 'src/features/*/hooks/**', capture: ['feature'] },
        { type: 'feature', pattern: 'src/features/*', mode: 'folder', capture: ['feature'] },
        { type: 'service-core', pattern: 'src/services/core/**' },
        { type: 'service-api', pattern: 'src/services/api/**' },
        { type: 'component', pattern: 'src/components/**' },
        { type: 'util', pattern: 'src/utils/**' },
        { type: 'hook', pattern: 'src/hooks/**' },
        { type: 'context', pattern: 'src/context/**' },
        { type: 'layout', pattern: 'src/layouts/**' },
        { type: 'route', pattern: 'src/routes/**' },
        { type: 'type', pattern: 'src/types/**' },
        { type: 'asset', pattern: 'src/assets/**' },
        { type: 'app', pattern: 'src/{App,App.test,theme,main}.{ts,tsx}', mode: 'file' },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // `catch {}` vacío es un patrón intencional en este código para "mejor
      // esfuerzo, ignora el error" (p. ej. liberar un worker de Tesseract al
      // desmontar) — no es un bug a corregir.
      'no-empty': ['error', { allowEmptyCatch: true }],

      // `const { campoAExcluir, ...resto } = obj` es el patrón estándar para
      // excluir un campo antes de esparcir el resto; el campo destructurado
      // nunca se usa a propósito.
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],

      // El código anterior a este lint (todas las features/ existentes) usa
      // `any` en ~15 puntos puntuales, sobre todo tipos de retorno de
      // librerías externas (Tesseract OCR, el escáner QR). Corregirlos bien
      // requiere tipar esas librerías caso por caso, fuera del alcance de
      // instalar el linter — se deja en 'warn' como deuda visible en vez de
      // bloquear CI por código que ya existía antes de esta regla.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Regla dura de la Fase 1: solo services/ puede importar el SDK de Firebase.
      // (services/core/firebase.ts es la única integración, y hoy no está
      // conectada a ningún flujo activo — todo lo demás corre contra el mock
      // de services/api/auth.ts.)
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['firebase', 'firebase/*'], message: 'Solo src/services/ puede importar el SDK de Firebase.' }] },
      ],

      // Reglas de límites (Fase 4 + Fase 8, "un criterio, cero excepciones"
      // salvo la deuda temporal documentada en docs/CONVENTIONS.md):
      // 1) una feature no puede importar de otra feature — SALVO el hook de
      //    dominio de otra feature (feature-hook), deuda temporal hasta que
      //    la Fase 6 le dé a cada feature un barril index.ts.
      // 2) components/ no puede importar de features/ (ni sus hooks) ni de
      //    services/ (es al revés: las features consumen components/, y las
      //    features/hooks son las que hablan con services/, no components/).
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: ['feature'],
              disallow: [['feature', { feature: '!${from.feature}' }]],
              message: 'Una feature no puede importar de otra feature (sí de su hook de dominio, ver docs/CONVENTIONS.md). Comparte lógica vía services/, utils/, components/ o types/.',
            },
            {
              from: ['component'],
              disallow: ['feature', 'feature-hook', 'service-api', 'service-core'],
              message: 'components/ no puede importar de features/ ni de services/: las features consumen components/, nunca al revés.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/services/**/*.{ts,tsx}'],
    rules: {
      // services/ es la única capa autorizada a importar firebase — se anula
      // aquí la restricción global de no-restricted-imports de más arriba.
      'no-restricted-imports': 'off',
    },
  },

  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
