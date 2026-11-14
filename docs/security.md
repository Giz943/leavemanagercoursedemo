# Security

> Bootstrap'ta karara bağlandı (2026-11-07). Her plan ve review'da uyulması gereken taban kurallar.
> Duruş: **demo seviyesinde kimlik doğrulama, gerçek seviyede yetkilendirme.**

## Secrets
- Secrets never enter the repo, specs, prompts, or chat. `.env` is gitignored; provide `.env.example`.
- Agents never print secret values, even when debugging.
- Oturum çerezi imzalama anahtarı (`SESSION_SECRET`) `.env`'den okunur; `.env.example` yalnızca değişken adını ve sahte bir değer içerir.
- Gerçek kişisel veri yoktur; seed verisi kurgusaldır.

## Input & output
- Tüm dış girdi (body, query, params, çerez) `apps/api/src/http` sınırında zod şemalarıyla (`packages/shared`) doğrulanır; geçersiz girdi 400.
- SQL yalnızca Drizzle'ın parametreli sorgularıyla; string birleştirerek SQL yazmak yasak.
- Arayüzde React'in varsayılan kaçışı; `dangerouslySetInnerHTML` yasak (ESLint `react/no-danger`).
- Hata yanıtlarında stack trace, SQL, dosya yolu veya iç detay dönmez (`docs/conventions.md` Error handling).

## AuthN / AuthZ
**Kimlik doğrulama (demo):** gerçek parola/SSO yok. Seed edilmiş kullanıcılardan biri seçilir
("demo girişi"); sunucu imzalı, `httpOnly`, `SameSite=Lax` bir oturum çerezi verir. README ve
arayüzde **"Üretim için değildir"** notu bulunur. Gerçek kimlik doğrulama gerekirse ADR ile eklenir.

**Yetkilendirme (hassas alan, `docs/domain.md`):**
- Varsayılan red: oturumu olmayan istek 401; her endpoint yetkisini açıkça kontrol eder.
- Yetki kararları **yalnızca sunucuda**, `domain`/`app` katmanında verilir; arayüzde bir butonu gizlemek yetki sayılmaz.
- Çalışan yalnızca **kendi** taleplerini ve bakiyesini görür, oluşturur ve iptal eder.
- Yönetici yalnızca **kendi ekibinin** taleplerini görür ve karara bağlar; **kendi talebini** karara bağlayamaz (BR-6).
- Her yetki kuralının bir negatif testi vardır (403) — `docs/testing.md`.

## Dependencies
- Yeni runtime bağımlılığı, spec veya plan içinde gerekçesiyle **önerilir**, insan onaylar (plan onayı yeterli).
- Kabul edilen lisanslar: MIT, Apache-2.0, BSD-2/3-Clause, ISC. Diğerleri ADR gerektirir.
- Bakımı bırakılmış (son 12 ayda sürüm yok, arşivlenmiş) paket önerilmez.
- Sürümler lockfile ile sabit; kurulum `npm ci`.
- `npm audit --audit-level=high` **full** profilde check adımıdır (ağ ister, `[fast]` değil); high/critical bulgu check'i kırmızıya çevirir.

## Review lens
Security is a mandatory dimension of every independent review (see `prompts/review.md`), not a
separate afterthought phase.
