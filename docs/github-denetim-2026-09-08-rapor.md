# GitHub Denetimi — 2026-09-08

15 depo tarandı (`gh api`): açıklama, konu etiketleri, lisans, README, README.tr.md, CHANGELOG,
sürüm/tag/release, kök dosyalar, iş akışları, göreli bağlantılar. Ham döküm: `github-denetim-2026-09-08/kanit/`.

## Özet Tablo

| Depo | Durum | Ana sorun |
|---|---|---|
| Ghostlist | **KRİTİK** | 4 release'in hepsi Draft → `releases/latest` 404, kurulum tek satırı çalışmıyor |
| ProcWitness | **KRİTİK** | 14 release'in hepsi Draft → 3 platformun kurulum betiği 404 |
| CodeXRay | **YÜKSEK** | README `srknzl/CodeXRay` klonluyor, `serkanozel.me` yayın bölümü, 0 release (sürüm 2.3.4) |
| Teknesyum-Core | ORTA | 20+ release'de 0 asset, README "her release SHA-256 yayınlar" diyor; release adları tutarsız |
| Teknesyum-UI | ORTA | Hiç tag/release yok; `../Teknesyum-Core` bağlantısı kırık; `trash/` commit'li |
| Teknesyum-Base | ORTA | Arşivli ama README'de "Core + UI'ya taşındı" notu yok; 8 tag, 0 release |
| VidShrink | DÜŞÜK | `kanit/T115-*` tag'leri GitHub'da; Türkçe çalışma dosyaları + `trash/` + `.claude/agent-memory` public'te |
| Runly | DÜŞÜK | CHANGELOG'da yayınlanmamış düzeltmeler; ekran görüntüsü v0.1.3; SECURITY.md yok |
| Usb-Guard | DÜŞÜK | Konu etiketi sıfır; arayüzün Türkçe olduğu README'de söylenmiyor |
| Gothic-1-Remake-Picklocker | DÜŞÜK | Depo adı "Picklocker", uygulama "LockPicker"; 3 tag, 0 release; CHANGELOG yok |
| Quizloop, Reclatch | OK | Planlama aşaması, tutarlı |
| VideoEdit | OK | Private, tutarlı |
| Webband | ARŞİV | README yok, açıklama Türkçe |
| Teknesyum-Private | OK | Private |

## Ortak Sorunlar (Tek Yerden Çözülür)

1. **`Teknesyum/.github` deposu yok.** FUNDING.yml yalnız Base'de; diğer 12 public depoda Sponsor
   butonu görünmüyor. SECURITY.md hiçbir depoda yok (Runly README "gizli bildir" diyor ama kanal yok).
   Tek depo `.github` ile FUNDING.yml + SECURITY.md + CONTRIBUTING.md tüm depolara varsayılan olur.
