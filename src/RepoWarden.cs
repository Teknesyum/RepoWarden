using Teknesyum.Theme;
using System;
using System.IO;
using System.Linq;
using System.Drawing;
using System.Threading;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Microsoft.Win32;

[assembly: System.Reflection.AssemblyTitle(Uygulama.Ad)]
[assembly: System.Reflection.AssemblyProduct(Uygulama.Ad)]
[assembly: System.Reflection.AssemblyCompany(Teknesyum.Theme.Palette.Author)]
[assembly: System.Reflection.AssemblyVersion(Uygulama.Surum + ".0")]
[assembly: System.Reflection.AssemblyFileVersion(Uygulama.Surum + ".0")]
[assembly: System.Reflection.AssemblyInformationalVersion(Uygulama.Surum)]

class Sorun
{
    public string Depo, Baslik, Adres;
    public int No;
}

static class Dil
{
    public static readonly bool Tr = System.Globalization.CultureInfo.CurrentUICulture.TwoLetterISOLanguageName == "tr";
    public static string S(string tr, string en) { return Tr ? tr : en; }
}

static class Gh
{
    public const int Yok = -1, Zaman = -2, Sinir = 100;

    public static int Kos(string arg, out string cikti)
    {
        cikti = "";
        System.Text.StringBuilder sb = new System.Text.StringBuilder();
        System.Diagnostics.ProcessStartInfo psi = new System.Diagnostics.ProcessStartInfo("gh", arg)
        {
            UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true,
            StandardOutputEncoding = System.Text.Encoding.UTF8
        };
        psi.EnvironmentVariables["GH_PROMPT_DISABLED"] = "1";
        psi.EnvironmentVariables["NO_COLOR"] = "1";
        try
        {
            using (System.Diagnostics.Process p = System.Diagnostics.Process.Start(psi))
            {
                p.OutputDataReceived += (s, e) => { if (e.Data != null) lock (sb) sb.AppendLine(e.Data); };
                p.ErrorDataReceived += (s, e) => { };
                p.BeginOutputReadLine();
                p.BeginErrorReadLine();
                if (!p.WaitForExit(60000)) { try { p.Kill(); } catch { } return Zaman; }
                p.WaitForExit();
                cikti = sb.ToString().Trim();
                return p.ExitCode;
            }
        }
        catch (System.ComponentModel.Win32Exception) { return Yok; }
    }

    public static List<Sorun> Ac(string hesap, out int kod)
    {
        List<Sorun> liste = new List<Sorun>();
        string json;
        kod = Kos("search issues --owner " + hesap + " --state open --limit " + Sinir + " --json repository,number,title,url", out json);
        if (kod != 0) return liste;
        object[] dizi = new System.Web.Script.Serialization.JavaScriptSerializer().DeserializeObject(json) as object[];
        if (dizi == null) return liste;
        foreach (object o in dizi)
        {
            Dictionary<string, object> d = o as Dictionary<string, object>;
            if (d == null) continue;
            Dictionary<string, object> r = d.ContainsKey("repository") ? d["repository"] as Dictionary<string, object> : null;
            liste.Add(new Sorun
            {
                Depo = r != null && r.ContainsKey("name") ? Convert.ToString(r["name"]) : "?",
                No = d.ContainsKey("number") ? Convert.ToInt32(d["number"]) : 0,
                Baslik = d.ContainsKey("title") ? Convert.ToString(d["title"]) : "",
                Adres = d.ContainsKey("url") ? Convert.ToString(d["url"]) : ""
            });
        }
        return liste.OrderBy(s => s.Depo, StringComparer.OrdinalIgnoreCase).ThenBy(s => s.No).ToList();
    }
}

class Uygulama : ApplicationContext
{
    public const string Ad = "RepoWarden", Surum = "1.4.0";
    const string RunAnahtar = @"Software\Microsoft\Windows\CurrentVersion\Run";
    const string AyarAnahtar = @"Software\" + Ad;
    const string Depo = "https://github.com/Teknesyum/" + Ad;
    const int VarsayilanDk = 60, AcilisSuresi = 180000, MenuSinir = 12, BaslikSinir = 48;

