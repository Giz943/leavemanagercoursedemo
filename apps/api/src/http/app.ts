import { Hono } from 'hono';
import { HEALTH_PATH } from '@leave/shared';
import { getHealth, type DatabaseProbe } from '../app/get-health.ts';

export interface AppDependencies {
  database: DatabaseProbe;
}

export function createApp({ database }: AppDependencies): Hono {
  const app = new Hono();

  // Public by design: the health query needs no session (spec 0001, Requirement 1).
  app.get(HEALTH_PATH, (c) => {
    const health = getHealth(database);
    return c.json(health, health.status === 'ok' ? 200 : 503);
  });

  app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404));

  app.onError((error, c) => {
    console.error(error);
    return c.json({ error: { code: 'INTERNAL', message: 'Internal error' } }, 500);
  });

  return app;
}
