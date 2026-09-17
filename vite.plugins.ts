import type { Plugin } from 'vite'

/**
 * Reescribe cada `import { IconX as X } from "@tabler/icons-react"` a un import del archivo
 * de ese icono (`@tabler/icons-react/dist/esm/icons/IconX.mjs`).
 *
 * Por qué: el paquete trae más de 5 000 iconos en un solo módulo. En el servidor de
 * desarrollo, Vite lo pre-empaqueta entero (4,3 MB de JavaScript, más 12 MB de sourcemap)
 * y el navegador lo descarga y analiza en cada recarga aunque la app use 99 iconos. En las
 * pruebas pasa lo mismo por cada archivo de test que importe un componente con un icono. En
 * el build de producción Rollup sí descarta lo no usado, pero antes tiene que transformar
 * los 5 000 módulos (eran 7 000 de los 7 067 del build). Importando icono por icono,
 * desarrollo, pruebas y build solo tocan los que existen en el código.
 *
 * Solo se reescriben especificadores con forma de icono (`IconAlgo`, con o sin `as`). Un
 * `type TablerIcon` ya no llega aquí (esbuild lo elimina antes), y cualquier otro
 * especificador se deja en un import normal del paquete. El número de líneas del archivo se
 * conserva para que los sourcemaps y las trazas de error sigan apuntando bien.
 */
const IMPORT_TABLER = /import\s*\{([^}]*)\}\s*from\s*['"]@tabler\/icons-react['"];?/g
const ESPECIFICADOR_ICONO = /^(Icon[A-Za-z0-9]+)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/

export function tablerIconsPorArchivo(): Plugin {
  return {
    name: 'parku:tabler-icons-por-archivo',
    transform(code, id) {
      if (id.includes('node_modules') || !/\.[cm]?[jt]sx?(\?|$)/.test(id)) return null
      if (!code.includes('@tabler/icons-react')) return null

      const reescrito = code.replace(IMPORT_TABLER, (original, especificadores: string) => {
        const porIcono: string[] = []
        const resto: string[] = []
        for (const crudo of especificadores.split(',')) {
          const espec = crudo.trim()
          if (!espec) continue
          const m = ESPECIFICADOR_ICONO.exec(espec)
          if (!m) { resto.push(espec); continue }
          porIcono.push(`import ${m[2] ?? m[1]} from '@tabler/icons-react/dist/esm/icons/${m[1]}.mjs';`)
        }
        if (porIcono.length === 0) return original
        if (resto.length > 0) porIcono.push(`import { ${resto.join(', ')} } from '@tabler/icons-react';`)
        // Mismas líneas que el import original: todo en una, más los saltos que ocupaba.
        const saltos = original.split('\n').length - 1
        return porIcono.join(' ') + '\n'.repeat(saltos)
      })

      return reescrito === code ? null : { code: reescrito, map: null }
    },
  }
}
