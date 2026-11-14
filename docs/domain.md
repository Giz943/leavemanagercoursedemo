# Domain

> Bootstrap'ta karara bağlandı (2026-11-07). Ortak dil: iş, insanlar ve ajanlar aynı kelimeyi aynı anlamda kullanır.

## Ubiquitous language

| Term | Meaning | Notes / not to be confused with |
|---|---|---|
| Çalışan (`Employee`) | İzin talep eden kişi. Tam olarak bir yöneticisi vardır. | Yönetici de bir çalışandır. |
| Yönetici (`Manager`) | Kendi ekibindeki çalışanların taleplerini onaylar/reddeder. | Rol, ayrı bir kişi türü değil; kendi talebi için o da çalışandır. |
| İzin türü (`LeaveType`) | `ANNUAL` (yıllık), `EXCUSE` (mazeret), `UNPAID` (ücretsiz). | Bakiyeden yalnızca `ANNUAL` düşer. |
| İzin talebi (`LeaveRequest`) | Başlangıç/bitiş tarihi (dahil), tür, açıklama ve durum. | Durumlar: `PENDING` (Beklemede) → `APPROVED` (Onaylandı) / `REJECTED` (Reddedildi) / `CANCELLED` (İptal edildi). |
| Aktif talep | Durumu `PENDING` veya `APPROVED` olan talep. | Çakışma kuralı yalnızca aktif talepleri dikkate alır. |
| İzin bakiyesi (`LeaveBalance`) | Çalışanın takvim yılı içinde kalan yıllık izin günü. | Hak (entitlement) − onaylı yıllık izin günleri. |
| Yıllık hak (`Entitlement`) | Çalışan başına yıllık sabit gün sayısı (varsayılan 14). | Kıdeme göre hesap yok (kapsam dışı). |
| İş günü (`Workday`) | Cumartesi, Pazar ve tanımlı resmî tatiller dışındaki takvim günü. | İzin süresi her zaman iş günü sayılır, takvim günü değil. |
| Resmî tatil (`PublicHoliday`) | Sistemde tanımlı, iş günü sayılmayan tarih. | Liste veri olarak tutulur; kod içine gömülmez. |

## Business rules
- **BR-1:** İzin süresi iş günü olarak hesaplanır; hafta sonu ve tanımlı resmî tatiller sayılmaz. Başlangıç ve bitiş günleri dahildir.
- **BR-2:** Yıllık izin (`ANNUAL`) talebinin gün sayısı, talep anındaki kalan bakiyeyi aşamaz.
- **BR-3:** Bakiye talep anında değil, **onay anında** düşülür. Onaylanmış bir yıllık izin iptal edilirse günler bakiyeye iade edilir.
- **BR-4:** Bir çalışanın tarih aralıkları çakışan iki aktif talebi olamaz.
- **BR-5:** Geçmiş tarihli (başlangıcı bugünden önce) talep oluşturulamaz. Yalnızca henüz başlamamış (`PENDING` veya `APPROVED`) talep iptal edilebilir.
- **BR-6:** Bir talebi yalnızca çalışanın yöneticisi karara bağlayabilir; yönetici **kendi talebini** onaylayamaz/reddedemez.
- **BR-7:** Yıllık hak sabittir (varsayılan 14 iş günü). Kıdeme göre hak ve devreden izin bu sürümde yoktur.
- **BR-8:** Bitiş tarihi başlangıç tarihinden önce olamaz; 0 iş günü süren talep (örneğin yalnızca hafta sonu) oluşturulamaz.

## Key domain invariants
- Kalan bakiye hiçbir zaman negatif olamaz.
- Durum geçişleri yalnızca `PENDING → APPROVED | REJECTED | CANCELLED` ve `APPROVED → CANCELLED` şeklindedir; `REJECTED` ve `CANCELLED` son durumlardır.
- Onay ve bakiye düşümü tek bir transaction içinde gerçekleşir; biri olup diğeri olmaz.
- Karar (onay/red) her zaman kararı vereni (`decidedBy`) ve zamanını (`decidedAt`) kaydeder.

## Sensitive areas
- **Bakiye hesabı** (BR-1, BR-2, BR-3, BR-7): yanlış hesap, çalışana fazla/eksik izin demektir.
- **Onay yetkisi** (BR-6 ve `docs/security.md` AuthZ): yanlış yetki, başkasının talebini karara bağlamak demektir.

Bu alanlara dokunan spec, Constraints bölümünde `Sensitive area: <ad>` yazar; lite modda da clarify
gate'i sorulur, her fix turu yeniden review edilir ve her kriter bir bilinçli kırma ile kırmızıya
düşürülerek kanıtlanır.
