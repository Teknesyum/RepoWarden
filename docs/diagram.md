# Diyagram Kararı — RepoWarden

Karar 2026-09-09'da alındı, bir kez soruldu. Yeniden sorulmaz.

## Banner — `assets/banner.svg` / `assets/banner.tr.svg`

Hesabın depo ızgarası. Her depo bir kutu, sorunlu olanlar işaretli. Ölçek: 15 kutu,
2 kritik, 1 yüksek, geri kalanı sağlam. Kritik kutular kırmızı çerçeveli ve üstlerinde
`404` etiketi taşır.

Alt metin, tam cümle: "A grid of fifteen repository tiles for one GitHub account; two
tiles are marked critical with a 404 label, one is marked high, and the remaining twelve
are clean."

## Akış — `assets/flow.svg` / `assets/flow.tr.svg`

Beş kutulu boru hattı, soldan sağa:

    Scan -> Analyse -> Propose -> Fix -> Ask

Son kutuya giren ok orada durur; çıkış oku yoktur. Duran ok bu aracın sözüdür: yıkıcı iş
onaysız yürümez. Her kutunun altında bıraktığı dosya yazar (kanit/, rapor, prompt, audit
notu, onay listesi).

Alt metin, tam cümle: "A five stage pipeline running left to right, Scan then Analyse then
Propose then Fix then Ask, where the arrow entering Ask stops and no arrow leaves it,
because destructive changes wait for the operator."

## Kurallar

- Dil başına ayrı figür. İngilizce figürde tek Türkçe kelime olmaz, tersi de.
- Figür içi etiketler Title Case. Türkçe'de `toLocaleUpperCase('tr')`: İşçi, Işci değil.
- SVG, `assets/` altında.