    static readonly int[] Adimlar = { 5, 10, 15, 30, 60, 120, 240, 480 };

    readonly NotifyIcon tepsi = new NotifyIcon();
    readonly System.Windows.Forms.Timer saat = new System.Windows.Forms.Timer(), acilis = new System.Windows.Forms.Timer();
    readonly ContextMenuStrip menu = new ContextMenuStrip();
    readonly SynchronizationContext ui;
    readonly Image temel;
    readonly string gorulenYol, goruntu, tamDenetim;

    List<Sorun> sorunlar = new List<Sorun>();
    string durum = Dil.S("Denetleniyor…", "Checking…"), hesap, balonAdres;
    bool hata, denetliyor, bekleyen, goster = true;
    Icon simge;

    public Uygulama(string goruntuKlasor, string sahip)
    {
        ui = SynchronizationContext.Current ?? new WindowsFormsSynchronizationContext();
        goruntu = goruntuKlasor;
        bool ilk = IlkAcilis();
        if (sahip != null && goruntu == null) HesapKaydet(sahip);
        hesap = sahip ?? KayitliHesap();
        gorulenYol = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), Ad), "gorulen.txt");
        tamDenetim = Path.Combine(Path.GetDirectoryName(Application.ExecutablePath), "repowarden.cmd");
        using (Stream k = typeof(Uygulama).Assembly.GetManifestResourceStream("icon.png")) temel = new Bitmap(k);

        MenuTemasi.Uygula(menu);
        menu.Closed += (s, e) => { if (bekleyen) MenuKur(); Gorunurluk(); };
        MenuKur();
        tepsi.ContextMenuStrip = menu;
        tepsi.Text = Ad + ": " + durum;
        Ciz(0, false);
        tepsi.MouseClick += (s, e) => { if (e.Button == MouseButtons.Left) MenuAc(); };
        tepsi.BalloonTipClicked += (s, e) => { if (balonAdres != null) Git(balonAdres); };

        if (goruntu == null)
        {
            EventWaitHandle ac = new EventWaitHandle(false, EventResetMode.AutoReset, Ad + "-ac");
            new Thread(() => { while (true) if (ac.WaitOne()) ui.Post(_ => AcilisBaslat(), null); }) { IsBackground = true }.Start();
            if (ilk) { Baslangic(true); BildirimKaydet(false); }
            acilis.Interval = AcilisSuresi;
            acilis.Tick += (s, e) => { acilis.Stop(); goster = false; Gorunurluk(); };
            AcilisBaslat();
        }
        saat.Interval = AralikDk() * 60000;
        saat.Tick += (s, e) => Denetle();
        saat.Start();
        Denetle();
    }

    void MenuKur()
    {
        if (menu.Visible) { bekleyen = true; return; }
        bekleyen = false;
        ToolStripItem[] eski = menu.Items.Cast<ToolStripItem>().ToArray();
        menu.Items.Clear();
        foreach (ToolStripItem o in eski) o.Dispose();

        menu.Items.Add(new ToolStripMenuItem(Ad + " v" + Surum) { Enabled = false });
        menu.Items.Add(new ToolStripMenuItem(durum) { Enabled = false });
        menu.Items.Add(new ToolStripMenuItem(Dil.S("Şimdi denetle", "Check now"), null, (s, e) => Denetle()));
        if (sorunlar.Count > 0)
        {
            menu.Items.Add(new ToolStripSeparator());
            foreach (Sorun so in sorunlar.Take(MenuSinir))
            {
                string adres = so.Adres;
                menu.Items.Add(new ToolStripMenuItem(so.Depo + " #" + so.No + "  " + Kisalt(so.Baslik), null, (s, e) => Git(adres)) { ToolTipText = so.Baslik });
            }
            if (sorunlar.Count > MenuSinir)
                menu.Items.Add(new ToolStripMenuItem(string.Format(Dil.S("… {0} tane daha", "… {0} more"), sorunlar.Count - MenuSinir), null, (s, e) => Git(HepsiAdres())));
        }
        menu.Items.Add(new ToolStripSeparator());
        ToolStripMenuItem bildirim = null, baslangic = null, gizle = null;
        bildirim = new ToolStripMenuItem(Dil.S("Yeni issue'da bildirim göster", "Notify on new issues"), null, (s, e) => { BildirimKaydet(!bildirim.Checked); bildirim.Checked = !bildirim.Checked; }) { Checked = BildirimAcik() };
        baslangic = new ToolStripMenuItem(Dil.S("Windows ile başlat", "Start with Windows"), null, (s, e) => { Baslangic(!baslangic.Checked); baslangic.Checked = BaslangicVar(); }) { Checked = BaslangicVar() };
        gizle = new ToolStripMenuItem(Dil.S("Açık issue yokken simgeyi gizle", "Hide the icon when there are no open issues"), null, (s, e) => { GizleKaydet(!gizle.Checked); gizle.Checked = !gizle.Checked; }) { Checked = GizleAcik() };
        ToolStripMenuItem siklik = new ToolStripMenuItem(SiklikYazi(AralikDk())) { Enabled = false };
        Cubuk cubuk = new Cubuk { Adim = Adimlar.Length, Deger = Array.IndexOf(Adimlar, AralikDk()), Size = new Size(TextRenderer.MeasureText(SiklikYazi(Adimlar[Adimlar.Length - 1]), menu.Font).Width, menu.Font.Height) };
        cubuk.Degisti += (s, e) =>
        {
            int dk = Adimlar[cubuk.Deger];
            AralikKaydet(dk);
            saat.Interval = dk * 60000;
            siklik.Text = SiklikYazi(dk);
        };
        menu.Items.Add(siklik);
        menu.Items.Add(new ToolStripControlHost(cubuk) { AutoSize = false, Size = cubuk.Size, BackColor = Tema.Surface });
        menu.Items.Add(bildirim);
        menu.Items.Add(gizle);
        menu.Items.Add(baslangic);
        if (File.Exists(tamDenetim))
            menu.Items.Add(new ToolStripMenuItem(Dil.S("Tam denetim raporu", "Full audit report"), null, (s, e) => Git(tamDenetim)));
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add(new ToolStripMenuItem(Dil.S("Bize ulaşın", "Contact us"), null, (s, e) => Git(Depo + "/issues/new/choose")));
        menu.Items.Add(new ToolStripMenuItem(Etiket.Al("sig.brand"), null, (s, e) => Git(Palette.GitHubUrl)) { ForeColor = Tema.Renk1, ToolTipText = Etiket.Al("sig.brandTitle") });
        if (Palette.SponsorActive) menu.Items.Add(new ToolStripMenuItem(Etiket.Al("sig.support"), null, (s, e) => Git(Palette.SponsorUrl)) { ToolTipText = Etiket.Al("sig.supportTitle") });
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add(new ToolStripMenuItem(Dil.S("Çıkış", "Exit"), null, (s, e) => Kapat()));
    }

    void MenuAc()
    {
        try { typeof(NotifyIcon).GetMethod("ShowContextMenu", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic).Invoke(tepsi, null); } catch { }
    }

    static string Kisalt(string s) { return s.Length <= BaslikSinir ? s : s.Substring(0, BaslikSinir - 1).TrimEnd() + "…"; }

    string HepsiAdres() { return "https://github.com/search?q=" + Uri.EscapeDataString("owner:" + hesap + " is:issue is:open") + "&type=issues"; }

    void Denetle()
    {
        if (denetliyor) return;
        denetliyor = true;
        ThreadPool.QueueUserWorkItem(_ =>
        {
            string sahip = hesap, sorun = null;
            List<Sorun> liste = null;
            try
            {
                int kod = 0;
                if (sahip == null)
                {
                    string ad;
                    kod = Gh.Kos("api user --jq .login", out ad);
                    if (kod == 0 && ad.Length > 0) sahip = ad;
                }
                if (sahip != null) liste = Gh.Ac(sahip, out kod);
                if (kod == Gh.Yok) sorun = Dil.S("GitHub CLI (gh) bulunamadı", "GitHub CLI (gh) not found");
                else if (kod == Gh.Zaman) sorun = Dil.S("GitHub yanıt vermedi", "GitHub did not answer");
                else if (kod != 0) sorun = sahip == null ? Dil.S("gh oturumu yok: gh auth login", "gh is signed out: gh auth login") : Dil.S("GitHub'a ulaşılamadı", "Could not reach GitHub");
            }
            catch (Exception e) { sorun = e.Message; }
            ui.Post(__ => Bitti(liste, sahip, sorun), null);
        });
    }

    void Bitti(List<Sorun> liste, string sahip, string sorun)
    {
        denetliyor = false;
        hesap = sahip;
        string an = DateTime.Now.ToString("HH:mm");
        hata = sorun != null;
        if (hata) durum = sorun + " · " + an;
        else
        {
            if (goruntu == null && liste.Count > 0) tepsi.Visible = true;
            Bildir(liste);
            sorunlar = liste;
            durum = (liste.Count == 0 ? Dil.S("Açık issue yok", "No open issues") : string.Format(Dil.S("{0} açık issue", liste.Count == 1 ? "{0} open issue" : "{0} open issues"), liste.Count >= Gh.Sinir ? Gh.Sinir + "+" : liste.Count.ToString())) + " · " + an;
        }
        string ipucu = Ad + ": " + durum;
        tepsi.Text = ipucu.Length > 63 ? ipucu.Substring(0, 63) : ipucu;
        Ciz(sorunlar.Count, hata);
        MenuKur();
        Gorunurluk();
        if (goruntu != null) Goruntule();
    }

    void AcilisBaslat()
    {
        goster = true;
        tepsi.Visible = true;
        acilis.Stop();
        acilis.Start();
    }

    void Gorunurluk()
    {
        if (goruntu != null || menu.Visible) return;
        tepsi.Visible = !GizleAcik() || goster || hata || sorunlar.Count > 0;
    }

    void Bildir(List<Sorun> liste)
    {
        if (goruntu != null) return;
        bool ilk = !File.Exists(gorulenYol);
        HashSet<string> gorulen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        try { if (!ilk) foreach (string s in File.ReadAllLines(gorulenYol)) gorulen.Add(s); } catch { }
        List<Sorun> yeni = liste.Where(s => !gorulen.Contains(s.Adres)).ToList();
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(gorulenYol));
            File.WriteAllLines(gorulenYol, liste.Select(s => s.Adres).ToArray());
        }
        catch { }
        if (ilk || yeni.Count == 0 || !BildirimAcik()) return;
        if (yeni.Count == 1)
        {
            balonAdres = yeni[0].Adres;
            tepsi.ShowBalloonTip(10000, Dil.S("Yeni issue: ", "New issue: ") + yeni[0].Depo + " #" + yeni[0].No, yeni[0].Baslik, ToolTipIcon.Info);
            return;
        }
        balonAdres = HepsiAdres();
        tepsi.ShowBalloonTip(10000, string.Format(Dil.S("{0} yeni issue", "{0} new issues"), yeni.Count), string.Join("\n", yeni.Take(3).Select(s => s.Depo + " #" + s.No + "  " + Kisalt(s.Baslik)).ToArray()), ToolTipIcon.Info);
    }

    static void Git(string adres)
    {
        try { System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(adres) { UseShellExecute = true }); } catch { }
    }

    [DllImport("user32.dll")]
    static extern bool DestroyIcon(IntPtr h);

    void Ciz(int sayi, bool uyari)
    {
        using (Bitmap b = Resim(SystemInformation.SmallIconSize.Width, sayi, uyari))
        {
            IntPtr h = b.GetHicon();
            Icon eski = simge;
            simge = Icon.FromHandle(h);
            tepsi.Icon = simge;
            if (eski != null) { IntPtr e = eski.Handle; eski.Dispose(); DestroyIcon(e); }
        }
    }

    Bitmap Resim(int n, int sayi, bool uyari)
    {
        Bitmap b = new Bitmap(n, n, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(b))
        {
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAlias;
            using (System.Drawing.Imaging.ImageAttributes ia = new System.Drawing.Imaging.ImageAttributes())
            {
                ia.SetWrapMode(System.Drawing.Drawing2D.WrapMode.TileFlipXY);
                g.DrawImage(temel, new Rectangle(0, 0, n, n), 0, 0, temel.Width, temel.Height, GraphicsUnit.Pixel, ia);
            }
            if (sayi <= 0 && !uyari) return b;
            float d = (float)Math.Round(n * 0.625f), k = Math.Max(1f, (float)Math.Round(n / 16f));
            RectangleF r = new RectangleF(n - d, n - d, d, d);
            string yazi = uyari ? "!" : sayi > 9 ? "+" : sayi.ToString();
            using (SolidBrush zemin = new SolidBrush(Tema.Surface))
            using (SolidBrush dolgu = new SolidBrush(uyari ? Tema.Surface : Tema.Renk2))
            using (SolidBrush kalem = new SolidBrush(uyari ? Tema.Warning : Tema.Surface))
            using (Font f = new Font("Segoe UI", d * 0.82f, FontStyle.Bold, GraphicsUnit.Pixel))
            using (StringFormat sf = new StringFormat(StringFormat.GenericTypographic) { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
            {
                g.FillEllipse(zemin, RectangleF.Inflate(r, k, k));
                g.FillEllipse(dolgu, r);
                g.DrawString(yazi, f, kalem, new RectangleF(r.X, r.Y, r.Width, r.Height), sf);
            }
        }
        return b;
    }

    void Goruntule()
    {
        Directory.CreateDirectory(goruntu);
        foreach (int n in new[] { 16, 24, 32, 64 })
        {
            using (Bitmap b = Resim(n, 0, false)) b.Save(Path.Combine(goruntu, "simge-" + n + "-temiz.png"));
            using (Bitmap b = Resim(n, 4, false)) b.Save(Path.Combine(goruntu, "simge-" + n + "-4.png"));
            using (Bitmap b = Resim(n, 12, false)) b.Save(Path.Combine(goruntu, "simge-" + n + "-cok.png"));
            using (Bitmap b = Resim(n, 0, true)) b.Save(Path.Combine(goruntu, "simge-" + n + "-uyari.png"));
        }
        menu.Show(new Point(40, 40));
        Application.DoEvents();
        using (Bitmap b = new Bitmap(menu.Width, menu.Height))
        {
            menu.DrawToBitmap(b, new Rectangle(0, 0, menu.Width, menu.Height));
            b.Save(Path.Combine(goruntu, "menu.png"));
        }
        File.WriteAllText(Path.Combine(goruntu, "durum.txt"), tepsi.Text + Environment.NewLine + string.Join(Environment.NewLine, menu.Items.Cast<ToolStripItem>().Select(o => o is ToolStripSeparator ? "---" : (o is ToolStripMenuItem && ((ToolStripMenuItem)o).Checked ? "[x] " : "") + o.Text).ToArray()), System.Text.Encoding.UTF8);
        menu.Close();
        Kapat();
    }

    static bool IlkAcilis()
    {
        using (RegistryKey k = Registry.CurrentUser.OpenSubKey(AyarAnahtar)) return k == null;
    }

    static string KayitliHesap()
    {
        try { using (RegistryKey k = Registry.CurrentUser.OpenSubKey(AyarAnahtar)) return k == null ? null : k.GetValue("Hesap") as string; }
        catch { return null; }
    }

    static void HesapKaydet(string ad)
    {
        try { using (RegistryKey k = Registry.CurrentUser.CreateSubKey(AyarAnahtar)) k.SetValue("Hesap", ad); }
        catch { }
    }

    static bool BildirimAcik()
    {
        try { using (RegistryKey k = Registry.CurrentUser.OpenSubKey(AyarAnahtar)) return k != null && k.GetValue("Bildirim") is int && (int)k.GetValue("Bildirim") != 0; }
        catch { return false; }
    }

    static void BildirimKaydet(bool acik)
    {
        try { using (RegistryKey k = Registry.CurrentUser.CreateSubKey(AyarAnahtar)) k.SetValue("Bildirim", acik ? 1 : 0, RegistryValueKind.DWord); }
        catch { }
    }

    static string SiklikYazi(int dk)
    {
        string sure = dk < 60 ? string.Format(Dil.S("{0} dakika", "{0} minutes"), dk) : string.Format(Dil.S("{0} saat", dk == 60 ? "{0} hour" : "{0} hours"), dk / 60);
        return Dil.S("Denetleme sıklığı: ", "Check every: ") + sure;
    }

    static int AralikDk()
    {
        try
        {
            using (RegistryKey k = Registry.CurrentUser.OpenSubKey(AyarAnahtar))
            {
                object v = k == null ? null : k.GetValue("AralikDk");
                return v is int && Array.IndexOf(Adimlar, (int)v) >= 0 ? (int)v : VarsayilanDk;
            }
        }
        catch { return VarsayilanDk; }
    }

    static void AralikKaydet(int dk)
    {
        try { using (RegistryKey k = Registry.CurrentUser.CreateSubKey(AyarAnahtar)) k.SetValue("AralikDk", dk, RegistryValueKind.DWord); }
        catch { }
    }

    static bool GizleAcik()
    {
        try { using (RegistryKey k = Registry.CurrentUser.OpenSubKey(AyarAnahtar)) return k != null && k.GetValue("SifirdaGizle") is int && (int)k.GetValue("SifirdaGizle") != 0; }
        catch { return false; }
    }

    static void GizleKaydet(bool acik)
    {
        try { using (RegistryKey k = Registry.CurrentUser.CreateSubKey(AyarAnahtar)) k.SetValue("SifirdaGizle", acik ? 1 : 0, RegistryValueKind.DWord); }
        catch { }
    }

    static bool BaslangicVar()
    {
        using (RegistryKey k = Registry.CurrentUser.OpenSubKey(RunAnahtar))
            return k != null && string.Equals(k.GetValue(Ad) as string, "\"" + Application.ExecutablePath + "\"", StringComparison.OrdinalIgnoreCase);
    }

    static void Baslangic(bool ac)
    {
        using (RegistryKey k = Registry.CurrentUser.CreateSubKey(RunAnahtar))
        {
            if (ac) k.SetValue(Ad, "\"" + Application.ExecutablePath + "\"");
            else if (k.GetValue(Ad) != null) k.DeleteValue(Ad);
        }
    }

    void Kapat()
    {
        saat.Stop();
        acilis.Stop();
        tepsi.Visible = false;
        tepsi.Dispose();
        ExitThread();
    }

    [DllImport("user32.dll")]
    static extern bool SetProcessDPIAware();

    [STAThread]
    static void Main(string[] args)
    {
        int g = Array.IndexOf(args, "--goruntu");
        string klasor = g >= 0 && g + 1 < args.Length ? args[g + 1] : null;
        int o = Array.IndexOf(args, "--owner");
        string sahip = o >= 0 && o + 1 < args.Length && System.Text.RegularExpressions.Regex.IsMatch(args[o + 1], "^[A-Za-z0-9-]+$") ? args[o + 1] : null;
        bool yeni;
        using (Mutex mx = new Mutex(true, Ad + (klasor == null ? "-tek" : "-goruntu"), out yeni))
        {
            if (!yeni)
            {
                try { using (EventWaitHandle h = EventWaitHandle.OpenExisting(Ad + "-ac")) h.Set(); } catch { }
                return;
            }
            try { SetProcessDPIAware(); } catch { }
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new Uygulama(klasor, sahip));
        }
    }
}

