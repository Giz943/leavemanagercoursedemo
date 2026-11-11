# Architecture

> Bootstrap'ta karara bağlandı (2026-11-07; domain 2026-11-11'de Uçuş Rezervasyon'a değişti). Hedef değil, verilmiş karar. Ajanlar planlamadan önce bu dosyayı okur.

## System overview
Uçuş Rezervasyon, npm workspaces ile kurulmuş bir **modüler monolittir**: tek bir HTTP API
(`apps/api`, Hono), tek bir web arayüzü (`apps/web`, React + Vite) ve ikisinin paylaştığı API
sözleşmesi (`packages/shared`). Backend hafif katmanlıdır: iş kuralları framework'süz, saf bir
`domain` çekirdeğinde yaşar; use-case'ler `app`, kalıcılık `infra`, HTTP `http` katmanındadır.
Gerekçe: hassas kurallar (koltuk tahsisi, zaman pencereleri, yetki) veritabanı/HTTP olmadan hızlı birim testleriyle
kanıtlanabilsin; kurs demosu için mikroservis veya tam hexagonal mimari gereğinden ağırdır.

```
apps/api/src/{domain,app,infra,http}   apps/web/src   packages/shared/src
```

## Modules / components and ownership

| Module | Single responsibility | Owns |
|---|---|---|
| `apps/api/src/domain` | Saf iş kuralları: koltuk tahsisi, satış/iptal pencereleri, durum geçişleri, soyadı eşleştirme, yetki kararları | Uçuş/rezervasyon kavramları ve invariant'ları; repository, saat ve PNR üretici arayüzleri |
| `apps/api/src/app` | Use-case'ler: uçuş ara, koltuk haritası, rezervasyon yap, PNR ile bul, yolcu iptali; ops: uçuş tanımla, uçuş iptal et, yolcu listesi | İşlem sınırları (transaction), use-case sırası |
| `apps/api/src/infra` | Drizzle şeması (aktif koltuk için kısmi benzersiz index dahil), migration'lar, repository uygulamaları, SQLite bağlantısı | Veritabanı ve tablo yapısı |
| `apps/api/src/http` | Hono route'ları, zod ile girdi doğrulama, ops anahtarı kontrolü, PNR deneme rate limit'i, hata→HTTP eşlemesi | HTTP sözleşmesinin sunucu tarafı |
| `apps/web` | Yolcu için Türkçe kullanıcı arayüzü (React); Operasyon arayüzü yok | Ekran durumu; iş kuralı içermez |
| `packages/shared` | API sözleşmesi: istek/yanıt tipleri, zod şemaları, hata kodları | Kablo üzerindeki veri biçimi |

## Communication rules
- İzinli yön: `http → app → domain`; `infra → domain` (repository arayüzleri domain/app'te tanımlıdır, `infra` uygular).
- `app`, repository'lere yalnızca arayüz üzerinden erişir; bağlantı `http` katmanının kurulum (composition) noktasında enjekte edilir.
- `apps/web` ↔ `apps/api` iletişimi yalnızca HTTP/JSON üzerinden ve `packages/shared` tipleriyle olur.
- Senkron çağrı yeterli; olay/mesaj kuyruğu yok.

## Forbidden dependencies (make them testable)
ESLint `no-restricted-imports` ile `scripts/check` içinde zorlanır (walking skeleton kurar).
1. `domain` hiçbir şeyi import etmez: Hono, Drizzle, better-sqlite3, `infra`, `http`, `app`, Node I/O (`node:fs`, `node:net`…) yasak. Domain saf TypeScript'tir.
2. `app`, `http`'yi ve Hono'yu import etmez.
3. `apps/web`, `apps/api`'yi import etmez; yalnızca `packages/shared`.
4. `packages/shared`, hiçbir uygulama paketini import etmez.
5. Veritabanına (Drizzle, better-sqlite3) yalnızca `infra` erişir.

## Deliberately out of scope
Ödeme ve fiyatlandırma · aktarmalı/çok bacaklı uçuşlar · dış hat ve çoklu saat dilimi · kabin sınıfları ·
koltuk değişikliği · check-in ve bagaj · e-posta/SMS bildirimleri · yolcu hesabı ve gerçek kimlik
doğrulama (parola/SSO) · Operasyon web arayüzü · mobil uygulama · çoklu havayolu/kiracı.
