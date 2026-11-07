# Conventions

> Bootstrap'ta karara bağlandı (2026-11-07). Buradaki her kural ya araçla zorlanır (tercih edilen) ya da review'da denetlenir.

## Language
<!-- Set at bootstrap (step 0) and mirrored in AGENTS.md. Changing it later is allowed — edit both
     places; existing documents are not translated retroactively. -->
- Chat language (interviews, sessions): Türkçe (`tr`)
- Document language (docs/, specs, plans, ADRs, review and verify reports): Türkçe (`tr`)
- Always English (protocol, not prose): ANEW core files, template headings and field labels,
  `Status:` values (Draft / Approved / In progress / Shipped), `Approved by / on:`, `Source:`.
- Code identifiers, branch names, commit messages: İngilizce (Conventional Commits, `docs/git.md`).
  Kullanıcıya görünen arayüz metinleri Türkçe.
- Agent messages (handoff summaries, refusals, `Next:` lines): chat language; command names, file
  paths and protocol fields verbatim.

## Language & framework versions
Sürümler `package-lock.json` ile sabittir; kurulum `npm ci`. Spec 0001'de güncellendi (plan 0001, Risk 1–2).
- Node.js **26 LTS** (`.nvmrc`, `package.json` `engines` `>=26 <27`); npm 12 (workspaces).
- TypeScript **5.9.x**, `strict` + `noUncheckedIndexedAccess`; typescript-eslint yalnızca `<6.1` destekler — TypeScript 7'ye geçiş ayrı ADR.
- Backend: Hono 4 · @hono/node-server 2 · Drizzle ORM 0.45 + better-sqlite3 13 · zod 4.
- Frontend: React 19 · Vite 8.
- Test: Vitest 5 (+ @vitest/coverage-v8) · React Testing Library 16 · jsdom.
- Lint/format: ESLint 10 (flat config) + typescript-eslint 8 + eslint-plugin-react-hooks · Prettier 3.
- API, Node'un yerleşik TypeScript tip silme özelliğiyle çalışır (derleme adımı yok); importlar `.ts` uzantılıdır.

## Naming
- Kod tanımlayıcıları İngilizce; Türkçe ↔ İngilizce terim eşlemesi `docs/domain.md` sözlüğündedir.
- Dosyalar `kebab-case.ts(x)`; tipler `PascalCase`; fonksiyon/değişken `camelCase`; sabitler `UPPER_SNAKE_CASE`.
- React bileşen dosyaları da `kebab-case.tsx`; bileşen adı `PascalCase`.
- Testler kaynağın yanında: `*.test.ts` / `*.test.tsx`; API entegrasyon testleri `*.int.test.ts`.
- Hata kodları `UPPER_SNAKE_CASE` (`INSUFFICIENT_BALANCE`, `OVERLAPPING_REQUEST`, `SELF_APPROVAL_FORBIDDEN`…), tek listesi `packages/shared`.

## Error handling
- `domain` ve `app`, beklenen iş hatalarını fırlatmaz; `Result` döner:
  `{ ok: true, value } | { ok: false, error: { code, message } }`.
- `throw` yalnızca beklenmeyen/programlama hataları içindir.
- HTTP eşlemesi tek yerde (`apps/api/src/http`): 400 doğrulama · 401 oturum yok · 403 yetki ·
  404 bulunamadı · 409 iş kuralı ihlali · 500 beklenmeyen. Gövde: `{ error: { code, message } }`.
- 500 yanıtında stack trace, SQL veya iç detay dönmez; ayrıntı yalnızca sunucu loguna yazılır.
- Dış girdi `http` sınırında zod ile doğrulanır; içeride doğrulanmış kabul edilir.
- Arayüz hata kodunu Türkçe mesaja çevirir; sunucu mesajını olduğu gibi göstermez.

## Data rules
- İzin tarihleri **takvim günüdür**: saat/saat dilimi yok, `YYYY-MM-DD` string olarak saklanır ve taşınır. İş günü hesabında JS `Date` ve saat dilimi aritmetiği kullanılmaz.
- Zaman damgaları (`createdAt`, `decidedAt`) UTC, ISO-8601.
- Gün sayıları tam sayı (integer); yarım gün yok.
- ID'ler UUID v4 string.
- Durumlar ve türler string literal union (`'PENDING' | 'APPROVED' | …`); TypeScript `enum` kullanılmaz.
- Domain nesneleri immutable; durum geçişleri yalnızca domain fonksiyonlarıyla yapılır.
- "Bugün" domain'e parametre olarak verilir (`today: string`); domain `Date.now()` çağırmaz.

## Known traps
- `new Date('YYYY-MM-DD')` UTC gece yarısı olarak parse edilir, yerelde bir önceki güne kayabilir — takvim günleri için `Date` kullanma, string + domain yardımcıları kullan — from bootstrap.
- `vitest` TTY'de watch modunda açılır ve kapanmaz — check'te her zaman `vitest run` — from bootstrap.
- Vite dev sunucusu ve `tsc --watch` arka planda süreç bırakır — check'te yalnızca `vite build` ve `tsc --noEmit` — from bootstrap.
- better-sqlite3 native modüldür; Node major sürümü değişince `npm rebuild` gerekir — Node'u `.nvmrc`/`engines` ile sabitle — from bootstrap.
- SQLite'ta foreign key'ler varsayılan olarak kapalı — her bağlantıda `PRAGMA foreign_keys = ON` — from bootstrap.
- `toLocaleDateString()` ortamın locale'ine bağlı — tarih biçimlendirme tek yardımcıdan, `tr-TR` sabit — from bootstrap.
- better-sqlite3 senkron; Drizzle `db.transaction` içinde `await` transaction'ı sessizce bozar — onay + bakiye düşümü tek, senkron transaction — from bootstrap.
- macOS'ta `/bin/sh` bash 3.2'dir ve ANEW scriptlerini (`./scripts/check`, `doctor`, `residue`) parse edemez (`syntax error near unexpected token ';;'`) — macOS'ta `dash scripts/<ad>` ile çalıştır; Linux/CI etkilenmez; ANEW upstream'e bildirildi — from bootstrap.

## Enforced by tooling
Walking skeleton kurar; kurulana kadar review'da denetlenir.
- `tsc --noEmit` (strict): tip hataları.
- ESLint: `no-restricted-imports` ile mimari yasak bağımlılıklar (`docs/architecture.md`), `no-explicit-any`, `react-hooks`, `dangerouslySetInnerHTML` yasağı (`no-restricted-syntax`).
- Prettier `--check`: biçim.
- Vitest coverage: `apps/api/src/domain` için %90 satır ve dal eşiği.
