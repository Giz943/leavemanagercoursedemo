# Spec 0001 — walking-skeleton

- Status: Shipped
- Mode: lite
- Plan: `specs/plans/0001-plan.md`
- Self-critique: done

## Intent
Geliştirici (ve kurs katılımcısı), Uçuş Rezervasyon'un iş özelliklerine başlamadan önce uçtan uca
çalışan, en küçük bir iskelet istiyor: arayüzden API'ye istek gider, cevap ekranda görünür ve tek
bir komut (`scripts/check`) projenin sağlıklı olduğunu kanıtlar. Başarı: bootstrap'ta kararlaştırılan
toolchain kurulmuş, mimari sınırlar araçla zorlanıyor, her test katmanından bir örnek çalışıyor ve
`check.conf` adımları etkin. Bilinçli olarak YAPILMAYAN: hiçbir rezervasyon iş kuralı, veritabanı tablosu
olan bir domain modeli, oturum/kimlik doğrulama, tasarım/stil çalışması.

## Requirements
1. Sistem, çalışır durumda olduğunu bildiren bir sağlık sorgusuna yanıt verir; yanıt servisin ayakta
   olduğunu ve veritabanına ulaşılabildiğini belirtir. Sağlık sorgusu oturum gerektirmez (ileride
   gelecek varsayılan-red kuralının belgelenmiş istisnası).
2. Arayüzde, açılışta sağlık durumunu sorgulayan ve sonucu Türkçe gösteren tek bir sayfa vardır.
3. Sağlık yanıtının biçimi arayüz ile sunucu arasında paylaşılan tek bir sözleşmede tanımlıdır.
4. Mimari yasak bağımlılıklar (`docs/architecture.md`) ihlal edildiğinde doğrulama komutu başarısız olur.
5. Her test katmanından (domain birim, bileşen, API entegrasyon) en az bir örnek test bulunur ve
   doğrulama komutu içinde çalışır.
6. Geliştirici, API'yi ve arayüzü yerelde tek bir komutla başlatabilir (bu komut doğrulama
   komutunun parçası değildir).
7. Doğrulama komutunun hızlı ve tam profilleri bootstrap'ta planlanan adımları çalıştırır ve geride
   çalışan süreç ya da veri bırakmaz.

## User experience
- Flow: Kullanıcı arayüzü açar → sayfa otomatik olarak sağlık durumunu sorgular → sonucu görür.
- States:
  - **Yükleniyor:** "Sistem durumu kontrol ediliyor…" metni görünür.
  - **Başarılı:** "Sistem çalışıyor" metni ve veritabanı durumu ("Veritabanı: bağlı") görünür.
  - **Hata:** API'ye ulaşılamaz veya hata dönerse "Sistem durumuna ulaşılamadı" metni görünür.
  - Boş durum ve yetkisiz durum yoktur (veri listesi ve oturum yok).
- Design reference: none — the flow above is the design.
- Accessibility: durum metni `role="status"` (canlı bölge) içinde okunur; sayfanın bir `<h1>` başlığı
  ("Uçuş Rezervasyon") vardır; klavye ile etkileşim gerektiren öğe yoktur. Uygulama dili `lang="tr"`.

## Constraints & out of scope
- Stack ve sürümler `docs/conventions.md`'de sabittir: Node 26 LTS (plan 0001, Risk 1), TypeScript strict, Hono, SQLite +
  Drizzle, React + Vite, Vitest, ESLint, Prettier.
- Veritabanı erişimi gerçek bir SQLite bağlantısıyla doğrulanır (örn. basit bir sorgu); iş tablosu yok.
- Domain birim testi örneği, ileride kullanılacak saf bir yardımcıyı (takvim günü `YYYY-MM-DD`
  doğrulaması) kanıtlar — iş kuralı içermez.
- Kapsam dışı: uçuşlar, rezervasyonlar, koltuk tahsisi, ops anahtarı, PNR erişimi, stil/tasarım sistemi, e2e testleri,
  üretim dağıtımı, Docker.
