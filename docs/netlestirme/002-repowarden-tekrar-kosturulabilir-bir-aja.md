# Netleştirme: RepoWarden tekrar kosturulabilir bir ajan olarak mantikli mi, silinmeli mi yoksa

- tarih: 2026-09-11
- girdi: 002-repowarden-tekrar-kosturulabilir-bir-aja-girdi.md
- maliyet: 50771 token, 12 sn

## Dönen

1. "Tekrar koşturulabilir ajan" nerede koşacak: yerel Claude Code oturumu (`/repowarden` gibi bir skill/komut) mı, GitHub Actions'ta zamanlanmış bir iş mi, yoksa Anthropic scheduled/cloud routine mi?
2. Yıkıcı işlemlerde sınır: ajan yalnız issue mu açsın, yoksa tag/release/README düzeltmelerini kendi mi uygulasın; uygulayacaksa hangileri onay bekleyecek?
3. Kapsam: yalnız public depolar mı, private'lar da mı taranacak; arşivli depolar dahil mi?
4. "README kuralları" kaynağı: çelişen iki dosyadan özel raf seçildi dendi — ajan bu kuralları Teknesyum Core'daki prefs.js/scaffold.js'ten mi okusun, yoksa RepoWarden kendi kural dosyasını mı taşısın?
5. Profil README'si bu sorunun kapsamında mı (Teknesyum/Teknesyum deposu RepoWarden'ın parçası olarak mı açılacak), yoksa ayrı bir iş mi?
