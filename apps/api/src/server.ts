import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { serve } from '@hono/node-server';
import { createApp } from './http/app.ts';
import { createDatabase } from './infra/db.ts';

// Composition root: wires infra into the HTTP app. Local development only.
const databasePath = process.env.DATABASE_PATH ?? 'data/dev.sqlite';
const port = Number(process.env.PORT ?? 3000);

if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
const database = createDatabase(databasePath);
const server = serve({ fetch: createApp({ database }).fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

function shutdown(): void {
  server.close();
  database.close();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
