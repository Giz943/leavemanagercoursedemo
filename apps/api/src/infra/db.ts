import BetterSqlite3 from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DatabaseProbe } from '../app/get-health.ts';

export interface Database extends DatabaseProbe {
  readonly orm: BetterSQLite3Database;
  close(): void;
}

/** Opens a SQLite database (`:memory:` in tests). Foreign keys are off by default in SQLite. */
export function createDatabase(path: string): Database {
  const client = new BetterSqlite3(path);
  client.pragma('foreign_keys = ON');
  const orm = drizzle({ client });
  return {
    orm,
    ping() {
      orm.run(sql`select 1`);
    },
    close() {
      client.close();
    },
  };
}
