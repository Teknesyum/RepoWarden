# Devir — GitHub Denetimi 2026-09-08/09

Bu klasör merkezi denetim oturumunun (Desktop/Projeler üst klasörü, Fable 5.1) tam devri.
Sonraki oturum "git pull ve devam et" ile buradan sürer.

## Aşama

Denetim ve uygulama BİTTİ. 13 depo + yeni `Teknesyum/.github` deposu değiştirildi, hepsi
`main`/`master`'a push edildi. Tam liste ve kanıtlar: `RAPOR.md` → "Uygulama Sonucu" tablosu.
Ham `gh` dökümleri: `kanit/`.

Her depoda `docs/github-denetim-2026-09-08.md` var: o depoda ne değişti, ne kaldı.

## Git'ten Çıkarılan Dosyalar (Bu Depoda Saklandı)

`git rm --cached` ile izlemeden çıkarıldı; `git pull` yapan klonlarda çalışma ağacından da silinir.
Kopyaları burada:

| Kaynak depo | Ne | Burada |
|---|---|---|
| VidShrink | `trash/` (29 dosya) + kökten taşınan `KURULUM-LAPTOP.md`, `DEVIR.md` | `vidshrink/git-disi-2026-09-08/trash/` |
| VidShrink | `.claude/agent-memory/` (77 dosya, auditor + builder hafızası) | `vidshrink/git-disi-2026-09-08/agent-memory/` |
| Teknesyum-Core | `trash/` (14 dosya) | `teknesyum-core/git-disi-2026-09-08/trash/` |
| Teknesyum-UI | `trash/contracts/` (3 dosya) | `teknesyum-ui/git-disi-2026-09-08-trash/` |

VidShrink'te `paylasim-hedefleri.json` kökte KALDI: `ShareTargets.cs:87` çalışma zamanında okuyor.
Agent hafızasını geri istiyorsan klonda `.claude/agent-memory/` altına kopyala; artık ignore'da.

## Onay Bekleyen (Yıkıcı, Yapılmadı)

1. ProcWitness: 13 eski draft release (v0.2.0–v0.4.1) silinsin mi.
   `gh release list -R Teknesyum/ProcWitness` → Draft olanlar; `gh release delete <tag> -R Teknesyum/ProcWitness --yes`
2. VidShrink: `git push --delete origin kanit/T115-f2f05f5f kanit/T115-0a56868f`
3. Gothic: `gh repo rename Gothic-1-Remake-LockPicker -R Teknesyum/Gothic-1-Remake-Picklocker --yes`
   ve master→main. Önce `main.cjs:295,296,312` (`origin/master`) + `install.ps1:4,13` + `README.md:10`
   + `CLAUDE.md:66` düzeltilip v1.3 yayınlanmalı; sonra dal değişir, yoksa eski kurulumlar güncellenemez.
4. Runly: ekran görüntüsü `docs/screenshots/runly-settings-v0.1.3.png` → 0.2.1 arayüzüyle yenile.
5. Ghostlist ve Gothic: son tag sonrası yayınlanmamış commit'ler `[Unreleased]` altında; v2.0.3 / v1.3 kesilsin mi.
6. VidShrink ve Teknesyum-UI: `.claude/relay/` iç sözleşme dosyaları public'te (350+ commit). Kapsam dışı bırakıldı.
7. CodeXRay: `src/**` testleri ve `docs/titan/SOLE_BOOTSTRAP.md` içinde `serkanozel.me` origin örneği olarak
   duruyor; kod davranışına bağlı, dokunulmadı.

## Yerel Klonlar

Merkezi oturum yerel klonlara dokunmadı; scratchpad'e temiz klon alıp push etti. Yerel klonlar
`git pull` ile eşitlenir. Dikkat: VidShrink yerel klonu `claude/tema-paleti` dalında ve kirli;
önce stash/commit, sonra `git pull origin main` ya da main'e geçiş.

## Nasıl Devam Edilir

- Proje oturumunda: `git pull`, `docs/github-denetim-2026-09-08.md` oku, "Kalan" başlığındakileri yap.
- Üst klasör oturumunda: bu dosya + `RAPOR.md`. Onay bekleyenler için kullanıcıdan tek cümle onay al.
