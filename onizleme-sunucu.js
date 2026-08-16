/* Bilgisayarda calisan kucuk sunucu.

   Iki isi var:
     1) KoltukAmbar klasorunu tarayiciya sunmak (onizleme)
     2) Etiket Ureticisinin urunler.js dosyasini yazmasina ve
        GitHub'a gondermesine izin vermek

   Tarayici sayfalari kendi basina dosya yazamaz ve git calistiramaz;
   o isleri bu program yapiyor. Sadece bu bilgisayarda dinliyor
   (127.0.0.1), disaridan kimse baglanamaz.

   Calistirmak icin masaustundeki kisayollar, ya da:
     node onizleme-sunucu.js                     -> uygulamayi acar
     node onizleme-sunucu.js etiket/URETICI.html -> ureticiyi acar   */

const http  = require("http");
const fs    = require("fs");
const path  = require("path");
const { exec } = require("child_process");

const KLASOR  = __dirname;
const PORT    = 8123;
const ADRES   = "http://localhost:" + PORT;
const ACILIS  = (process.argv[2] || "index.html").replace(/^[\/\\]+/, "");
const URUNLER = path.join(KLASOR, "urunler.js");
const YEDEK   = path.join(KLASOR, "yedek");

const TURLER = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".md":"text/plain; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".webmanifest":"application/manifest+json; charset=utf-8",
  ".png":"image/png",
  ".ico":"image/x-icon",
  ".pdf":"application/pdf"
};

/* ---------- yardimcilar ---------- */
function json(yanit, kod, nesne){
  const g = Buffer.from(JSON.stringify(nesne), "utf8");
  yanit.writeHead(kod, {
    "Content-Type":"application/json; charset=utf-8",
    "Content-Length": g.length,
    "Cache-Control":"no-store"
  });
  yanit.end(g);
}

function govdeyiOku(istek){
  return new Promise((coz, red) => {
    let p = [], boyut = 0;
    istek.on("data", d => {
      boyut += d.length;
      if (boyut > 20 * 1024 * 1024){ red(new Error("govde cok buyuk")); istek.destroy(); return; }
      p.push(d);
    });
    istek.on("end", () => coz(Buffer.concat(p).toString("utf8")));
    istek.on("error", red);
  });
}

function calistir(komut){
  return new Promise(coz => {
    exec(komut, {cwd:KLASOR, windowsHide:true, timeout:120000}, (hata, cikti, hataCikti) => {
      coz({
        tamam: !hata,
        kod: hata ? (hata.code == null ? -1 : hata.code) : 0,
        cikti: ((cikti||"") + (hataCikti||"")).trim()
      });
    });
  });
}

/* Kac kayit var? Yazdigimiz dosyanin bicimine gore sayiyoruz. */
const kayitSay = metin => (metin.match(/^\s*barkod:/gm) || []).length;

/* ---------- urunler.js yaz ----------
   Once yedegini al, sonra gecici dosyaya yaz, sonra yerine tasi.
   Boylece yazma yarida kesilse bile eldeki dosya bozulmaz.        */
function urunleriYaz(icerik){
  let yedekAlindi = false;
  try{
    if (fs.existsSync(URUNLER)){
      fs.mkdirSync(YEDEK, {recursive:true});
      const d = new Date();
      const damga = d.getFullYear()
        + String(d.getMonth()+1).padStart(2,"0")
        + String(d.getDate()).padStart(2,"0") + "-"
        + String(d.getHours()).padStart(2,"0")
        + String(d.getMinutes()).padStart(2,"0")
        + String(d.getSeconds()).padStart(2,"0");
      fs.copyFileSync(URUNLER, path.join(YEDEK, "urunler-" + damga + ".js"));
      yedekAlindi = true;

      // en yeni 30 yedegi tut, gerisini sil
      const eskiler = fs.readdirSync(YEDEK)
        .filter(a => /^urunler-\d{8}-\d{6}\.js$/.test(a)).sort();
      eskiler.slice(0, Math.max(0, eskiler.length - 30))
        .forEach(a => { try{ fs.unlinkSync(path.join(YEDEK, a)); }catch(e){} });
    }
  }catch(e){ /* yedek alinamadiysa da asil yazmayi engelleme */ }

  const gecici = URUNLER + ".yeni";
  fs.writeFileSync(gecici, icerik, "utf8");
  fs.renameSync(gecici, URUNLER);
  return yedekAlindi;
}

/* =========================================================
   SUNUCU
   ========================================================= */
