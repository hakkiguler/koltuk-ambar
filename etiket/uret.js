/* ===========================================================
   ETIKET DENEME SAYFASI URETICISI

   Calistirmak icin:  node uret.js
   Ciktisi:           DENEME-SAYFASI.html

   Ne yapiyor: ayni kodu farkli boyutlarda DataMatrix olarak
   uretir, SVG olarak sayfaya GOMER (tarayicida cizilmez,
   baskida sapma olmaz), sonra hepsini geri okuyup dogrular.
   =========================================================== */

const fs = require("fs");
const path = require("path");
const Z = require("../parcalar/zxing.min.js");

/* ---------- kontrol hanesi ----------
   5 rakamin uzerinden hesaplanir (3-1-3-1-3 agirlikli).
   Tek hane yanlis okunursa tutmaz -> uygulama yakalar.      */
function kontrolHanesi(besRakam){
  const d = String(besRakam).padStart(5,"0").split("").map(Number);
  const toplam = d.reduce((t,x,i) => t + x * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (toplam % 10)) % 10;
}

/* KA + 5 rakam + kontrol  ->  makinenin okudugu    */
function kod(sira){
  const bes = String(sira).padStart(5,"0");
  return "KA" + bes + kontrolHanesi(bes);
}
/* insanin okudugu (etikette yazan) */
function yazi(sira){
  return "KA-" + String(sira).padStart(5,"0");
}

/* ---------- matris uretimi ---------- */
function dataMatrix(veri){
  return new Z.DataMatrixWriter().encode(veri, Z.BarcodeFormat.DATA_MATRIX, 0, 0);
}
function qr(veri){
  const h = new Map();
  h.set(Z.EncodeHintType.MARGIN, 0);
  h.set(Z.EncodeHintType.ERROR_CORRECTION, Z.QRCodeDecoderErrorCorrectionLevel.M);
  return new Z.QRCodeWriter().encode(veri, Z.BarcodeFormat.QR_CODE, 0, 0, h);
}

/* ---------- matris -> SVG ----------
   bosluk = etrafindaki beyaz cerceve (modul cinsinden)
   DataMatrix 1 modul ister, QR 4 modul ister.               */
function svg(matris, bosluk, mm){
  const n = matris.getWidth();
  const tam = n + bosluk * 2;
  let d = "";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (matris.get(x, y)) d += `M${x + bosluk} ${y + bosluk}h1v1h-1z`;
  return `<svg width="${mm}mm" height="${mm}mm" viewBox="0 0 ${tam} ${tam}" `
       + `shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">`
       + `<rect width="${tam}" height="${tam}" fill="#fff"/>`
       + `<path d="${d}" fill="#000"/></svg>`;
}

/* ---------- geri okuma denetimi ----------
   Urettigimiz matrisi buyutup tekrar okuyoruz.
   Okunamayan bir sey uretmis olmayalim.                     */
function geriOku(matris, tur){
  const n = matris.getWidth(), o = 8, bos = 4 * o;
  const k = n * o + bos * 2;
  const px = new Int32Array(k * k).fill(0xFFFFFF);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (matris.get(x, y))
        for (let dy = 0; dy < o; dy++)
          for (let dx = 0; dx < o; dx++)
            px[(y*o + dy + bos) * k + (x*o + dx + bos)] = 0x000000;
  const bmp = new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.RGBLuminanceSource(px, k, k)));
  const okuyucu = tur === "dm" ? new Z.DataMatrixReader() : new Z.QRCodeReader();
  return okuyucu.decode(bmp).getText();
}

/* ---------- bir etiket kutusu ----------
   Kutunun tamami "boy" mm. Icinde kod + altinda rakamlar.   */
function etiket(sira, boy, tur){
  const veri = kod(sira);
  const m = tur === "dm" ? dataMatrix(veri) : qr(veri);
  const bosluk = tur === "dm" ? 1 : 4;

  const yaziYuk = 1.9;                 // rakamlarin kapladigi yukseklik (mm)
  const kenar   = 0.35;                // ic kenar payi (mm)
  const kodMm   = boy - yaziYuk - kenar * 2;
  const modulMm = kodMm / (m.getWidth() + bosluk * 2);

  return {
    veri, matris: m, tur, modulMm,
    html:
      `<div class="etiket" style="width:${boy}mm;height:${boy}mm;padding:${kenar}mm">
         ${svg(m, bosluk, kodMm)}
         <div class="rakam" style="height:${yaziYuk}mm;font-size:${yaziYuk}mm">${yazi(sira)}</div>
       </div>`
  };
}

/* =========================================================
   SAYFAYI KUR
   ========================================================= */
const boyutlar = [11, 13, 15, 18];
const denetim  = [];

let satir1 = "";
boyutlar.forEach(b => {
  const e = etiket(1, b, "dm");
  denetim.push(e);
  satir1 += `<div class="hucre">${e.html}
    <div class="alt"><b>${b} mm</b><br>modül ${e.modulMm.toFixed(2)} mm</div></div>`;
});