class Cubuk : Control
{
    public int Adim = 2, Deger;
    public event EventHandler Degisti;

    public Cubuk()
    {
        SetStyle(ControlStyles.UserPaint | ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw, true);
        BackColor = Tema.Surface;
        Cursor = Cursors.Hand;
    }

    float Cap { get { return Tema.FontSize2 * Tema.Olcek; } }

    protected override void OnPaint(PaintEventArgs e)
    {
        float c = Cap, x0 = c / 2, x1 = Width - c / 2, y = Height / 2f, x = x0 + (x1 - x0) * Deger / (Adim - 1);
        e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
        using (Pen iz = new Pen(Tema.BorderDecorative, Tema.FocusWidth * Tema.Olcek))
        using (Pen dolu = new Pen(Tema.Renk1, Tema.FocusWidth * Tema.Olcek))
        using (SolidBrush top = new SolidBrush(Tema.Renk1))
        {
            e.Graphics.DrawLine(iz, x0, y, x1, y);
            e.Graphics.DrawLine(dolu, x0, y, x, y);
            e.Graphics.FillEllipse(top, x - c / 2, y - c / 2, c, c);
        }
    }

    protected override void OnMouseDown(MouseEventArgs e) { base.OnMouseDown(e); if (e.Button == MouseButtons.Left) Ayarla(e.X); }
    protected override void OnMouseMove(MouseEventArgs e) { base.OnMouseMove(e); if (e.Button == MouseButtons.Left) Ayarla(e.X); }

