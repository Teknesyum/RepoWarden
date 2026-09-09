# depo adi ve SEO

- tarih: 2026-09-09
- danisilan: agency/marketing-seo-specialist
- maliyet: 53437 token, 42 sn

## Girdi

# Danışma — SEO Specialist koltuğu

Aşağıdaki olgular sana verilenlerin tamamıdır. Dosya okuma, arama yapma. Türkçe cevap ver.

## Olgular

- Teknesyum adlı GitHub hesabı yeni bir public depo açıyor. Lisans AGPL-3.0-or-later.
- Ürünün işi, sahibinin kendi cümlesiyle: "Tüm GitHub repolarınızı inceler, sorunlarını
  analiz eder, çözüm önerir, talebiniz doğrultusunda düzeltir."
- Yani: bir GitHub hesabındaki tüm depoları `gh api` ile tarayıp yayın katmanı sorunlarını
  bulan ve onay alarak düzelten bir denetim aracı. Taradığı şeyler: depo açıklaması, konu
  etiketleri, lisans, README, README.tr.md, CHANGELOG, tag/release durumu, kök dosyalar,
  GitHub Actions iş akışları, göreli bağlantıların kırıklığı, wiki/discussions ayarları,
  varsayılan dal adı, FUNDING.yml ve SECURITY.md eksikliği, `trash/` gibi olmaması gereken
  commit'li klasörler.
- Bulduğu tipik sorunlar: bütün release'lerin Draft kalması yüzünden `releases/latest`
  404 dönmesi ve tek satır kurulum betiklerinin herkeste kırık olması; README'de başka
  hesabın fork URL'sinin klonlanması; README'nin "her release SHA-256 yayınlar" demesi
  ama hiçbir release'de asset olmaması; depo adı ile uygulama adının farklı olması.
- Kanıt var: araç 15 depoda gerçekten koşturuldu, 13 depo düzeltildi ve push edildi.
- Çıktısı: her depoya bırakılan Markdown denetim notu + merkezi bir rapor + depo başına
  kopyalanabilir düzeltme promptu.
- Şu an yalnız yerel bir klasör adı var, geçici ve Türkçe: "Github Denetimi". GitHub'da
  henüz depo açılmadı, yani ad serbest.
- Aynı hesaptaki diğer depo adları şöyle: VidShrink, Ghostlist, ProcWitness, CodeXRay,
  Runly, Usb-Guard, Teknesyum-Core, Teknesyum-UI, Reclatch, Quizloop. Hepsi kısa, marka
  gibi, PascalCase ya da tek kelime; hiçbiri açıklayıcı-tümce tipi ad değil.
- Depo dokümanları İngilizce yazılıyor (README, CHANGELOG). Arayüz/rapor metni Türkçe olabilir.
- Hedef kitle: çok sayıda public depo tutan tek kişilik geliştiriciler ve küçük kurumlar.
- Keşif kanalı öncelikle GitHub'ın kendi araması ve konu etiketi sayfaları; ikincil olarak
  Google. Site yok, backlink profili yok, Search Console verisi yok.

## Soru

1. Depo adı ne olsun? En fazla üç aday ver, her biri için tek satır gerekçe. Adın GitHub
   arama sıralamasında ne yaptığını ve hesabın mevcut adlandırma düzenine uyup uymadığını
   söyle. Bir tanesini açıkça öner.
2. GitHub depo açıklaması (`description`, 350 karakter sınırı ama 120-160 arası tut) ne
   olsun? İngilizce, tam metin ver.
3. Konu etiketleri (`topics`) ne olsun? En fazla 12 tane, GitHub'da gerçekten aranan
   etiketler olsun, uydurma etiket verme.
4. README'nin ilk ekranı (H1, tek cümlelik tanım, ilk 100 kelime) hangi anahtar sözcükleri
   taşımalı? Ham metin değil, madde madde söyle.
5. Bu aşamada yapılmaması gereken bir SEO hamlesi var mı? Varsa tek paragraf.