let satir2 = "";
[["dm","DataMatrix"],["qr","QR kod"]].forEach(([t, ad]) => {
  const e = etiket(2, 15, t);
  denetim.push(e);
  satir2 += `<div class="hucre">${e.html}
    <div class="alt"><b>${ad}</b><br>15 mm · modül ${e.modulMm.toFixed(2)} mm</div></div>`;
});

let satir3 = "";
for (let i = 10; i <= 17; i++){
  const e = etiket(i, 15, "dm");
  denetim.push(e);
  satir3 += `<div class="hucre">${e.html}</div>`;
}

/* ---------- hepsini geri okuyup dogrula ---------- */
console.log("--- geri okuma denetimi ---");
let hata = 0;
denetim.forEach(e => {
  let sonuc;
  try { sonuc = geriOku(e.matris, e.tur); } catch (x) { sonuc = "OKUNAMADI"; }
  const ok = sonuc === e.veri;
  if (!ok) hata++;
  console.log((ok ? "  OK  " : "  HATA") + "  " + e.veri +
              "  (" + e.tur + ", modül " + e.modulMm.toFixed(2) + " mm)" +
              (ok ? "" : "  -> " + sonuc));
});
console.log(hata ? "!! " + hata + " HATA VAR" : "hepsi dogrulandi");

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>Etiket deneme sayfası</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  *{box-sizing:border-box}
  body{
    font-family:system-ui,"Segoe UI",Arial,sans-serif;
    color:#000;background:#fff;margin:0;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
  }
  h1{font-size:14pt;margin:0 0 2mm}
  h2{font-size:10pt;margin:6mm 0 2mm;padding-bottom:1mm;border-bottom:.3mm solid #000}
  .uyari{
    border:.3mm solid #000;padding:2.5mm;font-size:8.5pt;line-height:1.5;margin-bottom:4mm;
  }
  .uyari b{font-size:9pt}
  .cetvel{margin:3mm 0 5mm}
  .cetvel .cizgi{
    width:50mm;height:4mm;border:.3mm solid #000;border-top:none;
    display:flex;justify-content:space-between;
  }
  .cetvel .cizgi span{width:.3mm;background:#000;height:2mm}
  .cetvel .not{font-size:8pt;margin-top:1mm}
  .sira{display:flex;gap:6mm;align-items:flex-start;flex-wrap:wrap;margin-bottom:3mm}
  .hucre{text-align:center}
  .etiket{
    border:.25mm dashed #999;display:flex;flex-direction:column;
    align-items:center;justify-content:center;background:#fff;
  }
  .etiket svg{display:block}
  .rakam{
    font-family:Consolas,"Courier New",monospace;font-weight:700;
    line-height:1;letter-spacing:.02em;margin-top:.15mm;
  }
  .alt{font-size:7.5pt;margin-top:1.5mm;line-height:1.35}
  .izgara{display:flex;gap:4mm;flex-wrap:wrap}
  .aciklama{font-size:8.5pt;line-height:1.5;margin:0 0 3mm}
</style>
</head>
<body>

<h1>Etiket deneme sayfası — Koltuk Ambar</h1>

<div class="uyari">
  <b>YAZDIRMADAN ÖNCE:</b><br>
  1. Ölçek <b>%100</b> olsun — "Sayfaya sığdır" seçili OLMASIN.<br>
  2. <b>EconoMode / toner tasarrufu kapalı</b> olsun.<br>
  3. <b>Siyah beyaz</b> bas (renkli değil).<br>
  4. Bastıktan sonra aşağıdaki cetveli ölç. 50 mm çıkmıyorsa ölçek bozulmuştur, tekrar bas.
</div>

<div class="cetvel">
  <div class="cizgi">
    <span></span><span></span><span></span><span></span><span></span><span></span>
  </div>
  <div class="not">↑ Bu çizgi tam <b>50 mm</b> olmalı (5 cm). Cetvelle ölç.</div>
</div>

<h2>1 — Hangi boyut okunuyor?</h2>
<p class="aciklama">
  Aynı kod dört boyutta. Kes, telefonla tek tek okut, hangisinden sonra zorlandığını not et.
  Kesik çizgi etiketin sınırıdır, o da basılır.
</p>
<div class="sira">${satir1}</div>

<h2>2 — DataMatrix mi QR mı?</h2>
<p class="aciklama">
  İkisi de 15 mm, ikisinde de aynı kod var. Karelerin büyüklük farkını çıplak gözle gör.
</p>
<div class="sira">${satir2}</div>

<h2>3 — Sekiz farklı kod, 15 mm</h2>
<p class="aciklama">
  Gerçekte olacağı hâli. Hepsini sırayla okut — hepsi ilk seferde okunmalı.
  Uygulamada <b>BULUNAMADI</b> diyecek, normal; biz numarayı doğru okuyor mu ona bakıyoruz.
</p>
<div class="izgara">${satir3}</div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "DENEME-SAYFASI.html"), html, "utf8");
console.log("\nDENEME-SAYFASI.html yazildi.");
