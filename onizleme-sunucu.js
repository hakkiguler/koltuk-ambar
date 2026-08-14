/* Bilgisayarda denemek icin kucuk sunucu.
   Masaustundeki "Koltuk Ambar Onizleme" kisayoluna
   veya ONIZLEME.bat dosyasina tiklayinca bu calisir.
   Telefonla ilgisi yok, sadece masaustunde bakmak icin.   */

const http  = require("http");
const fs    = require("fs");
const path  = require("path");
const { exec } = require("child_process");

const KLASOR = __dirname;
const PORT   = 8123;
const ADRES  = "http://localhost:" + PORT;

const TURLER = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".md":"text/plain; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".webmanifest":"application/manifest+json; charset=utf-8",
  ".png":"image/png",
  ".ico":"image/x-icon"
};

const sunucu = http.createServer((istek, yanit) => {
  let yol = decodeURIComponent(istek.url.split("?")[0]);
  if (yol === "/") yol = "/index.html";

  const tamYol = path.join(KLASOR, yol);
  if (!tamYol.startsWith(KLASOR)) { yanit.writeHead(403); return yanit.end("olmaz"); }

  fs.readFile(tamYol, (hata, veri) => {
    if (hata) {
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
    console.log("  Onizleme zaten acik olabilir.");
    console.log("  Tarayicida su adresi dene:  " + ADRES);
  } else {
    console.log("  Sunucu baslatilamadi: " + hata.message);
  }
  console.log("");
});

// Once sunucu hazir olsun, SONRA tarayiciyi ac.
sunucu.listen(PORT, () => {
  console.log("");
  console.log("  Koltuk Ambar onizleme calisiyor.");
  console.log("  Tarayici acilmadiysa elle gir:  " + ADRES);
  console.log("");
  console.log("  Kapatmak icin bu siyah pencereyi kapat.");
  console.log("");
  exec('start "" "' + ADRES + '"');
});
