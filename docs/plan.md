# Plan — RepoWarden, Özel Raf Sürümü

Karar: README ölçüsü olarak `tercihler/readme-protokolu.md` (özel raf) alınır.
`~/.claude/teknesyum/prefs/readme.md` ile çeliştiği yerde özel raf kazanır.

## Çelişen İki Kural

| Konu | prefs/readme.md | Özel raf | Kazanan |
|---|---|---|---|
| Açılış | Ne olduğunu anlatan paragraf; sayılar kendi bölümünü bekler | İlk ekran sayıyla açar, agresif | Özel raf |
| Diyagram | Sorulur, bir kez; banner + akış, SVG | Sorulmaz, hepsi konur; her ana akış kendi mermaid'ini alır | Özel raf |
| Katkı | README içinde 4-6 satır, CLA/DCO yok | Korunanlar arasında "katkı" var, biçim belirtilmemiş | prefs (çelişki yok) |
| Kurulum | Üç yol, tag'e işaret eder | Korunanlar arasında "kurulum" var | prefs (çelişki yok) |

## Adımlar

- [ ] 1. `docs/diagram.md` yeniden yazılır: mermaid kararı, hangi akış hangi diyagramı alır.
- [ ] 2. `assets/flow.svg` ve `assets/flow.tr.svg` → `trash/`. Ölü dosya ağaçta kalmaz.
- [ ] 3. `README.md` yeniden yazılır: sayı tablosu ilk ekranda, üç mermaid diyagram gövdede.
- [ ] 4. `README.tr.md` ikizi aynı commit'te.
- [ ] 5. Tek commit, push.

## Diyagram Listesi

Üç ana akış anlatılıyor, üçü de kendi mermaid'ini alır.

1. **Denetim hattı** — Tara, Çözümle, Öner, Düzelt, Sor. Sor kutusundan çıkış yok.
2. **Onay kapısı** — bir bulgu yıkıcı mı değil mi; yıkıcı olmayan uygulanır, yıkıcı olan
   onay listesine düşer ve orada bekler.
3. **Kapsam** — RepoWarden'ın baktığı katman ile bakmadığı katman. Kaynak kodu dışarıda.

Mermaid, GitHub'da yerel olarak render edilir; `assets/` altında dosya gerekmez ve iki dilde
ayrı figür sorunu ortadan kalkar, çünkü etiketler doğrudan README metnindedir.

## Açılışta Kullanılacak Sayılar

Hepsi 2026-09-08 koşumundan, ölçülmüş.

| Ne | Kaç |
|---|---|
| Taranan depo | 15 |
| Değiştirilip itilen depo | 13 |
| Açılan depo | 1 |
| Kritik bulgu (kurulum komutu 404) | 2 |
| Onaya bırakılan yıkıcı işlem | 7 |

Ölçülmemiş iddia yok, rakip karşılaştırması yok.

## Ajan Yol Haritası (2026-09-11)

Karar: RepoWarden silinmez, tekrar koşturulabilir ajan olur. Fable netleştirmesi:
`docs/netlestirme/002-repowarden-tekrar-kosturulabilir-bir-aja.md`. Cevaplar:

| Soru | Cevap |
|---|---|
| Nerede koşar | Yerel: `node bin/repowarden.mjs`. Her tur maliyeti yok, çağrılınca çalışır |
| Yıkıcı sınır | Hiçbir şey silinmez; bulgu issue olur. Güvenli düzeltmeler `--fix` ile sonra |
| Kapsam | Arşivsiz public depolar, `.github` hariç. Private `rules.json` ile açılır |
| Kural kaynağı | RepoWarden kendi `rules.json` dosyasını taşır (özel raf) |
| Profil | Ayrı iş, `Teknesyum/Teknesyum` deposu |

Sıra:

- [x] A1. Deterministik tarayıcı: açıklama, topic, lisans, dal, README işaretleri, tr ikizi, mermaid, draft release, release'siz tag.
- [x] A2. `--issues`: depo başına tek `repowarden` etiketli issue; günceller, bitince kapatır.
- [ ] A3. `--fix`: yıkıcı olmayanlar — topic ekleme (`rules.json` içinde depo başına liste), açıklama.
- [ ] A4. Denetim notu: her koşumun raporu RepoWarden'da `reports/` (gitignore, private adlar sızmaz).
- [ ] A5. Zamanlama: GitHub Actions haftalık `--issues`. Token gerekir; sahibin kararı.
- [x] A7. Uzman incelemesi: `prompts/review.md` — depo başına bütçeli (≤200 KB metin, kod yalnız iddia doğrulamak için), sahibin dilinde, `n/N` numaralı, hazır komutlu issue. İlk örnek: srknzl/Webband#88. Tarayıcı `<!-- repowarden:review -->` taşıyan issue'yu ezmez.
- [ ] A8. İncelemeyi `bin/repowarden.mjs --review <repo>` ile ajana bağlamak (fable 005).
- [ ] A6. Ek kontroller: CHANGELOG sürümü ↔ son tag, kurulum komutundaki URL 404 mü, göreli bağlantı 404 mü.

## Kapsam Dışı

- Bekleyen yedi yıkıcı iş (ProcWitness draft silme, VidShrink tag silme, Gothic rename ve
  diğerleri) bu planın parçası değil, ayrı karar.
- `Teknesyum/.github` deposunun silinmesi ayrı karar; gerekçesi aşağıda.

## `.github` Silme Notu

Kullanıcı "yeni repon var" gerekçesiyle silmeyi istedi. RepoWarden bu işlevin yerine geçmez.
`<hesap>/.github` GitHub'ın ayrılmış deposudur: içindeki FUNDING.yml, SECURITY.md ve
CONTRIBUTING.md, kendi kopyası olmayan bütün depolarda varsayılan sayılır. Silinirse
13 depoda sponsor butonu ve güvenlik politikası aynı anda kaybolur. Depo silme geri alınamaz.
Karar kullanıcınındır; tekrar söylerse silinir.

## Tepsi Uygulaması (2026-10-10)

Örnek: HeadsetBatteryTray. Tek dosya .NET Framework 4 WinForms, çerçevenin kendi derleyicisiyle derlenir; kurulum gerektirmez.

- [x] T1. `teknesyum-ui` hedeflerine `winforms` eklenir (`Palette.cs`, etiketler).
- [x] T2. `src/RepoWarden.cs`: tepsi simgesi, menü, saatlik `gh search issues --owner <hesap> --state open`.
- [x] T3. Simge: onaylı kalkan; açık issue varsa sağ altta sayı rozeti (`renk-2` dolgu, `surface` yazı).
- [x] T4. Menü: ad + sürüm, durum satırı, Şimdi Denetle, issue listesi (tıklayınca tarayıcıda açılır), Bildirim Göster, Windows ile Başlat, Tam Denetim, Bize Ulaşın, Teknesyum, Destek Ol, Çıkış.
- [x] T5. Bildirim isteğe bağlı, varsayılan kapalı; yalnız daha önce görülmemiş issue için balon çıkar.
- [x] T6. `build.ps1` → `dist/RepoWarden.exe`; `scripts/pack.mjs` exe'yi zip'e koyar; `teknesyum.json` `run: RepoWarden.exe`.
- [x] T7. Deneme: `--goruntu <klasör>` menüyü ve simgeyi PNG olarak yazar; görüntüler `docs/ui-denetim/2026-10-10/`.
- [x] T8. README ikizi, AGENTS.md, tarama, eşleşme, commit, push, v1.1.0.

Kapsam dışı: gölge kopya ile kendini güncelleme, ayrı ayar penceresi.