    void Ayarla(int fare)
    {
        float c = Cap, x0 = c / 2, x1 = Width - c / 2;
        int d = Math.Max(0, Math.Min(Adim - 1, (int)Math.Round((fare - x0) / (x1 - x0) * (Adim - 1))));
        if (d == Deger) return;
        Deger = d;
        Invalidate();
        if (Degisti != null) Degisti(this, EventArgs.Empty);
    }
}

static class Etiket
{
    static Dictionary<string, object> sozluk;

    public static string Al(string anahtar)
    {
        if (sozluk == null)
        {
            sozluk = new Dictionary<string, object>();
            try
            {
                using (Stream k = typeof(Etiket).Assembly.GetManifestResourceStream(Dil.Tr ? "labels.tr.json" : "labels.en.json"))
                using (StreamReader r = new StreamReader(k, System.Text.Encoding.UTF8))
                    sozluk = new System.Web.Script.Serialization.JavaScriptSerializer().Deserialize<Dictionary<string, object>>(r.ReadToEnd());
            }
            catch { }
        }
        object v;
        return sozluk.TryGetValue(anahtar, out v) && v is string ? (string)v : anahtar;
    }
}

static class Tema
{
    public static readonly Color Renk1 = Palette.Renk1;
    public static readonly Color Renk2 = Palette.Renk2;
    public static readonly Color Warning = Palette.Warning;
    public static readonly Color Surface = Palette.Surface;
    public static readonly Color TextBody = Palette.TextBody;
    public static readonly Color BorderStrong = Palette.BorderStrong;
    public static readonly Color BorderDecorative = Palette.BorderDecorative;
    public static readonly Color Renk1Yuzde20 = Ton.Renk1Yuzde20;
    public const int Radius = Palette.Radius, FocusWidth = Palette.FocusWidth, FontSize2 = Palette.FontSize2;