2. **Profil README'si yok** (`Teknesyum/Teknesyum`).
3. **Wiki 11 depoda açık, hiçbirinde kullanılmıyor.** Discussions yalnız Base'de açık (arşivli).
4. **Homepage boş** (ProcWitness kendi repo URL'sini, Base sponsor linkini gösteriyor).
5. **`trash/` üç depoda commit'li** (Core, UI, VidShrink). Kural: trash yerel, git'e girmez → `.gitignore`.
6. **Varsayılan dal `master`**: Gothic, VideoEdit. Diğerleri `main`.

---

## Proje Proje Bulgular Ve T0 Promptları

### 1. Ghostlist — KRİTİK

**Bulgular**
- Release'ler: v2.0.2, v2.0.1, v2.0.0, v1.0.0 → **hepsi Draft**. `releases/latest` 404 döner.
- `scripts/install.ps1` satır 10: `releases/latest/download/Ghostlist-win-x64.zip` → kurulum herkese kırık.
- README "Current version v2.0.2", "Download: releases/latest" → ölü bağlantı.
- CHANGELOG.md yok (CONTRIBUTING + DCO var).
- Sponsor rozeti shields.io; diğer depolar `assets/badge-sponsor.svg` + imza bloğu kullanıyor.
- Wiki açık, konu etiketleri tamam.

**T0 promptu**
```
Ghostlist deposunda GitHub yayın katmanını düzelt. Bulgular:

1. Dört release'in hepsi Draft (v2.0.2, v2.0.1, v2.0.0, v1.0.0). Bu yüzden
   https://github.com/Teknesyum/Ghostlist/releases/latest 404 dönüyor ve
   scripts/install.ps1 satır 10'daki tek satır kurulum herkese kırık.
   Yap: v2.0.2'yi yayınla (gh release edit v2.0.2 --draft=false), asset'leri koru
   (Ghostlist-win-x64.zip + .sha256). v2.0.1 ve v2.0.0 draft'larını da yayınla ya da sil;
   v1.0.0'ı yayınla (tarihçe). Sonra `irm .../install.ps1 | iex` akışını gerçekten çalıştırıp
   doğrula; çıktıyı göster.
2. CHANGELOG.md yok. Keep a Changelog biçiminde yaz: v2.0.2, v2.0.1, v2.0.0, v1.0.0
   (README "History" bölümündeki ProgramFixer → Ghostlist geçişi v2.0.0'a girer).
   Her sürümün tarihini tag tarihinden al.
3. README "Support" bölümü shields.io rozeti kullanıyor; VidShrink/Runly/Usb-Guard'daki
   standarda geç: assets/badge-sponsor.svg + assets/badge-license.svg + imza bloğu
   (<!-- signature --> ... github.com/Teknesyum). Rozet svg'leri yoksa Runly'den kopyala.
4. Depo ayarları: gh repo edit Teknesyum/Ghostlist --enable-wiki=false
5. README'nin "Install" bölümündeki winget notu ("manifest hazır, gönderilmedi") güncel mi
   kontrol et; değilse düzelt.

Kısıtlar: README ve CHANGELOG İngilizce; kod yorumu yok; commit mesajları İngilizce;
`git commit -s`. Bitince değişen dosyaları ve release URL'lerini listele.
```

### 2. ProcWitness — KRİTİK

**Bulgular**
- 14 release, **hepsi Draft** (v0.2.0 … v0.9.0). `releases/latest` 404.
- `scripts/install.ps1` satır 4 `api.github.com/.../releases/latest` çağırıyor → Windows, Linux, macOS üçü de kırık.
- v0.3.9 draft'ının tag'i yok (tag listesinde v0.3.8 → v0.4.0).
- v0.9.0 asset'leri hazır: win-x64.zip, linux-x64.tar.gz, osx-arm64, osx-x64.
- Homepage kendi repo URL'si (anlamsız). CI iş akışı yok (`.github/workflows` 404).
- `Directory.Build.props` içinde `<Version>` yok; sürüm kaynağı belirsiz.
- README uzun ama tutarlı; CHANGELOG 0.9.0 ile uyumlu.

**T0 promptu**
```
ProcWitness deposunda GitHub yayın katmanını düzelt. Bulgular:

1. 14 release'in hepsi Draft. scripts/install.ps1 (satır 4), install-linux.sh ve
   install-macos.sh releases/latest'e gidiyor ve 404 alıyor; üç platformda da kurulum kırık.
   Yap: v0.9.0'ı yayınla (gh release edit v0.9.0 --draft=false); 4 asset'i koru.
   Diğer 13 draft'ı sil (gh release delete <tag> --yes); tag'leri bırak. v0.3.9 draft'ının
   tag'i zaten yok. Sonra Windows kurulum tek satırını çalıştırıp doğrula, çıktıyı göster.
2. Homepage kendi repo URL'sine işaret ediyor: gh repo edit --homepage "" ile temizle.
   Wiki kapat: gh repo edit --enable-wiki=false
3. Directory.Build.props içinde <Version> yok. Sürümün tek kaynağını belirle (Build.props
   önerilir, 0.9.0) ve scripts/build-release.ps1 -Version parametresini oradan okut ya da
   README "Build from source" örneğini gerçek akışla eşle.
4. CI yok. Runly/Ghostlist'teki ci.yml'yi örnek alıp dotnet test çalıştıran minimal bir
   .github/workflows/ci.yml ekle (windows-latest yeterli).
5. README kontrol: "Formerly released as AI Scanner" satırı ile CHANGELOG'daki ilk sürüm
   uyumlu mu; sponsor rozetini standarda çek (assets/badge-sponsor.svg + imza bloğu).

Kısıtlar: İngilizce; kod yorumu yok; git commit -s. Bitince release URL'sini ve
değişen dosyaları listele.
```

### 3. CodeXRay — YÜKSEK

**Bulgular**
- README "Quick Start" iki kez `git clone https://github.com/srknzl/CodeXRay.git` diyor. `srknzl/CodeXRay` bu deponun **fork'u** (fork=true, 2026-07-30 20:12; ana depo 10:47).
- README "Publish to serkanozel.me" bölümü: `https://serkanozel.me/codexray/`, `C:\Users\serkan\git\serkanozelme` → fork sahibinin kişisel yayın akışı ana depoda.
- Commit yazarları: "Mustafa Özel" ve "Teknesyum" (aynı kişi mi, isim tutarlılığı).
- Açıklama "Code Debug Visualiser" → README "algorithm visualizer"; zayıf ve İngiliz/Amerikan karışık.
- package.json 2.3.4, `desktop-release.yml` iş akışı var ama **0 tag, 0 release**.
- CHANGELOG yok. README.tr.md yok (uygulama iki dilli).
- "A click-to-load CodeXRay Radio using the requested YouTube Music playlist" → görev metninden kalma "requested".
- README'de CI rozeti yok. Wiki açık.

**T0 promptu**
```
CodeXRay deposunda README ve yayın katmanını düzelt. Bulgular:

1. README "Quick Start" bölümünde iki yerde `git clone https://github.com/srknzl/CodeXRay.git`
   var. srknzl/CodeXRay bu deponun fork'u; doğrusu https://github.com/Teknesyum/CodeXRay.git.
2. README "Publish to serkanozel.me" bölümü fork sahibinin kişisel yayın akışı
   (serkanozel.me, C:\Users\serkan\git\serkanozelme). Bölümü ve scripts/ altındaki
   publish:site betiğini (varsa) kaldır ya da hedefi parametreye çevirip kişisel yolları sil.
   Bu bölüm fork'tan merge ile geldiyse commit'i bul ve not düş.
3. Açıklama zayıf: gh repo edit --description "Bilingual algorithm visualizer: 60 deterministic
   simulators with step-by-step traces, optional on-device AI. React/Vite web app and Tauri
   Windows desktop app."
4. package.json 2.3.4 ve desktop-release.yml var ama hiç tag/release yok. v2.3.4 tag'i at,
   desktop-release.yml'yi çalıştır (gh workflow run), NSIS + portable exe asset'lerini
   release'e bağla. README'ye "Download" bölümü ve kurulum satırı ekle.
5. CHANGELOG.md yok; en azından 2.3.4 için git log'dan özet çıkar, Keep a Changelog biçimi.
6. README.tr.md yok; uygulama iki dilli. Usb-Guard/VidShrink'teki badge-lang.svg dil
   anahtarı düzeniyle README.tr.md yaz (assets'e badge-lang.svg kopyala).
7. README'de "using the requested YouTube Music playlist" → "requested" görev metninden
   kalmış; "a curated YouTube Music playlist" yap.
8. README'ye ci.yml rozeti ekle; sponsor rozeti + imza bloğu standardını uygula.
9. gh repo edit --enable-wiki=false

Kısıtlar: README İngilizce; kod yorumu yok; git commit -s. Bitince değişen dosyaları,
tag'i ve release URL'sini listele.
```

### 4. Teknesyum-Core — ORTA

**Bulgular**
- README Install: "Every release publishes the SHA-256 of both installers." → v0.17.0'dan v0.24.0'a **tüm release'lerde 0 asset**. İddia yanlış.
- Release başlıkları tutarsız: `v0.24.0`, `0.23.0`, `0.22.0`, `v0.21.0`, `v0.16.0 — The Subtraction Release`.
- README.tr.md 313 satır, README.md 321 satır → 8 satır eksik, senkron kontrolü gerekli.
- `trash/assets/*.svg` public depoda commit'li.
- "The Numbers First" tablosu Core 0.16 ölçümü; sürüm 0.24. Tablo başlığı bunu söylüyor, ama kutuya "measured on 0.16, unchanged hook surface since" gibi bir satır gerekli.
- Homepage boş; marketplace yolu yok. Wiki açık.

**T0 promptu**
```
Teknesyum-Core deposunda yayın tutarlılığını düzelt. Bulgular:

1. README "Install" bölümü "Every release publishes the SHA-256 of both installers" diyor;
   v0.17.0'dan v0.24.0'a kadar hiçbir release'de asset yok. Ya scripts/release.js
   install.ps1 + install.sh + .sha256 dosyalarını release'e yüklesin (gh release upload),
   v0.24.0 için şimdi yükle; ya da cümleyi sil. İlkini tercih et.
2. Release başlıkları tutarsız (v0.24.0, 0.23.0, 0.22.0, "v0.16.0 — The Subtraction
   Release"). gh release edit ile hepsini "vX.Y.Z" yap; release.js'de başlık üretimini sabitle.
3. README.tr.md 8 satır kısa (313/321). Bölüm bölüm karşılaştır, eksik bölümü çevir.
   Ölçüm tablosu ve Install tek satırları iki dosyada aynı sürümü göstersin (v0.24.0).
4. trash/ commit'li (trash/assets/*.svg). .gitignore'a trash/ ekle, git rm -r --cached trash.
5. "The Numbers First" tablosunun altına tek cümle: ölçüm 0.16'da alındı, hook yüzeyi o
   sürümden beri değişmedi (doğruysa; değiştiyse yeniden ölç ya da sürümü belirt).
6. gh repo edit --enable-wiki=false --homepage "https://github.com/Teknesyum/Teknesyum-Core#install"

Kısıtlar: README İngilizce, README.tr.md Türkçe; kod yorumu yok. Bitince değişen dosyaları
ve v0.24.0 asset listesini göster.
```

### 5. Teknesyum-UI — ORTA

**Bulgular**
- **Hiç tag, hiç release yok.** package.json 0.2.0. Core README "one marketplace carries both plugins" diyor; UI'nin sürüm kaydı yok.
- README'de `[Teknesyum Core](../Teknesyum-Core)` → GitHub'da kırık (repo dışına göreli yol).
- `trash/contracts/*.md` commit'li (Türkçe sözleşmeler public'te).
- CHANGELOG, CONTRIBUTING, DCO, README.tr.md yok; Core'da hepsi var.
- `.claude-plugin/` altında yalnız marketplace.json; plugin.json yok (Core'un marketplace'i taşıyorsa normal, README'de söylenmeli).
- Wiki açık.

**T0 promptu**
```
Teknesyum-UI deposunda yayın ve belge katmanını Core ile hizala. Bulgular:

1. Hiç tag/release yok, package.json 0.2.0. v0.2.0 tag'i at ve release oluştur
   (gh release create v0.2.0 --generate-notes). CHANGELOG.md başlat (0.2.0 + Base'den
   ayrılma notu).
2. README'de "[Teknesyum Core](../Teknesyum-Core)" GitHub'da kırık. Tam URL yap:
   https://github.com/Teknesyum/Teknesyum-Core
3. trash/contracts/*.md commit'li. .gitignore'a trash/ ekle, git rm -r --cached trash.
4. CONTRIBUTING.md ve DCO yok; Core'dakileri kopyala, README'ye "Contributing" bölümü ekle.
5. .claude-plugin/ altında yalnız marketplace.json var. README "Install" bölümünde
   plugin'in Core marketplace'inden geldiğini ve bu dosyanın ne işe yaradığını tek cümleyle
   söyle; plugin.json gerekiyorsa ekle.
6. README.tr.md yok; Core'daki badge-lang.svg düzeniyle Türkçe sürüm yaz.
7. gh repo edit --enable-wiki=false

Kısıtlar: README İngilizce; kod yorumu yok; git commit -s. Bitince değişen dosyaları ve
release URL'sini listele.
```

### 6. Teknesyum-Base — ORTA (arşivli)

**Bulgular**
- Arşivli, ama README'de **Core ve UI'ya bölündüğüne dair tek satır yok** ("Teknesyum-Core" geçmiyor).
- 8+ tag (v2.62.1 … v2.67.0), 0 release.
- Discussions açık, homepage sponsor linki.
- FUNDING.yml yalnız burada var.

**T0 promptu**
```
Teknesyum-Base arşivli; tek bir "yönlendirme" commit'i gerekiyor. Bulgular:

1. README'nin en üstüne (banner'dan önce) bir uyarı bloğu:
   > **Archived.** Teknesyum Base was split in two on 2026-08-27:
   > the work relay became [Teknesyum Core](https://github.com/Teknesyum/Teknesyum-Core),
   > the UI standard became [Teknesyum UI](https://github.com/Teknesyum/Teknesyum-UI).
   > This repository is kept for history and receives no updates.
   Aynı bloğu README'nin Türkçe sürümü varsa oraya da ekle.
2. Açıklamayı güncelle: gh repo edit --description "Archived. Split into Teknesyum-Core
   (work relay) and Teknesyum-UI (interface standard)."
3. Son tag v2.67.0 için release yok; kapanış release'i oluştur
   (gh release create v2.67.0 --title "v2.67.0 — final" --notes "Final release before the
   split into Teknesyum-Core and Teknesyum-UI.").
4. Discussions ve wiki kapat, homepage'i Core'a çevir.
Sıra: gh repo unarchive → düzenle, commit, push → gh repo archive.

Kısıtlar: İngilizce; git commit -s. Bitince README'nin ilk 10 satırını göster.
```

### 7. VidShrink — DÜŞÜK

**Bulgular**
- GitHub'a **`kanit/T115-f2f05f5f`, `kanit/T115-0a56868f`** tag'leri gitmiş (iç kanıt işaretleri).
- Kökte Türkçe çalışma dosyaları: `KURULUM-LAPTOP.md`, `DEVIR.md`, `paylasim-hedefleri.json`; `trash/` ve `.claude/agent-memory/*` public'te. README kendisi "The repository language is English" diyor.
- README.tr.md 566/572 satır → 6 satır fark, senkron kontrolü.
- Geri kalan (release'ler, asset'ler, CHANGELOG, rozetler, konu etiketleri) örnek düzeyinde.

**T0 promptu**
```
VidShrink public deposunu temizle. Bulgular:

1. GitHub'da kanit/T115-f2f05f5f ve kanit/T115-0a56868f tag'leri var; iç kanıt işaretleri
   dışarı sızmış. git push --delete origin kanit/T115-f2f05f5f kanit/T115-0a56868f
   (yerelde kalsın). Kanıt tag'lerinin push edilmemesi için hooks ya da release.js'de
   refspec kısıtı koy.
2. Kökteki Türkçe çalışma dosyaları (KURULUM-LAPTOP.md, DEVIR.md, paylasim-hedefleri.json)
   public İngilizce depoya ait değil. Canlı kod yolu referans vermiyorsa Teknesyum-Private'a
   (vidshrink/ klasörü) taşı; veriyorsa docs/ altına İngilizce başlıkla al.
3. trash/ ve .claude/agent-memory/ commit'li. .gitignore'a ekle, git rm -r --cached.
   .claude/ altında kalması gereken (settings, launch.json) varsa onları koru.
4. README.tr.md 6 satır kısa (566/572). Bölüm bölüm karşılaştır, eksiği çevir.
5. gh repo edit --enable-wiki=false

Kısıtlar: kod yorumu yok; git commit -s. Bitince silinen/taşınan dosyaları listele.
```

### 8. Runly — DÜŞÜK

**Bulgular**
- CHANGELOG `[Unreleased]` altında iki madde (pencere çerçevesi düzeltmesi, ölü DPI özelliği) → v0.2.0 (2026-08-24) sonrası yayınlanmamış.
- README ekran görüntüsü `runly-settings-v0.1.3.png`; sürüm 0.2.0.
- README "report security issues privately" → SECURITY.md yok, private vulnerability reporting açık mı belirsiz.
- Support bloğu inline `style=` kullanıyor; GitHub bunu siler, zararsız.
- Wiki açık. Diğer her şey düzgün.

**T0 promptu**
```
Runly deposunda küçük tutarlılık düzeltmeleri. Bulgular:

1. CHANGELOG [Unreleased] altında iki madde var (WS_CAPTION çerçeve düzeltmesi, ölü
   ApplicationHighDpiMode). Directory.Build.props'u 0.2.1 yap, CHANGELOG'u [0.2.1] olarak
   kapat, tag at, release.yml ile release oluştur; README "Current source version" ve
   Get-FileHash örneğindeki dosya adını 0.2.1'e çek (README.tr.md'de de).
2. README ekran görüntüsü docs/screenshots/runly-settings-v0.1.3.png; 0.2.x arayüzüyle
   yeniden çek, dosyayı runly-settings-v0.2.1.png yap, eskiyi trash/'a al.
3. README "report security issues privately" diyor ama kanal yok. SECURITY.md ekle
   (GitHub private vulnerability reporting'e yönlendir) ve
   gh api -X PUT repos/Teknesyum/Runly/private-vulnerability-reporting ile aç.
4. README Support bloğundaki inline style="" özniteliklerini kaldır (GitHub zaten siliyor).
5. gh repo edit --enable-wiki=false

Kısıtlar: İngilizce; kod yorumu yok; git commit -s. Bitince release URL'sini göster.
```

### 9. Usb-Guard — DÜŞÜK

**Bulgular**
- **Konu etiketi sıfır.**
- README İngilizce ama menü adları Türkçe (`Bu PC'yi Temizle`, `Aşılı`, `Betik Motorunu Kapat`); arayüzün Türkçe olduğu açıkça söylenmiyor.
- CHANGELOG'da v1.6 ve v1.7 var, tag/release yok (v1.5 → v1.8). Kabul edilebilir, ama CHANGELOG'da "not released" notu gerekli.
- Wiki açık. Release, asset, README.tr.md, rozetler tamam.

**T0 promptu**
```
Usb-Guard deposunda küçük düzeltmeler. Bulgular:

1. Konu etiketi yok. gh repo edit --add-topic usb,malware-removal,shortcut-virus,autorun,
   batch,powershell,windows,security-tools,worm,immunize,offline-tool
2. README İngilizce, ama menü öğeleri Türkçe (Bu PC'yi Temizle, Aşılı, Betik Motorunu
   Kapat). Başlık bloğunun altına tek cümle: "The program's own menu is Turkish; every
   item has an F1 help line and this README names them as they appear on screen."
   Arayüz iki dilliyse bunun yerine dil seçimini yaz.
3. CHANGELOG'da v1.6 ve v1.7 var, GitHub'da tag/release yok. Bu iki başlığın yanına
   "(not published; folded into v1.8)" ekle ya da tag'leri geriye dönük at.
4. gh repo edit --enable-wiki=false

Kısıtlar: README İngilizce, README.tr.md Türkçe; git commit -s.
```

### 10. Gothic-1-Remake-Picklocker — DÜŞÜK

**Bulgular**
- Depo adı **Picklocker**, README başlığı ve kurulum klasörü **LockPicker** (`Gothic 1 LockPicker`, `%LOCALAPPDATA%\Gothic1LockPicker`).
- Tag v1.0, v1.1, v1.2 var, **release yok**; package.json 1.2.0 ile uyumlu.
- CHANGELOG yok. Varsayılan dal `master`. Wiki açık.
- README'de sponsor/imza bloğu yok. Konu etiketleri iyi.

**T0 promptu**
```
Gothic-1-Remake-Picklocker deposunda ad tutarlılığı ve yayın. Bulgular:

1. Depo adı "Picklocker", uygulama adı her yerde "LockPicker". Depoyu yeniden adlandır:
   gh repo rename Gothic-1-Remake-LockPicker (GitHub eski adı yönlendirir). install.ps1
   ve README'deki raw URL'leri yeni ada çek; güncelleme kontrolü hangi URL'yi kullanıyorsa
   onu da.
2. v1.0, v1.1, v1.2 tag'leri var, release yok. Üçü için gh release create --generate-notes
   ile release oluştur; v1.2'ye npm run dist çıktısı portable .exe'yi asset olarak ekle.
3. CHANGELOG.md yok; üç sürüm için git log'dan yaz.
4. Varsayılan dalı main yap: git branch -m master main; git push -u origin main;
   gh repo edit --default-branch main; git push origin --delete master.
   README ve install.ps1'deki /master/ yollarını /main/ yap.
5. README sonuna sponsor rozeti + imza bloğu standardını ekle (Usb-Guard'daki gibi;
   assets/ klasörü yoksa oluştur).
6. gh repo edit --enable-wiki=false

Kısıtlar: İngilizce; git commit -s. Bitince yeni depo URL'sini ve release'leri listele.
```

### 11. Quizloop, Reclatch — OK

Planlama aşaması; README, lisans, CONTRIBUTING, DCO, açıklama, konu etiketleri tutarlı.
Reclatch'te CHANGELOG yok, Quizloop'ta var. Tek işlem: `gh repo edit --enable-wiki=false`
ve Reclatch'e boş `[Unreleased]` CHANGELOG. Ayrı prompt gerekmiyor.

### 12. VideoEdit — OK (private)

Tutarlı. Varsayılan dal `master`; public'e çıkarken `main` yap ve konu etiketi ekle.

### 13. Webband — ARŞİV

README yok, açıklama Türkçe ("Web tabanlı warband"), wiki açık.

**T0 promptu**
```
Webband arşivli. Tek commit: gh repo unarchive → 8-10 satırlık README.md (ne olduğu,
tarayıcıda index.html açılarak çalıştığı, arşivlendiği ve neden), açıklama
gh repo edit --description "Archived. Browser-based Mount & Blade: Warband strategy layer
prototype (vanilla JS)." --enable-wiki=false → commit, push → gh repo archive.
```

### 14. Teknesyum-Private — OK

---

## Ortak Katman İçin Prompt (Tek Oturum, Herhangi Bir T0 Ya Da Bu Oturum)

```
Teknesyum hesabı için topluluk sağlık dosyaları deposu oluştur.

1. gh repo create Teknesyum/.github --public --description "Default community health files
   for all Teknesyum repositories."
2. İçerik: FUNDING.yml (github: Teknesyum), SECURITY.md (GitHub private vulnerability
   reporting'e yönlendir, 90 gün açıklama süresi), CONTRIBUTING.md (VidShrink'teki metin:
   önce issue, tek konu PR, DCO sign-off, AGPL-3.0-or-later), profile/README.md
   (Teknesyum profil sayfası: 10 public projenin tek satırlık listesi, sponsor bağlantısı).
3. Teknesyum-Base'deki .github/FUNDING.yml artık gereksiz; Base arşivli, dokunma.
4. Tüm public depolarda wiki kapat:
   foreach ($r in "Usb-Guard","Teknesyum-Core","VidShrink","CodeXRay","Teknesyum-UI",
   "Runly","Ghostlist","Gothic-1-Remake-Picklocker","ProcWitness","Quizloop","Reclatch")
   { gh repo edit Teknesyum/$r --enable-wiki=false }

Kısıtlar: tüm dosyalar İngilizce.
```

---

## Uygulama Sonucu (Aynı Gün, Merkezi Oturum)

Her depoya `docs/github-denetim-2026-09-08.md` notu bırakıldı. Yerel klonlara dokunulmadı;
scratchpad'e temiz klon alınıp `main`/`master`'a push edildi. Yerel oturumlar `git pull` yapmalı.

| Depo | Yapılan | Kanıt |
|---|---|---|
| Ghostlist | 4 release yayınlandı; CHANGELOG; imza bloğu; wiki kapalı | latest = v2.0.2, zip HEAD 200 (98.8 MB) |
| ProcWitness | v0.9.0 yayınlandı; Version tek kaynak (Build.props); ci.yml; imza; homepage temiz | latest = v0.9.0, zip HEAD 200 (114 MB) |
| CodeXRay | srknzl/serkanozel kalıntıları temiz, publisher betiği trash/; v2.3.4 tag + release; CHANGELOG; README.tr.md; rozetler; açıklama | https://github.com/Teknesyum/CodeXRay/releases/tag/v2.3.4 (portable + setup + SHA256SUMS) |
| Teknesyum-Core | v0.24.0'a 4 asset; release.js `publish` komutu; 8 release başlığı vX.Y.Z; trash/ izlemeden çıktı; ölçüm notu | npm test 256/256 |
| Teknesyum-UI | v0.2.0 tag + release; CHANGELOG; CONTRIBUTING + DCO; README.tr.md; kırık link düzeldi; trash/ çıktı | npm test 91/91 |
| Teknesyum-Base | Arşiv uyarısı; v2.67.0 kapanış release'i; açıklama/homepage; tekrar arşivlendi | isArchived=true |
| VidShrink | KURULUM-LAPTOP.md, DEVIR.md → trash/; trash/ ve .claude/agent-memory/ izlemeden çıktı (106 dosya); README.tr parity doğrulandı | koda dokunulmadı |
| Runly | v0.2.1 release (CI'dan zip + sha256); SECURITY.md; PVR açık; inline style temiz | https://github.com/Teknesyum/Runly/releases/tag/v0.2.1 |
| Usb-Guard | 11 topic; "menü Türkçe" cümlesi; CHANGELOG v1.6/v1.7 notu | — |
| Gothic | v1.0/v1.1/v1.2 release'leri, v1.2'ye portable exe (89.7 MB); CHANGELOG; imza | — |
| Webband | README; İngilizce açıklama; tekrar arşivlendi | — |
| Teknesyum/.github | YENİ: FUNDING.yml, SECURITY.md, CONTRIBUTING.md, DCO, profil README | https://github.com/Teknesyum/.github |
| Tümü | Wiki 13 depoda kapatıldı | — |

### Onay Bekleyen (Yıkıcı, Yapılmadı)

1. ProcWitness: 13 eski draft release silinsin mi (v0.2.0–v0.4.1).
2. VidShrink: `git push --delete origin kanit/T115-f2f05f5f kanit/T115-0a56868f`.
3. VidShrink: trash/ içeriği (31 dosya) Teknesyum-Private'a taşınsın mı.
4. Gothic: `gh repo rename Gothic-1-Remake-LockPicker` + master→main (main.cjs `origin/master` bekliyor; önce onu düzeltip yayınlamak gerekir).
5. Runly: ekran görüntüsü hâlâ v0.1.3; 0.2.1 arayüzüyle yenilenmeli.
6. VidShrink ve Teknesyum-UI: `.claude/relay/` iç sözleşme dosyaları public'te (350+ commit); kapsam dışı bırakıldı.
7. Ghostlist ve Gothic: son tag sonrası yayınlanmamış commit'ler var ([Unreleased]); v2.0.3 / v1.3 kesilsin mi.
