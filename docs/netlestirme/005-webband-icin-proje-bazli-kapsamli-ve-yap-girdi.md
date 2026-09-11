[[netlestirme:005]]

# Netleştirme: Webband icin proje bazli, kapsamli ve yapici bir README/repo uzmani incelemesi i

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

Webband icin proje bazli, kapsamli ve yapici bir README/repo uzmani incelemesi issue olarak nasil yazilmali, RepoWarden bunu depo basina butceyle nasil tekrarlanabilir yapmali?

## Elde olan olgular

# Olgular — 5. Tur

## Kullanıcının cümlesi (özet, aynen parçalar)

"programın readmesini okuyup gerekirse biraz işleyişini öğrenecek kadar içine girip önerdiğin tagları
adama söyleseydin fena mı olurdu issue daha açıklayıcı olmalı 1/10 uyarı 2/10 gibi numaralandırılmış
... bu arkadaş web tabanlı bir oyun gibi duruyor sitesini readmeye eklemekte fayda var ... şu şu tagları
diye hazır öneriler ... masaüstü kısayol ekleyecek powershell komutu ... readme de şekil ... oyunun içinden
resim ... proje bazlı sanki sen bir readme uzmanısın repo uzmanısın ... kodun içine dalmak çok istemiyoruz
her repo için bir bütçemiz var ancak bütçe dahilinde girilip analiz yapılabilir şimdi daha iyisi ile
issueni güncelle"

## Önceki kurallar (kullanıcıdan)

- Biz yargıç değiliz; not verme (medium/high yok), "Small improvement" dili, haddini bil.
- Karşıya değer katmayan cümle yok. "Yardım ederim" yok — iş yükü doğurmasın.
- Yalnız yapıcı eleştiri; yapıcı değilse hiç yazma.

## Hedef depo: srknzl/Webband (Teknesyum/Webband'in fork'u; ana depo arşivli)

- Mount & Blade: Warband tarzı, tarayıcıda çalışan tek sayfa RPG. Build yok, bağımlılık yok, sunucu yok.
  Kurulum: klonla, `index.html` aç.
- Açıklama Türkçe: "Web tabanlı warband". README İngilizce.
- Topic: 0. Homepage: yok. GitHub Pages: kapalı (ana depoda da).
- Diller: JavaScript 1.09 MB, CSS 46 KB, HTML 16 KB.
- README: tanım, clone komutu, "What's in it" paragrafı, dosya tablosu, bug bildirme, lisans (AGPL).
  README "Turkish UI" diyor; oyunda TR/EN/ID üç dil var (i18n.js, lang-en.js, lang-id.js, ilk açılışta dil sorar).
  README dosya tablosunda i18n.js, lang-*.js, tools/, docs/ yok. README'de görsel/ekran görüntüsü yok.
- Görseller depoda: bg.jpg, bg_hdr.jpg (ikisi aynı blob SHA, 657 KB kopya), kingdom_crests.jpg, lord_portraits.jpg.
- index.html: lang="tr", title "WebBand - Kalradya"; meta description, og: etiketleri, favicon yok.
  Google Fonts'tan font çekiyor.
- CHANGELOG Türkçe, oyuncu dilinde, en son "0.74 — Aç Ordu (2026-09-11)"; sürüm app.js VERSION sabiti.
  Release: 0, tag: 0.
- CI: .github/workflows/test.yml — node tools/test.js ve tools/framegate.js, push ve PR'da. README'de rozet yok.
- Dokunmatik kontroller var (changelog: sol çubuk yürüt, sağ çubuk kılıç); docs/PLAN-mobil-port.md var.
- Bug şablonu var (.github/ISSUE_TEMPLATE/bug.md). Kayıtlar localStorage, JSON dışa aktarım.
- Depoda 8 açık issue, çoğu Türkçe, oyun tasarımı üzerine.

## Mevcut issue #88 (güncellenecek)

Tek öneri: topic ekle (javascript, css, html, github-actions, webband). Kullanıcı bunu yetersiz buldu.

## RepoWarden tarafı

- Deterministik tarayıcı var; model çağırmıyor. Kullanıcı artık depo başına bütçeli, projeyi anlayan
  bir "README/repo uzmanı" incelemesi istiyor.