    static float olcek;
    public static float Olcek
    {
        get
        {
            if (olcek > 0) return olcek;
            try { using (Graphics g = Graphics.FromHwnd(IntPtr.Zero)) olcek = g.DpiX / 96f; } catch { olcek = 1f; }
            return olcek;
        }
    }

    public static Font Sans(float px) { return new Font("Segoe UI", px, FontStyle.Regular, GraphicsUnit.Pixel); }

    public static System.Drawing.Drawing2D.GraphicsPath Yuvarlak(RectangleF r, float y)
    {
        System.Drawing.Drawing2D.GraphicsPath p = new System.Drawing.Drawing2D.GraphicsPath();
        float d = Math.Min(y * 2, Math.Min(r.Width, r.Height));
        if (d <= 0) { p.AddRectangle(r); return p; }
        p.AddArc(r.X, r.Y, d, d, 180, 90);
        p.AddArc(r.Right - d, r.Y, d, d, 270, 90);
        p.AddArc(r.Right - d, r.Bottom - d, d, d, 0, 90);
        p.AddArc(r.X, r.Bottom - d, d, d, 90, 90);
        p.CloseFigure();
        return p;
    }
}

class MenuTemasi : ToolStripProfessionalRenderer
{
    public static void Uygula(ContextMenuStrip m)
    {
        m.Renderer = new MenuTemasi();
        m.ForeColor = Tema.TextBody;
        m.BackColor = Tema.Surface;
        m.Font = Tema.Sans(Tema.FontSize2 * Tema.Olcek);
        m.ShowImageMargin = false;
        m.ShowCheckMargin = true;
        m.ShowItemToolTips = true;
    }

