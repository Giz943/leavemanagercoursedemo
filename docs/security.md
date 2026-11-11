# Security

> Bootstrap'ta karara bağlandı (2026-11-07; domain 2026-11-11'de Uçuş Rezervasyon'a değişti). Her plan ve review'da uyulması gereken taban kurallar.
> Duruş: **hesapsız yolcu erişimi (PNR + soyadı) ve anahtarlı operasyon erişimi; yetkilendirme gerçek seviyede.**

## Secrets
- Secrets never enter the repo, specs, prompts, or chat. `.env` is gitignored; provide `.env.example`.
- Agents never print secret values, even when debugging.
- Operasyon API anahtarı (`OPS_API_KEY`) `.env`'den okunur; `.env.example` yalnızca değişken adını ve sahte bir değer içerir. Anahtar en az 32 karakterdir; eksik veya kısaysa sunucu başlamayı reddeder.
- Gerçek kişisel veri yoktur; seed verisi (yolcu adları, e-postalar) kurgusaldır.
- Yolcu e-postası, soyadı, PNR ve `X-Ops-Key` header'ı loglara yazılmaz.

## Input & output
- Tüm dış girdi (body, query, params, çerez) `apps/api/src/http` sınırında zod şemalarıyla (`packages/shared`) doğrulanır; geçersiz girdi 400.
- SQL yalnızca Drizzle'ın parametreli sorgularıyla; string birleştirerek SQL yazmak yasak.
- Arayüzde React'in varsayılan kaçışı; `dangerouslySetInnerHTML` yasak (ESLint `no-restricted-syntax`).
- Hata yanıtlarında stack trace, SQL, dosya yolu veya iç detay dönmez (`docs/conventions.md` Error handling).

## AuthN / AuthZ
**Yolcu (hesapsız):** yolcu hesabı ve oturumu yoktur. Uçuş arama ve rezervasyon yapma anonimdir.
Mevcut bir rezervasyona erişim (görme, iptal) yalnızca **PNR + soyadı** ile olur ve her istekte
yeniden doğrulanır.
- PNR, karışık karakterleri çıkarılmış büyük harf alfabesinden (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`,
  32 karakter) 6 karakter olarak **kriptografik rastgele** (`node:crypto`) üretilir; `Math.random` yasak.
  Üretici enjekte edilir (testlerde deterministik).
- Yanlış PNR ile doğru PNR + yanlış soyadı **birebir aynı yanıtı** alır: 404 `BOOKING_NOT_FOUND`,
  aynı gövde. Hangisinin yanlış olduğu sızdırılmaz.
- **Rate limit:** IP başına 15 dakikalık pencerede 5 başarısız PNR denemesi; 6. denemede 429
  `TOO_MANY_ATTEMPTS`. Sayaç bellek içidir (tek süreç), saat servisiyle çalışır, pencere dolunca sıfırlanır.
- Soyadı karşılaştırması `docs/domain.md` BR-8'e göredir.

**Operasyon (API anahtarı):** `/ops/*` uçları yalnızca `X-Ops-Key` header'ı `OPS_API_KEY` ile
eşleşince çalışır. Karşılaştırma `crypto.timingSafeEqual` ile sabit zamanlıdır. Header yoksa veya
yanlışsa aynı yanıt: 401. Operasyon'un web arayüzü yoktur; kullanım README'de curl örnekleriyle.
README'de **"Üretim için değildir"** notu bulunur; gerçek kimlik doğrulama gerekirse ADR ile eklenir.

**Yetkilendirme (hassas alan, `docs/domain.md`):**
- Varsayılan red: her endpoint yetkisini açıkça kontrol eder; herkese açık uçlar (sağlık, uçuş arama,
  koltuk haritası, rezervasyon yapma) route tanımında açıkça "public" işaretlenir.
- Yetki kararları **yalnızca sunucuda** verilir; arayüzde bir butonu gizlemek yetki sayılmaz.
- Yolcu yalnızca PNR + soyadı eşleşen rezervasyonu görür ve iptal eder (BR-6).
- Yolcu listesi (ad, e-posta) yalnızca Operasyon'a döner; herkese açık koltuk haritası yalnızca
  koltuğun dolu/boş olduğunu gösterir, yolcu bilgisi içermez.
- Her yetki kuralının bir negatif testi vardır (401/404/429) — `docs/testing.md`.

## Dependencies
- Yeni runtime bağımlılığı, spec veya plan içinde gerekçesiyle **önerilir**, insan onaylar (plan onayı yeterli).
- Kabul edilen lisanslar: MIT, Apache-2.0, BSD-2/3-Clause, ISC. Diğerleri ADR gerektirir.
- Bakımı bırakılmış (son 12 ayda sürüm yok, arşivlenmiş) paket önerilmez.
- Sürümler lockfile ile sabit; kurulum `npm ci`.
- `npm audit --audit-level=high` **full** profilde check adımıdır (ağ ister, `[fast]` değil); high/critical bulgu check'i kırmızıya çevirir.

## Review lens
Security is a mandatory dimension of every independent review (see `prompts/review.md`), not a
separate afterthought phase.
