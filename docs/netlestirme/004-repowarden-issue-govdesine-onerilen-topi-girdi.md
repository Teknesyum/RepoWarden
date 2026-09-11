[[netlestirme:004]]

# Netleştirme: RepoWarden issue govdesine onerilen topic, aciklama, lisans ve duzelten komutlar

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

RepoWarden issue govdesine onerilen topic, aciklama, lisans ve duzelten komutlar nasil konmali ki dis gorunus denetiminde karsi tarafa gercekten yardimci olsun?

## Elde olan olgular

# Olgular — 4. Tur

## Kullanıcının cümlesi (aynen)

"önerilen tagları vb herşeyi güzelce issuemize koyuyoruz değil mi karşı tarafa yardımcı olabilmek adına ne gerekiyorsa yapmalıyız elbette projenin en detayına inemeyiz bizim yaptığımız sadece genel bir dış görünüş kontrolü"

## Bugünkü issue gövdesi

Yalnız bulgu listesi: "- [ ] **medium** — Only 0 topic(s); at least 3 expected." gibi satırlar,
başta "Automated audit by RepoWarden on <tarih>", sonda "updated on every run, closed when nothing is left".
Öneri yok, düzelten komut yok, önerilen topic yok, açıklama önerisi yok.

## Tarayıcı

- `bin/repowarden.mjs`, Node, `gh` üzerinden, model çağırmıyor, deterministik.
- Kontroller (genel kural dosyası): açıklama yok, 3'ten az topic, lisans yok, README yok,
  bütün release'ler draft, tag var release yok, release'siz sürüm tag'i.
- Elde edilebilen veri: `gh api repos/X/Y` (dil, açıklama, homepage), `/languages`,
  README ham metni, dosya ağacı (package.json, Cargo.toml, pom.xml vb.).

## Hedef

- srknzl (kullanıcının kardeşi), 41 depoda issue açılacak, kullanıcı onayından sonra.
- Kapsam dış görünüş: proje koduna girilmez.
- Depolar İngilizce. Issue, kopyala-çalıştır komutla ve önerilen değerlerle yardımcı olmalı.