Cevabı Türkçe, kısa ve madde madde yaz. Şablon doldurma, giriş cümlesi kurma.

## Donen

**1. Depo adı — 3 aday**

- **RepoWarden** — "warden" denetleyip düzeltme yetkisini anlatır; hesabın ProcWitness/Usb-Guard koruyucu-ad damarına birebir oturur.
- **Repolish** — repo + polish; kısa, akılda kalıcı, "düzeltir" vaadini taşır ama "denetim" tarafını zayıf anlatır.
- **RepoXRay** — CodeXRay ile aile kurar; ancak aynı hesapta **yamyamlaştırma riski**: CodeXRay zaten "code analysis/inspection" birincil sözcüğünü sahiplenmiş, ikisi aynı sorguda çarpışır. Bu yüzden elenmeli.

**Önerim: RepoWarden.**

- GitHub aramasında ad, en güçlü alan: depo adındaki token'lar (`repo`) `repository audit`, `repo health`, `repo checker` sorgularında doğrudan eşleşir; açıklama ve topics ikincil, yıldız/güncellik sıralamayı büker.
- Adlandırma düzenine uyumu: PascalCase, iki kelime, tümce değil — VidShrink/ProcWitness/Ghostlist kalıbının aynısı.
- Birincil anahtar sözcük ataması: bu depo = **"github repository audit"**. CodeXRay = "code analysis". Runly/Reclatch ile örtüşme yok.

**2. Description (İngilizce, 150 karakter)**

`Audit every GitHub repo in your account: find broken releases, missing README, license and metadata issues — then fix them with your approval.`

**3. Topics (10, GitHub'da gerçekten kullanılan)**

`github` · `github-api` · `gh-cli` · `cli` · `developer-tools` · `automation` · `repository-management` · `code-quality` · `devops` · `open-source`

- `linter` ve `static-analysis` bilerek dışarıda: CodeXRay'in alanı, yamyamlaştırma yaratır.
- Uydurma etiket (`repo-audit`, `readme-checker` gibi) vermedim; bunlar aranmıyor.

**4. README ilk ekranı — taşıması gereken sözcükler**

- **H1**: `RepoWarden` + tire + fonksiyon: "GitHub Repository Audit Tool". Salt marka adı H1'de tek başına kalmasın.
- **Tek cümlelik tanım**: `audit`, `all your GitHub repositories`, `gh api`, `fix with your approval` geçsin.
- **İlk 100 kelime** birincil: `github repository audit`, `repository health check`, `broken release`, `releases/latest 404`, `README`, `LICENSE`, `topics`, `SECURITY.md`, `GitHub Actions`.
- İkincil/uzun kuyruk: `draft release`, `broken install script`, `missing changelog`, `relative link checker`, `default branch`, `FUNDING.yml`.
- Kanıt (E-E-A-T): "15 repos scanned, 13 fixed and pushed" ilk ekranda sayıyla dursun — GitHub'da bunun karşılığı güvendir, sıralama değil.
- Rozetler H1'in hemen altında ama tanım cümlesinin *üstünde değil*; ilk 100 kelimeyi rozet metni yemesin.
- AGPL-3.0-or-later açıkça yazılsın; lisans kaygısı bu kitlenin filtresidir.

**5. Şu an yapılmaması gereken**

Site açıp Google/backlink tarafına yatırım yapmayın — bu aşamada tek keşif kanalı GitHub'ın kendi araması ve topic sayfaları, oralar da yıldız + güncellik + ad/topic eşleşmesiyle çalışır; ayrıca elde Search Console verisi olmadığı için hiçbir Google hamlesinin ölçümü yapılamaz. Aynı gerekçeyle: ürün adını farklı yazımlarla ikinci bir depoya açmayın, README'yi anahtar sözcükle şişirmeyin, topic listesini 12'ye doldurmak için alakasız etiket eklemeyin (GitHub alakasız topic'te sizi zaten sıralamaz, kitle sinyalinizi bozar). Hacim/zorluk sayısı da veremem — bu kanallar için elde veri yok, olmadığını söylüyorum.
