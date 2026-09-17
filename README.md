# Oʻzbekiston futbolchilar uyushmasi — interaktiv veb-maket

Texnik topshiriq (03.08.2026) boʻyicha tayyorlangan HTML-maket. **19 ta maket sahifasi + TZ hisoboti**, toʻliq
interaktiv, toʻrt tilda ishlaydi. Freymvork ishlatilmagan — sof HTML, CSS va JavaScript.

## Qanday ochiladi

**`index.html`** — maketning bosh sahifasi (brauzerda ochish kifoya, internet talab qilinmaydi).
**`hisobot.html`** — TZ bandlari boʻyicha bajarilish hisoboti: har bir talab qaysi sahifada hal qilingani,
havolalar bilan. Komissiya uchun shu fayldan boshlash qulay. Lokal server orqali ham koʻrish mumkin:
**`dizayn-tizimi.html`** — realizatsiya uchun spetsifikatsiya: ranglar, tipografika, soyalar, liquid glass, komponent holatlari, ikonkalar, 3D toʻp, rasm/video talablari.

```
npx serve .          # yoki: python -m http.server 4173
```

---

## 1. TZ talablari — bajarilish jadvali

| TZ bandi | Talab | Qayerda |
|---|---|---|
| 2 | Maqsad va auditoriya | `index.html`, `uyushma.html` |
| 3 | 4 til: oʻzbek (lotin/kirill), rus, ingliz | Barcha sahifalarda, header'dagi til almashtirgich |
| 4 | Telegram orqali kirish | `kirish.html` — tasdiqlash oynasi bilan |
| 4 | Roʻyxatdan oʻtish anketasi | `royxat.html` — 3 bosqich, yakunda aʼzolik guvohnomasi |
| 4 | Anketa maydonlari: F.I.Sh., tugʻilgan sana, klub va liga, kontrakt holati, pasport/ID, karyera statistikasi, foto | `royxat.html` + `kabinet.html` → «Anketa» tabi |
| 5 | Murojaatlar moduli, 6 kategoriya | `murojaat.html` — 5 bosqichli wizard |
| 5 | Fayl biriktirish (ixtiyoriy) | `murojaat.html` 3-qadam, sudrab tashlash + yuklanish indikatori |
| 5 | Kengaytirilgan status oqimi: Yangi → Koʻrib chiqilmoqda → Qoʻshimcha maʼlumot soʻraldi → Hal qilindi → Yopildi | `index.html` (jonli koʻrinish), `kabinet.html`, `admin.html` |
| 5 | Xabarnomalar: kabinet + Telegram-bot | `murojaat.html` 4-qadam, `kabinet.html` → «Xabarnomalar» |
| 5 | Anonim murojaat — alohida kanal | `anonim.html` — maxfiy kod bilan |
| 5 | Murojaatlarni boshqarish | `admin.html` — filtr, status oʻzgartirish, ish jurnali *(TZ'da soʻralmagan, qoʻshimcha)* |
| 7 | Yangiliklar / blog | `yangiliklar.html`, `maqola.html` |
| 7 | Keyslar | `keyslar.html` |
| 7 | Bilim bazasi | `bilim-bazasi.html` |
| 7 | Video | `video.html` |
| 7 | Rasmiy hujjatlar sahifasi | `hujjatlar.html` |
| 8 | Hamkorlar / homiylik | `hamkorlar.html` |
| 8 | Vakansiyalar | `vakansiyalar.html` |
| 8 | Symbolic XI ovoz berish | `symbolic-xi.html` — 3 sxema, 11/11 nazorati |
| 8 | Free Agent Camp arizasi | `free-agent-camp.html` |
| 10 | Referens funksional xaritasi (unionkg.org) | Barcha bandlar qoplangan + `aloqa.html` qoʻshildi |

---

## 2. Tekshirilgan maʼlumotlar (haqiqiy faktlar)

Maket mavhum tashkilot uchun emas, **haqiqiy uyushma** uchun ishlangani bois asosiy
faktlar ochiq manbalardan tekshirilgan va maketga kiritilgan:

- Uyushma **2017-yildan** faoliyat yuritadi; **2018-yilda** Adliya vazirligida roʻyxatdan oʻtgan
- FIFPRO yoʻli: kuzatuvchi (2017) → nomzod aʼzo (2020) → **toʻliq aʼzo: 28.11.2024**
- Direktor: **Kamoliddin Murzoyev**
- Manzil: Toshkent, Bunyodkor koʻchasi, 47
- Rasmiy domen: **futbolchilar.uz** (maketdagi pochta manzillari shu domenda)
- Oʻzbekiston futbolchilari FIFPRO World 11 ovoz berishida **2017-yildan** qatnashadi
- Superliga 2026 tarkibi: 16 klub — har birining gerbi **nomi bilan toʻgʻri bogʻlangan**
  (Neftchi, Paxtakor, Navbahor, Lokomotiv, Buxoro, OKMK, Nasaf, Andijon, Dinamo,
  Soʻgʻdiyona, Qizilqum, Surxon, Xorazm, Qoʻqon-1912, Bunyodkor, Mashʼal)
- Symbolic XI roʻyxatidagi futbolchilar — PFL.UZ 2026 statistikasidan olingan **real
  ismlar va real klublar**; sahifada manba koʻrsatilgan

Manbalar: [uz.wikipedia.org — Oʻzbekiston Futbolchilar Uyushmasi](https://uz.wikipedia.org/wiki/O%CA%BBzbekiston_Futbolchilar_Uyushmasi) ·
[en.wikipedia.org — FIFPro Uzbekistan](https://en.wikipedia.org/wiki/FIFPro_Uzbekistan) ·
[championat.uz](https://championat.uz/oz/news/kamoliddin-murzoev-ozbekiston-futbolchilar-uyushmasi-kuzatuvchi-maqomidan-toliq-azolik-sari-qadam-tashladi) ·
[pfl.uz](https://pfl.uz)

## 3. Namoyish (demo) maʼlumotlari — realizatsiyada almashtiriladi

- Statistika raqamlari (1 240+ aʼzo, 386 murojaat, 9 FIFA ishi, 48 soat) — namoyish uchun
- Keyslar matni, yangiliklar, bilim bazasi javoblari — yuridik jihatdan toʻgʻri yozilgan,
  lekin uyushmaning aniq ishlari emas
- Yuristlar ismlari (A. Ergashev, D. Yusupova, S. Qodirov) va demo foydalanuvchi
  (Jasurbek Rahimov) — oʻylab topilgan. Real shaxs fotosi ishlatilmagan: bunday joylarda
  inisial-avatar koʻrsatiladi
- Telefon raqami va Telegram-bot manzili — shartli
- Hamkorlar boʻlimida real brend logotiplari yoʻq: boʻsh oʻrinlar dizayn qilingan,
  shartnoma imzolangach toʻldiriladi

## 4. Mijoz tasdiqlashi kerak boʻlgan nuqtalar

1. Tashkilot nomining rasmiy shakli — maketda «Oʻzbekiston futbolchilar uyushmasi»
   (TZ'da «futbolchilari» deb yozilgan)
2. Qisqartma/logotip: hozir «UFU» monogrammasi ishlatilgan — rasmiy logotip berilsa almashtiriladi
3. Telefon, bot manzili va pochta qutilari
4. Statistika raqamlari
5. PFL.UZ foto va gerblaridan foydalanish huquqi (maket uchun olingan)

---

## 5. Interaktiv elementlar

Bular maketda haqiqatan ishlaydi:

- **Murojaat wizardi** — bosqichma-bosqich validatsiya, fayl sudrab tashlash, yuklanish
  indikatori, yakunda murojaat raqami generatsiyasi
- **Aʼzolik anketasi** — 3 bosqich, yakunda aʼzolik guvohnomasi kartasi
- **Symbolic XI** — sxema almashtirish (4-3-3 / 4-4-2 / 3-5-2), oʻyinchi tanlash va olib
  tashlash, qidiruv va pozitsiya filtri, 11/11 toʻlgach ovozni tasdiqlash, joriy natijalar
- **Kabinet** — tablar, murojaat kartasi, status tarixi, yurist bilan yozishma
- **Admin panel** — filtr, qidiruv, status oʻzgartirish (jadvalda darhol yangilanadi)
- **Anonim kanal** — maxfiy kod generatsiyasi va nusxalash, kod boʻyicha holat tekshirish
- Umumiy: til almashtirish, mobil menyu, akkordeon, modal, toast, cookie banneri,
  scroll animatsiyalari, raqam sanagichlari, countdown

## 6. Fayl tuzilishi

```
index.html, kabinet.html, royxat.html …   — 19 ta sahifa
assets/css/main.css                       — dizayn tizimi (ranglar, tipografika, komponentlar)
assets/css/fx.css                         — liquid glass va futbol toʻpi uslublari
assets/js/app.js                          — header/footer, i18n, umumiy interaksiyalar
assets/js/i18n.js                         — lugʻat (uz/ru/en) + lotin→kirill transliteratsiya
assets/js/icons.js                        — 70+ SVG ikonka, loyiha uchun chizilgan
assets/js/fx.js                           — 3D toʻp (canvas, 32 panel), hero'dagi interaktiv toʻp, skroll toʻpi
assets/img/photos/                        — 36 ta oʻyin fotosi (manba: pfl.uz)
assets/img/clubs/                         — 16 ta Superliga klubi gerbi, nomi boʻyicha
assets/img/players/                       — futbolchi portretlari
assets/fonts/                             — Inter, Manrope, JetBrains Mono (kirill subseti bilan)
hisobot.html                              — TZ boʻyicha bajarilish hisoboti
dizayn-tizimi.html                        — dizayn tizimi: ranglar, shriftlar, soyalar, komponentlar, ikonkalar, media talablari
```

Header va footer barcha sahifalarda `app.js` orqali bitta manbadan chiziladi.

## 7. Sifat boʻyicha qilinganlar

- Barcha rasm `webp` formatiga oʻtkazilgan va oʻlchami moslashtirilgan:
  **18 MB → 2,8 MB** (bosh sahifa dastlab ~120 KB rasm yuklaydi)
- Har bir rasmda mazmunli `alt`, `loading="lazy"` va `decoding="async"`
- Har sahifada `meta description`, Open Graph teglari, favicon, `theme-color`
- Klaviatura uchun «asosiy kontentga oʻtish» havolasi, `<main>` landmark, koʻrinadigan fokus
- `prefers-reduced-motion` qoʻllab-quvvatlanadi
- Telefonlarga moslashtirilgan: iPhone SE (320px) dan iPhone Pro Max / Samsung Galaxy (430px) gacha, yotqizilgan telefon va planshetda tekshirilgan; iOS'da maydonga bosilganda sahifa kattalashib ketmaydi
- Identika: maydon yashili + lime, asosiy qismlarda liquid glass (header, kartochkalar, menyular, oynalar)
- Hero'dagi to'pni bosib tepish, sudrab otish mumkin (sichqoncha va barmoq)
- Shriftlar loyiha ichida (282 KB) — internetsiz ham bir xil koʻrinish, tashqi soʻrov umuman yoʻq
- Avtomatik audit skripti bilan tekshirilgan: buzilgan havola yoʻq, yoʻqolgan rasm yoʻq,
  tarjimasiz kalit yoʻq, uch tilda toʻliqlik

## 8. Imlo va alifbo

Matnlar Oʻzbekiston lotin alifbosi imlo qoidalariga muvofiq terilgan:

- `oʻ` va `gʻ` — **U+02BB** (modifier letter turned comma), qoʻshtirnoq belgisi emas
- `aʼzo`, `maʼlumot` kabi tutuq belgisi — **U+02BC** (modifier letter apostrophe)
- Ingliz matnidagi apostroflar (player’s, don’t) U+2019 boʻlib qoladi — bu ingliz tipografiyasi talabi
- Kirill varianti lotin matnidan avtomatik hosil qilinadi: `ў, ғ, қ, ҳ`, tutuq belgisi `ъ`,
  soʻz boshidagi `e → э`, `-tsiya → -ция`. FIFA, FIFPRO, Free Agent Camp kabi nomlar lotincha qoladi
- Klub, hudud va shaxs nomlari ham kirill rejimida transliteratsiya qilinadi
  (Navbahor → Навбаҳор, Kamoliddin Murzoyev → Камолиддин Мурзоев)

## 9. Dizayn haqida

Yoʻnalish referens sayt (unionkg.org) bilan bir oilada: oq fon, nuqtali ustun toʻri, katta
yengil sarlavhalar, koʻp havo. Undan farqli oʻlaroq hero, keyslar, Symbolic XI va CTA
bloklari toʻq koʻk (#0A1A33) asosda — bu Oʻzbekiston futboli vizual identitetiga yaqin.

- Asosiy rang: `#0A1A33`, aksent: `#1B5CFF`, oltin (Symbolic XI): `#C9A227`
- Shriftlar: Manrope (sarlavha), Inter (matn), JetBrains Mono (raqam/kod)
- Barcha ikonkalar loyiha uchun alohida chizilgan
- 360px dan 1920px gacha moslashuvchan
