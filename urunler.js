/* ===========================================================
   ÜRÜN LİSTESİ
   -----------------------------------------------------------
   BU DOSYAYI ELLE DÜZENLEME. Etiket Üretici yazıyor
   (masaüstü: "Koltuk Ambar - Etiket Uretici").
   Elle değiştirirsen bir dahaki KAYDET'te üstüne yazılır.

   barkod : Etiketteki numara
   ad     : Ürünün adı        -> telefonda üstte görünür
   yer    : Ambardaki yeri    -> telefonda KOCAMAN görünür
   not    : Varsa ek bilgi
   raf/goz/basildi : Üreticinin kendi kullandığı alanlar,
                     telefondaki uygulama bunlara bakmıyor.

   Son yazan: 20.08.2026 15:28:45 · 14 kayıt
   =========================================================== */

const URUNLER = [

  {
    barkod: "8697681460098",
    ad:     "Su Şişesi",
    yer:    "1. RAF – 1. GÖZ",
    not:    "Deneme kaydı"
  },

  {
    barkod: "8684207695867",
    ad:     "Protein Tozu",
    yer:    "1. RAF – 1. GÖZ",
    not:    "Deneme kaydı"
  },

  {
    barkod: "8690000000017",
    ad:     "ÖRNEK — Koltuk Süngeri (Sol)",
    yer:    "3. RAF – 2. GÖZ",
    not:    "Bu bir örnek kayıt, gerçek değil"
  },

  {
    barkod: "8690000000024",
    ad:     "ÖRNEK — Kızak Mekanizması",
    yer:    "1. RAF – 4. GÖZ",
    not:    ""
  },

  {
    barkod: "KA000001",
    ad:     "çay bardağı",
    yer:    "2. RAF – 2. GÖZ",
    not:    "",
    raf: 2, goz: 2, basildi: ""
  },

  {
    barkod: "KA000002",
    ad:     "koltuk",
    yer:    "1. RAF – 3. GÖZ",
    not:    "",
    raf: 1, goz: 3, basildi: ""
  },

  {
    barkod: "KA000003",
    ad:     "parfüm",
    yer:    "1. RAF – 1. GÖZ",
    not:    "",
    raf: 1, goz: 1, basildi: ""
  },

  {
    barkod: "KA000004",
    ad:     "kulaklık",
    yer:    "1. RAF – 1. GÖZ",
    not:    "",
    raf: 1, goz: 1, basildi: ""
  },

  {
    barkod: "KA000005",
    ad:     "telefon",
    yer:    "1. RAF – 1. GÖZ",
    not:    "",
    raf: 1, goz: 1, basildi: ""
  },

  {
    barkod: "KA000006",
    ad:     "kask",
    yer:    "2. RAF – 2. GÖZ",
    not:    "",
    raf: 2, goz: 2, basildi: ""
  },

  {
    barkod: "KA000007",
    ad:     "deneme1",
    yer:    "1. RAF – 2. GÖZ",
    not:    "telefon",
    raf: 1, goz: 2, basildi: ""
  },

  {
    barkod: "KA000008",
    ad:     "bilgisayar",
    yer:    "2. RAF – 2. GÖZ",
    not:    "eğitim merkezinde",
    raf: 2, goz: 2, basildi: ""
  },

  {
    barkod: "KA000009",
    ad:     "deneme1",
    yer:    "12. RAF – 1. GÖZ",
    not:    "eğitim merkezi",
    raf: 12, goz: 1, basildi: ""
  },

  {
    barkod: "KA000010",
    ad:     "kalemlik",
    yer:    "2. RAF – 2. GÖZ",
    not:    "persan büro",
    raf: 2, goz: 2, basildi: ""
  }

];
