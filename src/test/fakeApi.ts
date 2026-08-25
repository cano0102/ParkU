/**
 * Backend falso en memoria para los tests de `services/api/*.ts`. Los tests
 * viejos corrían contra el store mock real (`services/core/db.ts`, ya
 * eliminado); ahora cada servicio llama a `apiFetch` (fetch real), así que
 * los tests mockean `services/core/http#apiFetch` con esto en su lugar —
 * simula lo suficiente del contrato REST real (arrays crudos sin envolver,
 * `PATCH /:id/estado` para parqueaderos/reservas, `/entrada`+`/salida` para
 * entradas-salidas) para que las mismas aserciones de "crear, listar,
 * actualizar, borrar" seguir funcionando sin tener que hablarle a la API en
 * vivo desde el test suite.
 */
import { vi } from 'vitest';

export interface FakeRestOptions {
  /** Sub-rutas de acción (no CRUD estándar) por método+patrón, evaluadas antes que el CRUD genérico. */
  actions?: Array<{
    method: string;
    /** Patrón relativo a basePath, p. ej. '/:id/estado'. */
    pattern: RegExp;
    handle: (params: RegExpMatchArray, body: unknown, items: any[]) => unknown;
  }>;
}

export function createFakeRestBackend<T extends { id: number }>(
  basePath: string,
  seed: T[],
  options: FakeRestOptions = {}
) {
  let items: T[] = seed.map((i) => ({ ...i }));
  let nextId = items.reduce((max, i) => Math.max(max, i.id), 0) + 1;

  async function apiFetch<R>(path: string, reqOptions: { method?: string; body?: unknown } = {}): Promise<R> {
    const method = (reqOptions.method ?? 'GET').toUpperCase();
    if (!path.startsWith(basePath)) {
      throw new Error(`fakeApi: ruta inesperada "${path}" (basePath "${basePath}")`);
    }
    const rel = path.slice(basePath.length);

    for (const action of options.actions ?? []) {
      if (action.method !== method) continue;
      const m = rel.match(action.pattern);
      if (m) return action.handle(m, reqOptions.body, items) as R;
    }

    if (rel === '' || rel === '/') {
      if (method === 'GET') return [...items] as unknown as R;
      if (method === 'POST') {
        const created = { ...(reqOptions.body as object), id: nextId++ } as T;
        items.push(created);
        return created as unknown as R;
      }
    }

    const idMatch = rel.match(/^\/(\d+)$/);
    if (idMatch) {
      const id = Number(idMatch[1]);
      const idx = items.findIndex((i) => i.id === id);
      if (method === 'GET') {
        if (idx === -1) throw new Error('404');
        return items[idx] as unknown as R;
      }
      if (method === 'PUT' || method === 'PATCH') {
        if (idx === -1) throw new Error('404');
        // Simula la serialización JSON real (fetch nunca transmite claves `undefined`):
        // sin esto, un adaptador que arma el payload con campos condicionales en
        // `undefined` para "no tocar este campo" los sobreescribiría igual en el fake.
        const body = JSON.parse(JSON.stringify(reqOptions.body ?? {}));
        items[idx] = { ...items[idx], ...body };
        return items[idx] as unknown as R;
      }
      if (method === 'DELETE') {
        if (idx === -1) throw new Error('404');
        items = items.filter((i) => i.id !== id);
        return undefined as unknown as R;
      }
    }

    throw new Error(`fakeApi: sin handler para ${method} ${path}`);
  }

  return {
    apiFetch: vi.fn(apiFetch),
    get items() {
      return items;
    },
  };
}
