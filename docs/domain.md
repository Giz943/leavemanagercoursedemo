# Domain

> Bootstrap'ta karara bağlandı (2026-11-07); domain 2026-11-11'de İzin Yöneticisi'nden **Uçuş
> Rezervasyon**'a değiştirildi. Ortak dil: iş, insanlar ve ajanlar aynı kelimeyi aynı anlamda kullanır.

## Ubiquitous language

| Term | Meaning | Notes / not to be confused with |
|---|---|---|
| Yolcu (`Passenger`) | Rezervasyon yapan kişi: ad, soyad, e-posta. Hesabı yoktur. | Kimliği rezervasyon üzerinden PNR + soyadı ile kanıtlanır (`docs/security.md`). |
| Operasyon (`Operations`) | Uçuş tanımlayan, uçuş iptal eden ve yolcu listesini gören havayolu personeli. | Yalnızca API üzerinden çalışır (`X-Ops-Key`); web arayüzü yoktur. |
| Havalimanı (`Airport`) | 3 harfli IATA kodu (`IST`, `ESB`, `ADB`…). | Yalnızca iç hat; hepsi `Europe/Istanbul` saat diliminde. |
| Uçuş (`Flight`) | Uçuş no (`AB1234`), kalkış/varış havalimanı, kalkış/varış zaman anı, koltuk düzeni, durum. | Durumlar: `SCHEDULED` (Planlandı) → `CANCELLED` (İptal edildi). |
| Koltuk düzeni (`SeatMap`) | Uçuştaki koltukların listesi: sıra (1–99) + harf (A–F), örn. `12C`. | Tek kabin sınıfı (ekonomi). Kapasite = koltuk sayısı. |
| Rezervasyon (`Booking`) | Yolcu + uçuş + koltuk; 6 karakterlik **PNR** kodu ve durum. | Durumlar: `CONFIRMED` (Onaylı) → `CANCELLED` (Yolcu iptal etti) / `CANCELLED_BY_AIRLINE` (Havayolu iptal etti). |
| Aktif rezervasyon | Durumu `CONFIRMED` olan rezervasyon. | Koltuk ve kapasite kuralları yalnızca aktif rezervasyonları sayar. |
| PNR (`Pnr`) | Rezervasyonun yolcuya verilen 6 karakterlik kodu. | Tahmin edilemez olmalı; ID değildir (iç ID ayrıca UUID). |
| Satış kapanışı | Kalkıştan 1 saat önce. | Sınır anında satış **kapalı** (BR-3). |
| İptal penceresi | Kalkıştan 24 saat öncesine kadar. | Sınır anında iptal **açık** (BR-4). |

## Business rules
- **BR-1:** Bir uçuşta bir koltuğun en fazla bir aktif rezervasyonu olur (çift satış yok).
- **BR-2:** Bir uçuşun aktif rezervasyon sayısı koltuk sayısını aşamaz (overbooking yok); koltuk, uçuşun koltuk düzeninde bulunmalıdır.
- **BR-3:** Rezervasyon yalnızca `now < kalkış − 1 saat` iken ve uçuş `SCHEDULED` iken yapılabilir. Tam `kalkış − 1 saat` anında satış kapalıdır.
- **BR-4:** Yolcu rezervasyonunu yalnızca `now ≤ kalkış − 24 saat` iken iptal edebilir (sınır dahil). İptal edilen koltuk yeniden satışa açılır.
- **BR-5:** Aynı uçuşta aynı e-posta (küçük harfe normalize) ile birden fazla aktif rezervasyon olamaz.
- **BR-6:** Yolcu yalnızca PNR + soyadı eşleşen rezervasyonu görür ve iptal eder. Uçuş tanımlama, uçuş iptali ve yolcu listesi yalnızca Operasyon'a açıktır.
- **BR-7:** Operasyon bir uçuşu iptal ettiğinde uçuş `CANCELLED` olur ve uçuşun tüm aktif rezervasyonları **aynı transaction'da** `CANCELLED_BY_AIRLINE` olur. BR-4'ün 24 saat penceresi havayolu iptaline uygulanmaz. İptal edilmiş uçuşa rezervasyon yapılamaz.
- **BR-8:** Soyadı karşılaştırması baştaki/sondaki boşluk kırpılıp `tr-TR` locale ile büyük harfe çevrilerek yapılır: `Işık` = `IŞIK` = `ışık`, ama `Işık` ≠ `Isik` (ASCII katlama yok).

## Key domain invariants
- Bir `(uçuş, koltuk)` çifti için en fazla bir `CONFIRMED` satır vardır — domain kontrolüne ek olarak veritabanında kısmi benzersiz index ile de zorlanır.
- Durum geçişleri yalnızca `CONFIRMED → CANCELLED | CANCELLED_BY_AIRLINE` ve uçuş için `SCHEDULED → CANCELLED` şeklindedir; iptal durumları son durumdur.
- Uçuş iptali ve rezervasyonların iptali tek transaction'dır; biri olup diğeri olmaz.
- Varış zamanı kalkış zamanından sonradır.
- Her iptal kaydı zamanını (`cancelledAt`) tutar.

## Sensitive areas
- **Koltuk tahsisi** (BR-1, BR-2, BR-5, BR-7): yanlış tahsis, aynı koltuğun iki yolcuya satılması veya kapasite aşımı demektir.
- **Zaman pencereleri** (BR-3, BR-4): sınır hatası, kapanmış satışın açık kalması ya da yolcunun haklı iptalinin reddedilmesi demektir.
- **Yetki** (BR-6, BR-8 ve `docs/security.md` AuthN/AuthZ): yanlış yetki, başkasının rezervasyonunu görmek/iptal etmek veya ops uçlarına anahtarsız erişim demektir.

Bu alanlara dokunan spec, Constraints bölümünde `Sensitive area: <ad>` yazar; lite modda da clarify
gate'i sorulur, her fix turu yeniden review edilir ve her kriter bir bilinçli kırma ile kırmızıya
düşürülerek kanıtlanır.
