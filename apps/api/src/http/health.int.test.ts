import { afterEach, describe, expect, it } from 'vitest';
import { HEALTH_PATH, HealthResponseSchema } from '@leave/shared';
import { createDatabase, type Database } from '../infra/db.ts';
import { createApp } from './app.ts';

const opened: Database[] = [];
function openDatabase(): Database {
  const database = createDatabase(':memory:');
  opened.push(database);
  return database;
}

afterEach(() => {
  for (const database of opened.splice(0)) database.close();
});

const INTERNALS = /stack|at \w+ \(|select|sqlite|\.ts|\/Users|node_modules|Error:/i;

describe('GET /api/health', () => {
  it('returns ok with database connected', async () => {
    const app = createApp({ database: openDatabase() });

    const response = await app.request(HEALTH_PATH);

    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    expect(HealthResponseSchema.parse(body)).toEqual({ status: 'ok', database: 'connected' });
  });

  it('returns 503 without internals when database is unreachable', async () => {
    const app = createApp({
      database: {
        ping: () => {
          throw new Error('SQLITE_CANTOPEN: unable to open /Users/x/data/dev.sqlite at select 1');
        },
      },
    });

    const response = await app.request(HEALTH_PATH);

    expect(response.status).toBe(503);
    const text = await response.text();
    expect(HealthResponseSchema.parse(JSON.parse(text))).toEqual({
      status: 'unavailable',
      database: 'disconnected',
    });
    expect(text).not.toMatch(INTERNALS);
  });

  it('logs the probe failure on the server without exposing it', async () => {
    const failure = new Error('SQLITE_CANTOPEN: unable to open database file');
    const logged: unknown[] = [];
    const app = createApp({
      database: {
        ping: () => {
          throw failure;
        },
      },
      logError: (error) => logged.push(error),
    });

    const response = await app.request(HEALTH_PATH);

    expect(response.status).toBe(503);
    expect(logged).toEqual([failure]);
    expect(await response.text()).not.toMatch(INTERNALS);
  });

  it('returns 503 when the database connection has been closed', async () => {
    const database = createDatabase(':memory:');
    database.close();
    const app = createApp({ database });

    const response = await app.request(HEALTH_PATH);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'unavailable', database: 'disconnected' });
  });

  it('answers unknown routes with a JSON 404 and no internals', async () => {
    const app = createApp({ database: openDatabase() });

    const response = await app.request('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: { code: 'NOT_FOUND', message: 'Not found' } });
  });
});
