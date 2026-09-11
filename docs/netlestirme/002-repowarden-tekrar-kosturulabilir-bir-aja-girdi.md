[[netlestirme:002]]

# Netleştirme: RepoWarden tekrar kosturulabilir bir ajan olarak mantikli mi, silinmeli mi yoksa

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

RepoWarden tekrar kosturulabilir bir ajan olarak mantikli mi, silinmeli mi yoksa gelistirilmeli mi; gelistirilecekse neler eklenmeli?

## Elde olan olgular

# Olgular — 2. Tur

## Kullanıcının cümlesi (aynen)

"1:gite aktaralım derken repowarden gereksiz diyip silelim demek
2:tekrar koşturulabilir bi ajan
4:.github private den vazgeçtik
5:profil readmesi nasıl gözüküyor örnek bir profil sunabilir misin şuanki profilimizdede bilgilerimiz var

repowarden tüm repoları kontrol eder tag eksiği varsa giderir bizim readme kurallarımıza uymuyorsa veya bir sıkıntı görürse ilgili projeye issue atar ve benzeri genel disiplini korur felsefesiyle açıldı neler eklenebilir seninle konuşacağız ve mantıklı mı kısmını da aynı şekilde mantıksız dersen silelim dersen silebiliriz geliştirelim mantıklı dersen ne eklenebilir düşün ekle"

## Önceki turdan netleşenler

- "Gite aktaralım" = RepoWarden gereksizse silinsin.
- Hedef: tekrar koşturulabilir bir ajan.
- `.github` public kalıyor.
- Profil README'si isteniyor; kullanıcı nasıl göründüğünü ve örnek görmek istiyor.

## RepoWarden'ın felsefesi (kullanıcının tanımı)

Tüm depoları kontrol eder. Tag eksiği varsa giderir. README kurallarına uymayan ya da
sıkıntılı gördüğü projeye issue açar. Hesap genelinde disiplini korur.

## RepoWarden bugün

- `Teknesyum/RepoWarden`, public, AGPL-3.0-or-later, 1 commit, 1 yıldız.
- Kod yok. README, LICENSE, iki SVG, docs/ altında 2026-09-08 denetim raporu.
- Denetim bir kez elle yönlendirilen bir Claude oturumuyla yapıldı: 15 depo tarandı,
  13'ü düzeltildi, 2 kritik bulgu (bütün release'ler draft, kurulum 404), 7 yıkıcı iş onaya kaldı.

## Mevcut altyapı

- Teknesyum Core: sahibin Claude Code eklentisi. İçinde deterministik Node betikleri var:
  scaffold.js (LICENSE, dil satırı, imza bloğu yazar), agency.js, advice.js, kutuphane.js,
  release.js, scan.js, map.js, log.js. Hook'lar var: README yazımını sahibin kurallarına
  göre denetleyip keser (prefs.js), iş listesi tutturur (dur.js).
- Sahibin yazılı README kuralları var (iki dosya, bir yerde çelişiyor, kullanıcı özel rafı seçti):
  dil satırı, imza bloğu, iki dil README, mermaid diyagram, sayıyla açılış, "ne yapmaz" bölümü.
- `gh` ve `git` yetkili. Sahip yıkıcı işlem öncesi tek cümle onay istiyor.
- 12 arşivsiz public depo, 1 arşivli public, en az 2 private. Hepsi tek kişinin.
- Maliyet kuralı: her turda bağlama giren özellik uyarı gerektirir; yalnız çağrılınca çalışan
  özellik serbest.

## Profil

- Hesap User tipinde. Profil README'si `Teknesyum/Teknesyum` deposundan okunur; o depo yok.
- `.github/profile/README.md` yazılmış ama User hesabında görünmüyor.
- Profil kartındaki bilgiler: ad "Mustafa Özel", bio "Anesthesiologist & Software Developer /
  Just an MD trying to put bugs & patients to sleep", konum Aksaray.