const sunucu = http.createServer(async (istek, yanit) => {
  const yol = decodeURIComponent(istek.url.split("?")[0]);

  /* ---------- API ---------- */
  if (yol.startsWith("/api/")){
    try{

      if (yol === "/api/durum"){
        const g = await calistir("git rev-parse --is-inside-work-tree");
        return json(yanit, 200, {tamam:true, git:g.tamam, klasor:KLASOR});
      }

      if (yol === "/api/kaydet" && istek.method === "POST"){
        const gelen = JSON.parse(await govdeyiOku(istek));
        if (typeof gelen.icerik !== "string" || !gelen.icerik.includes("const URUNLER"))
          return json(yanit, 400, {tamam:false, hata:"icerik tanidik gelmedi, yazmadim"});
        const yedekAlindi = urunleriYaz(gelen.icerik);
        console.log("  kaydedildi: " + kayitSay(gelen.icerik) + " kayit -> urunler.js");
        return json(yanit, 200, {tamam:true, yol:URUNLER, yedek:yedekAlindi});
      }

      if (yol === "/api/yolla" && istek.method === "POST"){
        const g = await calistir("git rev-parse --is-inside-work-tree");
        if (!g.tamam) return json(yanit, 200, {tamam:false, hata:"burasi bir git deposu degil"});

        let metin = "";
        try{ metin = fs.readFileSync(URUNLER, "utf8"); }catch(e){}
        const adet = kayitSay(metin);

        const ekle = await calistir("git add urunler.js");
        if (!ekle.tamam)
          return json(yanit, 200, {tamam:false, hata:"git add olmadi", cikti:ekle.cikti});

        const fark = await calistir("git diff --cached --quiet -- urunler.js");
        if (fark.tamam){
          // fark yok -> commit edecek bir sey de yok
          const it = await calistir("git push");
          return json(yanit, 200, {
            tamam:true, degisiklikYok:true,
            cikti:(it.cikti || "urunler.js degismemis.")
          });
        }

        const yaz = await calistir(
          'git commit -m "Urun listesi guncellendi (' + adet + ' kayit)" -- urunler.js');
        if (!yaz.tamam)
          return json(yanit, 200, {tamam:false, hata:"git commit olmadi", cikti:yaz.cikti});

        const it = await calistir("git push");
        if (!it.tamam)
          return json(yanit, 200, {
            tamam:false,
            hata:"git push olmadi (internet yoksa normal). Kayit bilgisayarinda duruyor.",
            cikti:it.cikti
          });

        console.log("  GitHub'a gonderildi: " + adet + " kayit");
        return json(yanit, 200, {tamam:true, adet:adet, cikti:(yaz.cikti + "\n" + it.cikti).trim()});
      }

      return json(yanit, 404, {tamam:false, hata:"boyle bir istek yok"});

    }catch(e){
      return json(yanit, 500, {tamam:false, hata:String(e && e.message || e)});
    }
  }

  /* ---------- dosya sun ---------- */
  if (istek.method !== "GET" && istek.method !== "HEAD"){
    yanit.writeHead(405); return yanit.end();
  }

  const tamYol = path.resolve(KLASOR, "." + (yol === "/" ? "/index.html" : yol));
  if (tamYol !== KLASOR && !tamYol.startsWith(KLASOR + path.sep)){
    yanit.writeHead(403); return yanit.end("olmaz");
  }

  fs.readFile(tamYol, (hata, veri) => {
    if (hata){
      yanit.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
      return yanit.end("bulunamadi: " + yol);
    }
    yanit.writeHead(200, {
      "Content-Type": TURLER[path.extname(tamYol).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    yanit.end(veri);
  });
});

sunucu.on("error", hata => {
  console.log("");
  if (hata.code === "EADDRINUSE"){
    console.log("  Zaten acik. Tarayicida acmayi deniyorum:");
    console.log("  " + ADRES + "/" + ACILIS);
    exec('start "" "' + ADRES + "/" + ACILIS + '"');
  } else {
    console.log("  Sunucu baslatilamadi: " + hata.message);
  }
  console.log("");
});

// Once sunucu hazir olsun, SONRA tarayiciyi ac.
sunucu.listen(PORT, "127.0.0.1", () => {
  console.log("");
  console.log("  Koltuk Ambar calisiyor.");
  console.log("  Tarayici acilmadiysa elle gir:  " + ADRES + "/" + ACILIS);
  console.log("");
  console.log("  Bu siyah pencere ACIK KALSIN.");
  console.log("  Kaydetme ve GitHub'a gonderme isini bu pencere yapiyor.");
  console.log("");
  exec('start "" "' + ADRES + "/" + ACILIS + '"');
});
