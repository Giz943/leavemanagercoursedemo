import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// Proves docs/architecture.md "Forbidden dependencies": each rule rejects a violating import
// and still accepts an allowed one. Files are virtual — lintText never touches the disk.
const eslint = new ESLint({ cwd: fileURLToPath(new URL('..', import.meta.url)) });

async function boundaryErrors(filePath: string, source: string): Promise<string[]> {
  const [result] = await eslint.lintText(`${source}\nexport {};\n`, { filePath });
  return (result?.messages ?? [])
    .filter((m) => m.ruleId === 'no-restricted-imports')
    .map((m) => m.message);
}

describe('architecture boundaries', () => {
  describe('rule 1 — domain imports nothing', () => {
    const file = 'apps/api/src/domain/leave.ts';
    it.each([
      "import { Hono } from 'hono';",
      "import { sql } from 'drizzle-orm';",
      "import { readFileSync } from 'node:fs';",
      "import { createDatabase } from '../infra/db.ts';",
      "import { createApp } from '../http/app.ts';",
      "import { getHealth } from '../app/get-health.ts';",
      "import { HEALTH_PATH } from '@leave/shared';",
    ])('rejects %s', async (source) => {
      expect((await boundaryErrors(file, source)).join()).toMatch(/Rule 1/);
    });
    it('accepts a sibling domain module', async () => {
      expect(
        await boundaryErrors(file, "import { isCalendarDate } from './calendar-date.ts';"),
      ).toEqual([]);
    });
  });

  describe('rule 2 — app does not import http or Hono', () => {
    const file = 'apps/api/src/app/create-request.ts';
    it.each(["import { Hono } from 'hono';", "import { createApp } from '../http/app.ts';"])(
      'rejects %s',
      async (source) => {
        expect((await boundaryErrors(file, source)).join()).toMatch(/Rule 2/);
      },
    );
    it('accepts domain and shared', async () => {
      const source =
        "import { isCalendarDate } from '../domain/calendar-date.ts';\nimport { HEALTH_PATH } from '@leave/shared';";
      expect(await boundaryErrors(file, source)).toEqual([]);
    });
  });

  describe('rule 3 — web does not import apps/api', () => {
    const file = 'apps/web/src/leave-page.tsx';
    it.each([
      "import { createApp } from '@leave/api';",
      "import { getHealth } from '../../api/src/app/get-health.ts';",
    ])('rejects %s', async (source) => {
      expect((await boundaryErrors(file, source)).join()).toMatch(/Rule 3/);
    });
    it('accepts shared', async () => {
      expect(await boundaryErrors(file, "import { HEALTH_PATH } from '@leave/shared';")).toEqual(
        [],
      );
    });
  });

  describe('rule 4 — shared does not import application packages', () => {
    const file = 'packages/shared/src/leave.ts';
    it.each([
      "import { createApp } from '@leave/api';",
      "import { HealthPage } from '@leave/web';",
      "import { getHealth } from '../../apps/api/src/app/get-health.ts';",
    ])('rejects %s', async (source) => {
      expect((await boundaryErrors(file, source)).join()).toMatch(/Rule 4/);
    });
    it('accepts zod', async () => {
      expect(await boundaryErrors(file, "import { z } from 'zod';")).toEqual([]);
    });
  });

  describe('rule 5 — only infra accesses the database', () => {
    it.each([
      'apps/api/src/http/routes.ts',
      'apps/api/src/app/create-request.ts',
      'apps/api/src/server.ts',
      'apps/web/src/db.ts',
      'packages/shared/src/db.ts',
    ])('rejects drizzle-orm and better-sqlite3 in %s', async (file) => {
      for (const source of [
        "import { sql } from 'drizzle-orm';",
        "import Db from 'better-sqlite3';",
      ]) {
        expect((await boundaryErrors(file, source)).join(), source).toMatch(/Rule 5/);
      }
    });
    it('accepts drizzle-orm and better-sqlite3 in infra', async () => {
      const source = "import { sql } from 'drizzle-orm';\nimport Db from 'better-sqlite3';";
      expect(await boundaryErrors('apps/api/src/infra/leave-repository.ts', source)).toEqual([]);
    });
  });

  it('rejects dangerouslySetInnerHTML in web components', async () => {
    const [result] = await eslint.lintText(
      'export const X = () => <div dangerouslySetInnerHTML={{ __html: "" }} />;\n',
      {
        filePath: 'apps/web/src/x.tsx',
      },
    );
    expect(result?.messages.map((m) => m.ruleId)).toContain('no-restricted-syntax');
  });
});
