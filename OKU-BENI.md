# Koltuk Ambar

Barkodu okut → ürünün ambardaki yerini söyler.
Telefonda çalışır (Android + iPhone), kurulum gerektirmez.

---

## 1) Bilgisayarda denemek (istersen)

`ONIZLEME.bat` dosyasına çift tıkla. Tarayıcı açılır.
Bilgisayarda kamera yoksa **"Numarayı elle yaz"** ile dene:

- `8690000000017` → 3. RAF – 2. GÖZ
- `8690000000024` → 1. RAF – 4. GÖZ
- başka bir şey → BULUNAMADI

Pencereyi kapatınca sunucu da kapanır.

---

## 2) GitHub'a koymak

Telefonun kamerayı açması için sayfanın **https** ile yayında olması gerekiyor.
Bu yüzden dosyaları GitHub'a koyuyoruz.

1. github.com → **New repository**
2. İsim: `koltuk-ambar` · **Public** seç · **Create**
3. Açılan sayfada **"uploading an existing file"** bağlantısına tıkla
4. `C:\Users\guler\KoltukAmbar` klasörünü aç, **içindeki her şeyi** seçip pencereye sürükle
   - `parcalar` klasörünü de sürüklemeyi unutma (barkod okuyucu orada)
   - `.nojekyll` dosyası görünmüyorsa: Windows'ta "Gizli öğeler" kutucuğunu işaretle
5. Aşağıdaki yeşil **Commit changes** tuşuna bas
6. Üstteki **Settings** → sol menüden **Pages**
7. *Source* → **Deploy from a branch** · *Branch* → **main** · klasör **/ (root)** → **Save**
8. 1-2 dakika bekle, sayfayı yenile. Yukarıda adresin çıkar:

```
https://KULLANICIADIN.github.io/koltuk-ambar/
```

---

## 3) Telefona koymak

**Android:** Adresi Chrome'da aç → sağ üst ⋮ → **Ana ekrana ekle**

**iPhone:** Adresi **Safari'de** aç → paylaş tuşu → **Ana Ekrana Ekle**
(iPhone'da bu iş Safari'den yapılmalı, Chrome'dan olmuyor)

İlk "KAMERA AÇ" dediğinde telefon izin soracak → **İzin ver**.

Bir kere açtıktan sonra çevrimdışı da çalışır — ambarda telefon çekmese de olur.

---

## 4) Ürün eklemek / raf değiştirmek

Sadece **`urunler.js`** dosyasına dokunuyorsun, koda hiç girmiyorsun.

GitHub'da: `urunler.js` dosyasına tıkla → sağ üstteki **kalem** işareti → düzenle → **Commit changes**.
Telefonda uygulamayı yenile, yeni liste gelir.

Bir kayıt şöyle görünüyor:

```js
{
  barkod: "8690000000017",
  ad:     "Koltuk Süngeri (Sol)",
  yer:    "3. RAF – 2. GÖZ",
  not:    ""
},
```

Virgüller önemli: son kayıt hariç her `}` işaretinden sonra virgül olacak.

---

## Dosyalar ne işe yarıyor

| Dosya | Ne yapar |
|---|---|
| `index.html` | Uygulamanın kendisi — ekranlar, kamera, arama |
| `urunler.js` | **Ürün listesi. Senin düzenleyeceğin tek dosya.** |
| `parcalar/zxing.min.js` | Barkodu çözen hazır parça (iPhone için gerekli) |
| `sw.js` | Çevrimdışı çalışmayı sağlar |
| `manifest.webmanifest` | Ana ekrandaki ikon ve isim |
| `ikon-*.png` | İkon görselleri |
| `ONIZLEME.bat` | Bilgisayarda denemek için |

---

## Notlar

- Titreşim **Android'de** çalışır. iPhone tarayıcıda titreşime izin vermiyor, orada sadece bip sesi var.
- Işık (fener) tuşu, telefonun kamerası izin veriyorsa görünür.
- Okuttuğun her barkod **Geçmiş** ekranında birikir. "Hepsini kopyala" ile listeyi çıkarabilirsin.
- Depo **Public**, yani dosyalar herkese açık. Şu an içinde uydurma barkod var, sorun değil.
  **Gerçek raf listesi girmeden önce bunu konuşmak lazım** — o fabrikanın verisi.
