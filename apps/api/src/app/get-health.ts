import type { HealthResponse } from '@leave/shared';

/** Port to the database: answers whether it can serve a trivial query. Implemented in infra. */
export interface DatabaseProbe {
  ping(): void;
}

/** Server-side error sink; what it receives never reaches the HTTP response. */
export type ErrorLogger = (error: unknown) => void;

export function getHealth(database: DatabaseProbe, logError: ErrorLogger): HealthResponse {
  try {
    database.ping();
    return { status: 'ok', database: 'connected' };
  } catch (error) {
    // Details go to the server log only; the caller learns just that the database is unreachable.
    logError(error);
    return { status: 'unavailable', database: 'disconnected' };
  }
}
