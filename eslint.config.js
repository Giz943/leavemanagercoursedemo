// @ts-check
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Architecture boundaries (docs/architecture.md, "Forbidden dependencies").
 * Flat config does not merge two `no-restricted-imports` entries for one file — the later one
 * wins — so every area below lists the complete set of rules that apply to it.
 */
const NO_DATABASE = {
  regex: '^(drizzle-orm|better-sqlite3)(/|$)',
  message: 'Rule 5: only apps/api/src/infra may access the database (drizzle-orm, better-sqlite3).',
};
const DOMAIN_IS_PURE = {
  regex: '^(?!\\./)|\\.\\./',
  message:
    'Rule 1: domain is pure TypeScript — it imports only sibling domain modules (./…): no Hono, Drizzle, infra, http, app or Node I/O.',
};
const DOMAIN_TEST_IS_PURE = {
  regex: '^(?!\\./|vitest$)|\\.\\./',
  message: 'Rule 1: domain tests import only vitest and sibling domain modules (./…).',
};
const APP_WITHOUT_HTTP = {
  regex: '^(hono|@hono/)|(^|/)http(/|$)',
  message: 'Rule 2: app must not import http or Hono.',
};
const WEB_WITHOUT_API = {
  regex: '^@leave/api(/|$)|(^|/)apps/api(/|$)|^(\\.\\./)+api(/|$)',
  message: 'Rule 3: web uses only @leave/shared — never apps/api.',
};
const SHARED_WITHOUT_APPS = {
  regex: '^@leave/(api|web)(/|$)|(^|/)apps(/|$)|^\\.\\./\\.\\./',
  message: 'Rule 4: packages/shared must not import any application package.',
};

/** @param {...{regex: string, message: string}} patterns */
const restrict = (...patterns) => ({ 'no-restricted-imports': ['error', { patterns }] });

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'coverage/**',
      '.anew-dev/**',
      'adapters/**',
      '.claude/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['apps/web/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'dangerouslySetInnerHTML is forbidden (docs/security.md).',
        },
      ],
    },
  },
  // Boundary rules, one entry per area.
  {
    files: ['apps/api/src/**/*.ts'],
    ignores: ['apps/api/src/domain/**', 'apps/api/src/app/**', 'apps/api/src/infra/**'],
    rules: restrict(NO_DATABASE),
  },
  {
    files: ['apps/api/src/domain/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: restrict(DOMAIN_IS_PURE),
  },
  { files: ['apps/api/src/domain/**/*.test.ts'], rules: restrict(DOMAIN_TEST_IS_PURE) },
  { files: ['apps/api/src/app/**/*.ts'], rules: restrict(APP_WITHOUT_HTTP, NO_DATABASE) },
  { files: ['apps/web/**/*.{ts,tsx}'], rules: restrict(WEB_WITHOUT_API, NO_DATABASE) },
  { files: ['packages/shared/**/*.ts'], rules: restrict(SHARED_WITHOUT_APPS, NO_DATABASE) },
);
