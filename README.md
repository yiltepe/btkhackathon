# Oben

🔗 Canlı: **https://oben-btkhackathon.vercel.app/**

İki dilli (TR/EN) yapay zekâ alışveriş asistanı. Bir ürün bağlantısı yapıştırın veya bir fotoğraf yükleyin; Oben gönderiyi Gemini ile analiz eder, dile göre arama sorguları üretir ve birden fazla satıcıdan satın alınabilir sonuçlar getirir. Moda ve Ev modları ayrıca görünüm için stilize bir görsel de üretir.

BTK Hackathon için geliştirildi.

## Ne yapar?

Oben, sıradan bir sohbet botu değil; **editöryel bir alışveriş asistanı**. Kullanıcının mesajını analiz edip tek atımda doğru "niyete" yönlendirir ve buna göre yapılandırılmış JSON üretir. Gemini 3.1 Flash Lite arkasında çalışan bu niyet motoru `lib/gemini.ts` içinde tanımlıdır.

**Desteklenen niyetler:**

- **Sohbet (chitchat)** — Yalnızca bağlam yokken selamlama/laf üstü konuşma.
- **Ürün bul (FIND_ITEM)** — "Adidas ayakkabı bul", "ucuz sehpa" gibi sorgular. Kullanıcı markayı söylediyse marka korunur; alternatif istendiğinde rakip markalara açılır. Arama sorgusu kategoriye göre marka + model + renk + beden gibi somut özelliklerle paketlenir.
- **Kombin oluştur (BUILD_OUTFIT)** — "kombin", "buna ne giyilir", "yazlık kombin" gibi tetikleyiciler. 5–8 farklı slottan (üst, alt, ayakkabı, çanta, gözlük, saat…) baştan ayağa kombin önerir. "Hepsi New Balance" gibi marka kilidi kuralları, slot başına tek ürün kuralı uygulanır. Ardından stilize flat-lay görseli üretilebilir.
- **Kombin parça değişimi (OUTFIT_SWAP)** — "ayakkabıyı değiştir", "başka şort" gibi mesajlarda önceki kombinin sadece ilgili parçası değiştirilir; diğer slotlar aynen korunur.
- **Ürün hakkında soru (PRODUCT_QA)** — "sence nasıl bir ürün", "pili kaç saat dayanır", "yağlı cilde uygun mu". Çözülmüş ürün verisi varsa onu, yoksa web arama snippet'lerini kaynak alarak somut özelliklerle yanıt verir. Veri yoksa dürüstçe sınırı söyler — özellik uydurmaz.
- **Muadil bul (DUPE_FINDER)** — "muadili", "benzeri", "daha ucuz alternatif" tetikleyicileri. 3 görsel olarak benzer ama belirgin şekilde daha ucuz alternatif sunar, her birinin neden seçildiğini kısaca açıklar ve net bir satın alma önerisi (`verdict`) verir.
- **Çoklu ürün (MULTI_ITEM)** — 2+ ürün/fotoğraf gönderildiğinde:
  - **Karşılaştır** ("hangisi daha iyi", "kıyasla", "vs") → her ürün için artılar/eksiler, en iyi seçim ve gerekçeli bir `verdict`.
  - **Daha ucuzunu bul** → her bir ürün için ayrı arama sorgusu.
  - Eğer kullanıcı yalnızca ürünleri gönderip ne istediğini söylemediyse Oben üç hazır seçenek sunarak nazikçe sorar (Karşılaştır / Daha ucuzunu bul / Bir kullanıma göre seç).

**Çıktı zenginlikleri:**

- `identifiedItem` — Tespit edilen ürünün ismi, tipi, rengi, materyali, bedeni; logo görünüyorsa marka da işaretlenir.
- `suggestions` — Her biri `name`, `searchQuery`, `reason`, `swapSlot`, `visualDescription` alanlarıyla zenginleştirilmiş öneriler.
- `comparison` — Çoklu ürünlerde yan yana karşılaştırma + kazanan + verdict.
- `crossSell` — Moda/Ev modunda tek ürün odakta olduğunda 2–3 tamamlayıcı parça önerisi.
- `reviewSummary` — Çözülmüş üründe `aggregateRating` varsa puan, örneklem ve artı/eksi özetleri.
- `clarify` — Yalnızca öneri seçilemeyecek kadar belirsiz sorgularda samimi, tek cümlelik açıklama sorusu.
- `prefsSummary` — Her turun sonunda kullanıcının stilini, bütçesini, beden/renk tercihini özetler ve sonraki turlara taşır.
- `imagePrompt` — Her zaman İngilizce; flat-lay (moda) ya da editorial oda render (ev) için Gemini görsel üretimine verilir.

**Kullanıcı akışı:**

1. Kullanıcı bir link, fotoğraf veya metin gönderir; URL ise `/api/resolve` ile başlık, görsel ve JSON-LD çıkarılır; fotoğraf ise `<canvas>` ile 1024px / JPEG 0.85 sıkıştırılır.
2. `/api/chat` Gemini 3.1 Flash Lite'a çözülmüş ürün, görsel ve sohbet geçmişiyle birlikte streaming yanıt için istek atar; çıktı her zaman `responseSchema` ile valide edilen JSON'dur.
3. `searchQuery` değerleri `/api/search` üzerinden Serper.dev Shopping API'sine gider; her satıcı için en ucuz sonuç korunarak fiyat artan sırada listelenir, yetersizse mocks ile doldurulur.
4. Moda/Ev kombinlerinde kullanıcı görsel modalı açtığında `/api/generate` Gemini 2.0/2.5 image modeline İngilizce prompt'u gönderir; sonuç SHA1 anahtarıyla `localStorage`'da önbelleğe alınır (kapasite 8, LRU).
5. Tüm yapı API anahtarsız da çalışır — her endpoint mocks fallback'leriyle korunur, demo asla 500 vermez.

