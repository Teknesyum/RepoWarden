[[netlestirme:001]]

# Netleştirme: 1) Teknesyum/.github private yapilmali mi? 2) RepoWarden mantikli mi, tam olarak

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

1) Teknesyum/.github private yapilmali mi? 2) RepoWarden mantikli mi, tam olarak ne is yapacak, yoksa baska bir yere mi aktarilmali (kullanicinin 'gite mi aktaralim' ifadesi belirsiz)? Karar icin gereken netlestirme sorulari neler?

## Elde olan olgular

# Olgular

## Kullanıcının cümlesi (aynen)

"peki .github private mi yapmalıyız sence
repowarden mantıklı mı yoksa gite mi aktaralım tam olarak ne iş yapacak vb bunları fable ile inceleyin"

"gite mi aktaralım" ifadesinin anlamı belirsiz: "gist'e", "git'e (özel depoya)" ya da başka bir şey olabilir.

## Hesap

- `Teknesyum` bir **User** hesabı, organization değil. 14 public depo.
- `Teknesyum/Teknesyum` adlı depo yok (404).
- User hesaplarında profil README'si `Teknesyum/Teknesyum` deposundan okunur. `.github/profile/README.md` yalnız organization'larda çalışır. Yani `.github` içindeki `profile/README.md` şu an hiçbir yerde görünmüyor.

## `Teknesyum/.github`

- 2026-09-08'de denetim oturumunda açıldı, tek commit. Public.
- İçerik: FUNDING.yml, SECURITY.md, CONTRIBUTING.md, DCO, README.md, profile/README.md + 2 rozet.
- GitHub varsayılan topluluk dosyalarını yalnız public `.github` deposundan okur. Private yapılırsa varsayılanlar devre dışı kalır.
- Arşivsiz 12 public deponun 12'si FUNDING.yml'yi, 10'u SECURITY.md'yi buradan alıyor. Runly ve Usb-Guard kendi SECURITY.md'sini taşıyor.
- Usb-Guard'ınki projeye özel (yönetici izni, .bat içeriği, SHA256). Runly'ninki `.github` açılmadan 29 saniye önce eklendi, genel şablonla neredeyse aynı.

## RepoWarden

- `Teknesyum/RepoWarden`, 2026-09-09 açıldı, public, AGPL-3.0-or-later, 1 commit.
- İçerik: README.md + README.tr.md, LICENSE, iki SVG akış diyagramı, docs/ altında 2026-09-08 denetim raporu, devir notu, SEO danışması, diyagram kararı, plan.
- **Kod yok.** Ne betik ne ikili dosya. README bunu dürüstçe söylüyor: "It runs as a procedure over `gh`, not a binary."
- Yaptığı iş fiilen: bir model oturumunun `gh api` ile 15 depoyu taraması, rapor yazması, 13 depoyu düzeltip itmesi, 7 yıkıcı işi onaya bırakması. Bu işi bir kez, elle yönlendirilen bir Claude oturumu yaptı.
- Denetlenen katmanlar: release (draft, asset, `releases/latest`), belgeler (README, CHANGELOG, SECURITY, LICENSE), üstveri (açıklama, topic, dal, wiki), bütünlük (kırık göreli bağlantı, fork URL'si), hijyen (commit'li trash/), hesap (`.github` eksikliği).
- İlk koşum sayıları: 15 taranan, 13 değiştirilen, 2 kritik, 7 onay bekleyen.
- SEO danışmanı adı ve 10 topic'i önerdi; ikisi uygulandı.
- Bekleyen plan: README'yi sayıyla açılacak ve mermaid diyagramlı olacak şekilde yeniden yazmak. Uygulanmadı.

## Sahip

- Tek kişi, hesabın sahibi. Çok sayıda küçük public depo. Teknesyum Core adlı bir Claude Code eklentisi yazıyor; eklentide betikler (scaffold.js, agency.js, advice.js, kutuphane.js) var.
- Kural: ölü dosya ağaçta kalmaz, `trash/`e taşınır. Depo belgeleri İngilizce. Yıkıcı işlem öncesi tek cümle sorulur.
- Özel depo: `Teknesyum-Private` (private).
