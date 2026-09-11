[[netlestirme:003]]

# Netleştirme: RepoWarden srknzl hesabinda kuru kosturulmadan ve profil deposu acilmadan once g

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

RepoWarden srknzl hesabinda kuru kosturulmadan ve profil deposu acilmadan once gelistirilmesi gereken bir sey var mi?

## Elde olan olgular

# Olgular — 3. Tur

## Kullanıcının istekleri (aynen)

"profil deposunu aç, issue'ları aç ancak https://github.com/srknzl kardeşimin repolarında test yapalım önce analiz yapılsın şu kadar repoda şu kadar eksik bulundu gibisinden sonra onayımla issueleri attırırım"

Ardından: "üsttekini çalışmadan önce geliştirme var mı diye kontrol et son bi kez"

## Yapılacaklar

1. `Teknesyum/Teknesyum` public deposunu açıp profil README'sini koymak. İçerik hazır:
   ad, bio, konum, 3 tablo (Desktop Tools 7, Learning And Games 2, Developer Tools 3 — RepoWarden dahil),
   sponsor ve lisans rozetleri `.github/profile/` altındaki SVG'lere raw URL ile bağlı.
2. RepoWarden'ı `srknzl` hesabında kuru koşumla koşturmak, "N depoda M eksik" özeti vermek.
   Issue açmak kullanıcının sonraki onayına kalıyor.

## RepoWarden'ın bugünkü hali

- `bin/repowarden.mjs`, Node, `gh` üzerinden. Kuru koşum varsayılan; `--issues` depo başına tek
  etiketli issue açar, günceller, iş kalmayınca kapatır. `--repo X` tek depo.
- `rules.json`: owner Teknesyum, `.github` atla, fork atla, arşiv atla, private atla, en az 3 topic,
  lisans AGPL-3.0, dal main, README'de `<!-- lang -->` ve `<!-- signature -->`, README.tr.md ikizi, mermaid.
- Kontroller: açıklama, topic sayısı, lisans var mı/AGPL mi, varsayılan dal, README var mı,
  işaretler, tr ikizi, mermaid, bütün release'ler draft mı, tag var release yok, release'siz sürüm tag'i.
- Owner şu an kodda `rules.owner`'dan geliyor, komut satırından değiştirilemiyor.
- Rapor `reports/audit-<tarih>.md`, gitignore'da.

## srknzl hesabı

- Kullanıcının kardeşi. 121 depo; 74'ü fork değil; 44'ü fork değil ve arşivsiz.
- Onun depoları Teknesyum'un kişisel README kurallarını (lang/signature işareti, Türkçe ikiz,
  mermaid, AGPL) bilmez; bu kurallar ona uygulanırsa her depoda gürültü çıkar.
- Başkasının deposuna issue açmak dışarıya görünen bir iş.
