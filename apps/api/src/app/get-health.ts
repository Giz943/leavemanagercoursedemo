import type { HealthResponse } from '@leave/shared';

/** Port to the database: answers whether it can serve a trivial query. Implemented in infra. */
export interface DatabaseProbe {
  ping(): void;
}

export function getHealth(database: DatabaseProbe): HealthResponse {
  try {
    database.ping();
    return { status: 'ok', database: 'connected' };
  } catch {
    // Details stay on the server side; the caller only learns that the database is unreachable.
    return { status: 'unavailable', database: 'disconnected' };
  }
}
