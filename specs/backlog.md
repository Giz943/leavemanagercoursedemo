# Backlog — deferred findings

Findings a human triaged as **defer**: real, but fixed later by decision (`workflows/feature-development.md`,
step 7). Nothing lands here without that decision; noise is rejected in the triage record, not parked here.

- A criterion moved out at the ship gate (R-08, `→ moved to B-<n>`) lands here too, by the
  human's ship decision; the entry names the spec and criterion.
- One entry per finding, newest last. Delete the entry in the commit of the work that closes it.
- An entry that grows into new behavior becomes a spec (`specs/active/`), not a fix.

<!-- Format (labels stay English):
- **B-<n>** — <finding, one line> — Source: spec <NNNN>, review round <n> (<file:line>) — Severity: <…>
  — Recommendation: <the reviewer's action> — Deferred by: <name>, <YYYY-MM-DD>, <why>
  A decision deferred at bootstrap (its REPORT) uses Source: bootstrap <YYYY-MM-DD>.
-->

- **B-1** — UI kanıtı için ekran görüntüsü aracı seçilmedi (`docs/testing.md` "araç walking skeleton'da seçilir") — Source: spec 0001, review round 1 (`docs/testing.md:27`) — Severity: Low
  — Recommendation: Playwright (headless Chromium) seç ve `docs/testing.md`'ye yaz — Deferred by: Gizem Kaldar, 2026-11-11, Playwright ilk rezervasyon spec'inde e2e için zaten kurulacak; skeleton'da AC-9 gözlemle
- **B-2** — Paket kapsamı ve fixture adları hâlâ `leave` (`@leave/*`, `leave-manager`, `eslint.config.js` regex'leri, sınır testi fixture'ları) — Source: spec 0001, review round 1 (`package.json:2`) — Severity: Low
  — Recommendation: tek commit'te yeniden adlandır; ESLint regex'leri ve sınır testleri birlikte — Deferred by: Gizem Kaldar, 2026-11-11, domain değişikliğinden ayrı bir refactor (`refactor/<no>-…`)
- **B-3** — Herkese açık uçların "public" işaretlenmesi yalnızca yorumla (`docs/security.md` AuthZ) — Source: spec 0001, review round 1 (`apps/api/src/http/app.ts:15`) — Severity: Info
  — Recommendation: işaretleme mekanizmasını ilk korumalı uç spec'inde tanımla — Deferred by: Gizem Kaldar, 2026-11-11, korumalı uç henüz yok