    protected override void OnRenderToolStripBackground(ToolStripRenderEventArgs e) { using (SolidBrush b = new SolidBrush(Tema.Surface)) e.Graphics.FillRectangle(b, e.AffectedBounds); }
    protected override void OnRenderImageMargin(ToolStripRenderEventArgs e) { using (SolidBrush b = new SolidBrush(Tema.Surface)) e.Graphics.FillRectangle(b, e.AffectedBounds); }
    protected override void OnRenderToolStripBorder(ToolStripRenderEventArgs e) { using (Pen p = new Pen(Tema.BorderStrong)) e.Graphics.DrawRectangle(p, 0, 0, e.ToolStrip.Width - 1, e.ToolStrip.Height - 1); }

    protected override void OnRenderMenuItemBackground(ToolStripItemRenderEventArgs e)
    {
        Rectangle r = new Rectangle(2, 0, e.Item.Width - 4, e.Item.Height);
        using (SolidBrush b = new SolidBrush(Tema.Surface)) e.Graphics.FillRectangle(b, r);
        if (!e.Item.Selected || !e.Item.Enabled) return;
        e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
        using (System.Drawing.Drawing2D.GraphicsPath p = Tema.Yuvarlak(r, Tema.Radius * Tema.Olcek))
        using (SolidBrush b = new SolidBrush(Tema.Renk1Yuzde20)) e.Graphics.FillPath(b, p);
    }

    protected override void OnRenderSeparator(ToolStripSeparatorRenderEventArgs e) { using (Pen p = new Pen(Tema.BorderDecorative)) e.Graphics.DrawLine(p, 8, e.Item.Height / 2, e.Item.Width - 8, e.Item.Height / 2); }

    protected override void OnRenderItemText(ToolStripItemTextRenderEventArgs e)
    {
        TextRenderer.DrawText(e.Graphics, e.Text, e.TextFont, e.TextRectangle, e.Item.Enabled && !e.Item.Selected ? e.Item.ForeColor : Tema.TextBody, e.TextFormat);
    }

    protected override void OnRenderItemCheck(ToolStripItemImageRenderEventArgs e)
    {
        Rectangle r = e.ImageRectangle;
        e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
        using (Pen p = new Pen(Tema.Renk1, Tema.FocusWidth * Tema.Olcek)) e.Graphics.DrawLines(p, new[] { new Point(r.Left + 3, r.Top + r.Height / 2), new Point(r.Left + r.Width / 2 - 1, r.Bottom - 4), new Point(r.Right - 3, r.Top + 4) });
    }
}