## Teknoloji yığını

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Stil**: Tailwind CSS, Geist fontu, `/design` üzerinden gelen özel tasarım token'ları
- **LLM**: Gemini 3.1 Flash Lite (metin + görsel anlama), Gemini 2.0 Flash / 2.5 Flash Image (görsel üretimi)
- **Arama**: Serper.dev (Google Shopping + organik yedek)
- **Kimlik doğrulama**: Clerk
- **Kalıcılık**: Sunucu tarafı kullanıcı durumu için Supabase Postgres; istemci önbelleği için `localStorage`

## Özellikler

- Otomatik mod sınıflandırması — tek atımda kategori tespiti (Otomatik → Fiyat / Moda / Ev / Elektronik / Güzellik)
- Yapıştırılan ürün bağlantılarını sunucu tarafında çözümleme (`<title>`, Open Graph, JSON-LD Product)
- Görsel yükleme: istemci tarafında 1024px / JPEG 0.85 sıkıştırma, Gemini Vision'a gönderim
- Lens (tersine görsel arama) ile satıcı keşfi
- Streaming sohbet, çoklu sepet, sohbet geçmişi (son 20 sohbet)
- Cinsiyet, bütçe ve stil tercihleri için hatırlanan kullanıcı tercihleri
- Görsel üretiminde 3 katmanlı yedekleme: `localStorage` SHA1 önbelleği → Gemini görsel üretimi → mock dosyalar
- Anahtar olmadan da çalışan tam mock yedeği (demo asla 500 dönmez)

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # anahtarları doldurun
npm run dev
```

http://localhost:3000 adresini açın.

### Gerekli ortam değişkenleri

| Değişken | Amaç |
|---|---|
| `GEMINI_API_KEY` | Gemini metin, görsel anlama ve görsel üretimi |
| `SERPER_API_KEY` | Ürün araması (opsiyonel — yoksa mock döner) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk kimlik doğrulama (istemci) |
| `CLERK_SECRET_KEY` | Clerk kimlik doğrulama (sunucu) |
| `SUPABASE_URL` | Kullanıcı durumu deposu |
| `SUPABASE_SERVICE_ROLE_KEY` | Yalnızca sunucu tarafı Supabase erişimi |
| `NEXT_PUBLIC_DEMO_ENABLED` | (Opsiyonel) Açılış sayfasında demo giriş düğmesi |
| `DEMO_USER_ID` | (Opsiyonel) Demo hesabın Clerk `user.id` değeri |

Eksik anahtarlar 500 hatası vermez — API rotaları mock veri döner, böylece arayüz kullanılabilir kalır.

Supabase şeması [`supabase/schema.sql`](supabase/schema.sql) içindedir. Supabase SQL düzenleyicisinde bir kez çalıştırın.

## Proje yapısı

```
app/
  page.tsx              Açılış sayfası (Vitrine arka planı + hero)
  chat/page.tsx         Sohbet arayüzü
  about/page.tsx        Hakkında sayfası
  promo/page.tsx        Tanıtım sahneleri
  api/chat              Streaming Gemini sohbeti
  api/analyze           Yüklenen görseller için Gemini Vision
  api/resolve           Sunucu tarafında ürün URL'si çekme + parse
  api/search            Serper.dev arama sarmalayıcısı
  api/generate          Gemini görsel üretimi + mock yedek
  api/lens              Tersine görsel ile ürün arama
  api/state             Supabase kullanıcı durumu oku/yaz
  api/demo-login        Tek tıkla demo hesabı oturumu
components/             İstemci bileşenleri (sohbet, modallar, kartlar, sepet)
lib/
  gemini.ts             Gemini istemcisi + mod prompt tabloları
  search.ts             Serper istemcisi
  i18n.ts               TR/EN dize sözlüğü + t()
  types.ts              Standart tipler (StandardResponse, Product, Chat…)
  mocks.ts              Yedek veri
  cart.ts, chats.ts     localStorage yardımcıları
  userState.ts, prefs.ts, supabase.ts
  cache.ts              Görsel üretim SHA1 önbelleği
  retailers.ts, format.ts, image.ts, preamble.ts
design/                 Otoriter görsel referans (HTML + JSX prototipleri)
public/vitrine/         Açılış sayfası görselleri
public/mocks/           Görsel üretim mock fallback dosyaları
supabase/schema.sql     Veritabanı şeması
```

Tam mimari referansı için [`AGENTS.md`](AGENTS.md), tasarım token'ları ve kuralları için [`CLAUDE.md`](CLAUDE.md) dosyalarına bakın.

## Modlar

- **Otomatik** — Ürün tipini tespit eder, tek atımda ilgili moda yönlendirir.
- **Fiyat** — Aynı ürünü farklı satıcılarda karşılaştırır, en uygun seçeneği önerir.
- **Moda** — 5–6 tamamlayıcı parça önerir ve flat lay görseli üretir.
- **Ev** — 5–6 uyumlu ev eşyası önerir ve oda render'ı üretir.
- **Elektronik** — Spesifikasyon kıyaslaması yapar ve 3 alternatif önerir.
- **Güzellik** — 4 tamamlayıcı ürün önerir.

## Komutlar

- `npm run dev` — yerel geliştirme sunucusu
- `npm run dev:clean` — `.next` önbelleğini temizleyip başlatır
- `npm run build` / `npm run start` — production derleme + sunma
- `npm run lint` — Next.js lint
- `npm run typecheck` — sıkı TypeScript kontrolü

## Dağıtım

Vercel için tasarlandı (Hobby planı yeterli). Proje ayarlarında `.env.example` içindeki değişkenleri tanımlayın ve `main` üzerinden deploy edin.
