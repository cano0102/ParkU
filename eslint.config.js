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
        // Más específico primero: el barril público de una feature
        // (src/features/x/index.ts) es su propio tipo, para poder permitir
        // el cruce feature -> feature-barrel (Fase 6: "una feature no
        // importa de otra, salvo a través de su barril index.ts") sin abrir
        // la puerta a que una feature importe páginas/componentes/hooks
        // internos de otra directamente.
        { type: 'feature-barrel', pattern: 'src/features/*/index.ts', mode: 'file', capture: ['feature'] },
        { type: 'feature', pattern: 'src/features/*', mode: 'folder', capture: ['feature'] },
        { type: 'service-core', pattern: 'src/services/core/**' },
        { type: 'service-api', pattern: 'src/services/api/**' },
        { type: 'component', pattern: 'src/components/**' },
        { type: 'util', pattern: 'src/utils/**' },
        { type: 'hook', pattern: 'src/hooks/**' },
        { type: 'context', pattern: 'src/context/**' },
        { type: 'layout', pattern: 'src/layouts/**' },
        { type: 'route', pattern: 'src/routes/**' },
        { type: 'style', pattern: 'src/styles/**' },
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
      // La integración (services/core/firebase.ts) se eliminó por no usarse —
      // la regla se deja como guardia para que no se reintroduzca sin pasar
      // por una capa de servicios.
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['firebase', 'firebase/*'], message: 'Solo src/services/ puede importar el SDK de Firebase.' }] },
      ],

      // Reglas de límites (Fase 4 + Fase 6 + Fase 8, "un criterio, cero
      // excepciones" salvo las dos anotadas abajo, ambas evidencia real del
      // código, no atajos):
      // 1) una feature no puede importar de otra feature — SALVO a través
      //    del barril público de esa feature (feature-barrel, su
      //    index.ts), nunca un import profundo a sus páginas/componentes/
      //    hooks internos.
      // 2) components/ no puede importar de features/ (ni de su barril) ni
      //    de services/ (es al revés: las features consumen components/, y
      //    las features/hooks son las que hablan con services/, no
      //    components/).
      // 3) services/core no importa nada del proyecto — es la capa más
      //    baja — SALVO tipos (`import type`): services/core/db.ts
      //    necesita las interfaces de entidad de @/types para tipar el
      //    store en memoria, y un tipo no genera acoplamiento real (se
      //    borra al compilar). No hay forma de que boundaries distinga
      //    `import type` de un import normal en esta versión, así que la
      //    excepción se hace por tipo de elemento (`type`) en vez de por
      //    sintaxis — el efecto es el mismo: services/core solo puede
      //    "importar" definiciones de tipos, nunca lógica de otra capa.
      // 4) services/api no importa de ninguna capa de UI (features,
      //    components, routes, layouts, context) — solo de services/core
      //    y @/types. Evita que un servicio termine acoplado a React o al
      //    ruteo por accidente.
      // 5) routes/ solo puede llegar a una feature a través de su barril,
      //    igual que cualquier otra feature.
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: ['feature'],
              disallow: [['feature', { feature: '!${from.feature}' }]],
              message: 'Una feature no puede importar de otra feature, salvo a través de su barril público (@/features/<x>, no una ruta profunda). Ver docs/CONVENTIONS.md.',
            },
            {
              from: ['component'],
              disallow: ['feature', 'feature-barrel', 'service-api', 'service-core'],
              message: 'components/ no puede importar de features/ ni de services/: las features consumen components/, nunca al revés.',
            },
            {
              from: ['service-core'],
              disallow: ['feature', 'feature-barrel', 'service-api', 'component', 'util', 'hook', 'context', 'layout', 'route', 'style', 'asset', 'app'],
              message: 'services/core/ es la capa más baja: no importa nada del proyecto salvo tipos (@/types). Ver docs/CONVENTIONS.md.',
            },
            {
              from: ['service-api'],
              disallow: ['feature', 'feature-barrel', 'component', 'util', 'hook', 'context', 'layout', 'route', 'style', 'app'],
              message: 'services/api/ no depende de capas de UI (features, components, routes, layouts, context) — solo de services/core y @/types.',
            },
            {
              from: ['route'],
              disallow: ['feature'],
              message: 'routes/ solo puede importar el barril público de una feature (@/features/<x>), nunca una ruta profunda.',
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
      // Los tests verifican comportamiento integrado (p. ej.
      // services/core/queryFactory.test.ts prueba la fábrica genérica a
      // través de un hook de dominio real) — no definen el grafo de
      // dependencias de producción, así que no están sujetos a las mismas
      // fronteras que el código de app.
      'boundaries/element-types': 'off',
    },
  },
);
