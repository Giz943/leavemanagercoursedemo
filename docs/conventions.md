# Conventions

> Bootstrap'ta karara bağlandı (2026-11-07; domain 2026-11-11'de Uçuş Rezervasyon'a değişti). Buradaki her kural ya araçla zorlanır (tercih edilen) ya da review'da denetlenir.

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
- Hata kodları `UPPER_SNAKE_CASE`, tek listesi `packages/shared`: `SEAT_TAKEN`, `SEAT_NOT_ON_FLIGHT`, `FLIGHT_FULL`,
  `SALES_CLOSED`, `CANCELLATION_WINDOW_CLOSED`, `DUPLICATE_BOOKING`, `FLIGHT_CANCELLED`, `FLIGHT_NOT_FOUND`,
  `BOOKING_NOT_FOUND`, `TOO_MANY_ATTEMPTS`, `UNAUTHORIZED`, `VALIDATION_FAILED`.

## Error handling
- `domain` ve `app`, beklenen iş hatalarını fırlatmaz; `Result` döner:
  `{ ok: true, value } | { ok: false, error: { code, message } }`.
- `throw` yalnızca beklenmeyen/programlama hataları içindir.
- HTTP eşlemesi tek yerde (`apps/api/src/http`): 400 doğrulama · 401 ops anahtarı yok/yanlış (ayrım
  sızdırılmaz) · 404 bulunamadı (yanlış PNR ve yanlış soyadı dahil) · 409 iş kuralı ihlali ·
  429 çok fazla deneme · 500 beklenmeyen. Gövde: `{ error: { code, message } }`.
- 500 yanıtında stack trace, SQL veya iç detay dönmez; ayrıntı yalnızca sunucu loguna yazılır.
- Dış girdi `http` sınırında zod ile doğrulanır; içeride doğrulanmış kabul edilir.
- Arayüz hata kodunu Türkçe mesaja çevirir; sunucu mesajını olduğu gibi göstermez.

## Data rules
- **Zaman anı ile takvim günü ayrıdır** — bu domain'in en önemli veri kuralı:
  - Kalkış/varış ve tüm zaman damgaları (`createdAt`, `cancelledAt`) **zaman anıdır**: UTC, `Z` ekli
    ISO-8601 string (`2026-11-20T07:30:00.000Z`) olarak saklanır ve taşınır.
  - Uçuş arama tarihi **takvim günüdür**: `YYYY-MM-DD`, `Europe/Istanbul` yerel tarihi; `Date` ile
    değil, string + domain yardımcıları (`calendar-date`) ile işlenir.
- Gösterim tek bir yardımcıdan yapılır: saat dilimi `Europe/Istanbul`, locale `tr-TR` sabittir.
- "Şimdi" domain'e ve use-case'lere parametre/saat servisi olarak verilir (`now: string`, zaman anı);
  domain `Date.now()` çağırmaz. Pencere hesapları (BR-3, BR-4) epoch milisaniye üzerinden yapılır.
- PNR: 6 karakter, `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` alfabesi (`docs/security.md`). Girdi büyük harfe
  çevrilip boşluk kırpılarak karşılaştırılır.
- Koltuk: `^[1-9][0-9]?[A-F]$` (örn. `12C`). Uçuş no: 2 harf + 1–4 rakam (örn. `AB1234`).
  Havalimanı: 3 büyük harf IATA kodu.
- E-posta küçük harfe normalize edilerek saklanır (BR-5).
- Fiyat/para alanı yoktur (ödeme kapsam dışı).
- ID'ler UUID v4 string; PNR ID değildir.
- Durumlar string literal union (`'CONFIRMED' | 'CANCELLED' | …`); TypeScript `enum` kullanılmaz.
- Domain nesneleri immutable; durum geçişleri yalnızca domain fonksiyonlarıyla yapılır.

## Known traps
- `new Date('YYYY-MM-DD')` UTC gece yarısı olarak parse edilir, yerelde bir önceki güne kayabilir — arama tarihi (takvim günü) için `Date` kullanma, string + domain yardımcıları kullan — from bootstrap.
- `vitest` TTY'de watch modunda açılır ve kapanmaz — check'te her zaman `vitest run` — from bootstrap.
- Vite dev sunucusu ve `tsc --watch` arka planda süreç bırakır — check'te yalnızca `vite build` ve `tsc --noEmit` — from bootstrap.
- better-sqlite3 native modüldür; Node major sürümü değişince `npm rebuild` gerekir — Node'u `.nvmrc`/`engines` ile sabitle — from bootstrap.
- SQLite'ta foreign key'ler varsayılan olarak kapalı — her bağlantıda `PRAGMA foreign_keys = ON` — from bootstrap.
- `toLocaleDateString()` ortamın locale'ine bağlı — tarih biçimlendirme tek yardımcıdan, `tr-TR` sabit — from bootstrap.
- better-sqlite3 senkron; Drizzle `db.transaction` içinde `await` transaction'ı sessizce bozar — rezervasyon yapma ve uçuş iptali + rezervasyon iptalleri tek, senkron transaction — from bootstrap.
- macOS'ta `/bin/sh` bash 3.2'dir ve ANEW scriptlerini (`./scripts/check`, `doctor`, `residue`) parse edemez (`syntax error near unexpected token ';;'`) — macOS'ta `dash scripts/<ad>` ile çalıştır; Linux/CI etkilenmez; ANEW upstream'e bildirildi — from bootstrap.

- Türkçe İ/ı: locale'siz `'işık'.toUpperCase()` → `'IŞIK'` (doğrusu `'İŞIK'`), `'IŞIK'.toLowerCase()` → `'işik'` (doğrusu `'ışık'`); `İ` ile `I` farklı harfler birbirine karışır — soyadı ve PNR karşılaştırmasında her zaman `toLocaleUpperCase('tr-TR')` — from domain switch 2026-11-11.
- `new Date('2026-11-11T10:00')` (`Z` olmadan) **yerel saat** olarak parse edilir — zaman anları her zaman `Z` ekli yazılır ve zod şeması `Z`'siz değeri reddeder — from domain switch 2026-11-11.
- Aktif koltuk benzersizliği SQLite **kısmi** index'idir (`UNIQUE (flight_id, seat) WHERE status = 'CONFIRMED'`); düz unique index iptal edilen koltuğun yeniden satışını engeller — Drizzle şemasında `.where(...)` ile açıkça tanımla — from domain switch 2026-11-11.
- Sınır karşılaştırmaları bilerek farklıdır: satış `now < kalkış − 1s` (strict), iptal `now ≤ kalkış − 24s` (dahil) — `<`/`<=` karıştırma, her biri sınır testiyle sabit — from domain switch 2026-11-11.

- Claude Code proje kökünden (`leavemanagercoursedemo/`) başlatılmazsa `.claude/` (reviewer ajanı, komutlar, `settings.json` yasakları ve `specs/done/` koruma hook'u) yüklenmez — oturumu her zaman proje kökünde aç; hook `$CLAUDE_PROJECT_DIR`'e bağlı olduğu için üst klasöre sembolik link çözüm değildir — from spec 0001 review, 2026-11-11.

## Enforced by tooling
Walking skeleton kurar; kurulana kadar review'da denetlenir.
- `tsc --noEmit` (strict): tip hataları.
- ESLint: `no-restricted-imports` ile mimari yasak bağımlılıklar (`docs/architecture.md`), `no-explicit-any`, `react-hooks`, `dangerouslySetInnerHTML` yasağı (`no-restricted-syntax`).
- Prettier `--check`: biçim.
- Vitest coverage: `apps/api/src/domain` için %90 satır ve dal eşiği.
