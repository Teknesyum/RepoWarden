# Netleştirme: RepoWarden issue govdesine onerilen topic, aciklama, lisans ve duzelten komutlar

- tarih: 2026-09-11
- girdi: 004-repowarden-issue-govdesine-onerilen-topi-girdi.md
- maliyet: 50041 token, 12 sn

## Dönen

Netleştirme soruları:

1. Öneriler (topic, açıklama) yalnız eldeki metadata/README/dosya ağacından kural tabanlı mı türetilsin, yoksa bir kez model çağrısıyla mı (tarayıcı bugün deterministik)?
2. Lisans önerisi tek sabit mi (ör. MIT) yoksa dil/ekosisteme göre değişken mi; "seç" mi denilecek, dosya içeriği mi verilecek?
3. Düzelten komutlar hangi araçla yazılsın: yalnız `gh` (`gh repo edit --add-topic`, `--description`) mı, yoksa git+dosya ekleme adımları (LICENSE, README) da mı?
4. Her bulgunun altına mı, yoksa gövde sonunda tek "Suggested fixes" bölümü mü; issue her çalışmada güncellendiğinden öneriler de yeniden mi üretilsin?
5. Uygulanan öneriler doğrulanacak mı — ör. önerilen topic'lerin GitHub'da var/yaygın olduğu, uzunluk/karakter kurallarına uyduğu — yoksa ham öneri yeterli mi?