- Domain katmanı için %90 satır + dal coverage eşiği (`docs/testing.md`) bu spec'ten itibaren
  zorlanır; AC-8'in "yeşil" şartının parçasıdır.
- Not a sensitive area (koltuk tahsisi, zaman pencereleri veya yetkiye dokunmaz).
- Revizyon (2026-11-11): domain İzin Yöneticisi'nden Uçuş Rezervasyon'a değişti; yalnızca ürün adı
  (h1/title) ve kapsam dışı metni güncellendi, kriterler aynı.
- Revizyon (2026-11-11, review round 1 L-4): Node sürümü satırı plan 0001 Risk 1 kararına (Node 26) eşitlendi.
- Split: değerlendirildi, tek kullanıcı yeteneği (sistem durumu) — bölünmedi.

## Acceptance criteria
- [x] AC-1 — Sağlık sorgusu, servis ve veritabanı ayaktayken başarılı yanıt döner ve yanıt, servisin çalıştığını ve veritabanının bağlı olduğunu belirtir; yanıt paylaşılan sözleşmeye uyar.
- [x] AC-2 — Veritabanına ulaşılamadığında sağlık sorgusu başarısız (servis kullanılamaz) yanıtı döner ve yanıt veritabanının bağlı olmadığını belirtir; iç hata detayı (stack trace, SQL, dosya yolu) içermez.
- [x] AC-3 — Arayüz, sağlık yanıtı beklenirken "Sistem durumu kontrol ediliyor…" metnini bir durum bölgesinde (`role="status"`) gösterir.
- [x] AC-4 — Arayüz, başarılı yanıtta "Sistem çalışıyor" ve "Veritabanı: bağlı" metinlerini gösterir.
- [x] AC-5 — Arayüz, istek başarısız olduğunda (ağ hatası veya başarısız yanıt) "Sistem durumuna ulaşılamadı" metnini gösterir.
- [x] AC-6 — Takvim günü doğrulayıcısı geçerli bir `YYYY-MM-DD` değerini kabul eder; biçimsiz değerleri ve var olmayan tarihleri (örn. `2026-02-30`) reddeder; artık yılda `29 Şubat`'ı kabul eder.
- [x] AC-7 — `docs/architecture.md`'deki beş yasak bağımlılığın **her biri** için, o kuralı ihlal eden örnek bir import lint hatası üretir (kural başına bir test); gerçek kaynak kodda böyle bir import lint adımını kırmızıya çevirir.
- [x] AC-8 — `scripts/check` (tam) ve `scripts/check --fast` yeşil biter; fast profil API entegrasyon testlerini çalıştırmaz, tam profil çalıştırır; her iki profilde residue testi temizdir.
- [x] AC-9 — Geliştirici tek bir komutla API'yi ve arayüzü yerelde başlatır; tarayıcıda açılan sayfa sağlık durumunu ("Sistem çalışıyor", "Veritabanı: bağlı") gösterir.

## Definition of Done
- [x] Every acceptance criterion mapped to proof (test or reproducible observation)
- [x] `scripts/check` green
- [x] Independent review done; real findings fixed, noise rejected with written rationale, deferred ones in `specs/backlog.md`
- [x] Docs / ADRs updated if behavior or architecture changed
- [x] Spec moved to `specs/done/` (it becomes immutable there)

## Scorecard (fill at ship — honest numbers make the process improvable)
| Metric | Value |
|---|---|
| Spec revisions | 2 (domain switch İzin Yöneticisi → Uçuş Rezervasyon; review round 1 L-4 Node 26) |
| Fix rounds | 2 |
| Review findings: real / noise / deferred | 8 / 1 / 3 (round 1: 5 / 1 / 3 · round 2: 3 / 0 / 0) |
| Regressions introduced | 0 |
| Bugs escaped to production | 0 (henüz üretim dağıtımı yok) |
