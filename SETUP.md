# 🚀 EV Fleet Communication Tool - Tam Kurulum Rehberi

Bu rehber ürünü tam çalışır hale getirmek için gereken tüm adımları içerir.

## 📋 Gerekli Servisler

### 1. 🔗 Vercel KV (Database)
- **Amaç:** Sürücü ve kampanya verilerini saklamak
- **Ücretsiz Plan:** 30,000 komut/ay
- **Kurulum:** Aşağıda detayları var

### 2. 📱 Twilio (SMS & Voice)
- **Amaç:** SMS gönderimi ve sesli arama
- **Ücretsiz:** $15 trial credit
- **Kurulum:** Aşağıda detayları var

### 3. 🤖 OpenAI (AI Assistant)
- **Amaç:** Sesli yanıtları analiz etmek
- **Ücret:** $0.002/1K token (~$2/ay ortalama)
- **Kurulum:** Aşağıda detayları var

---

## 🏗️ 1. Vercel KV Kurulumu

### Adım 1: Vercel'de KV Database Oluştur
1. [Vercel Dashboard](https://vercel.com/dashboard)'a git
2. Projen seç: **bluedot-connect**
3. **Storage** sekmesine git
4. **Create Database** → **KV** seç
5. Veritabanı adı: `ev-fleet-db`
6. **Create** tıkla

### Adım 2: ENV Variables Kopyala
KV oluşturulduktan sonra aşağıdaki değerleri kopyala:
```
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

---

## 📱 2. Twilio Kurulumu

### Adım 1: Twilio Hesabı Aç
1. [Twilio Console](https://console.twilio.com/) → Sign Up
2. Telefon numaranı doğrula
3. $15 trial credit alacaksın

### Adım 2: Phone Number Al
1. **Phone Numbers** → **Manage** → **Buy a number**
2. **Turkey** seç (Türkiye'de SMS göndermek için)
3. Bir numara seç ve satın al
4. **Voice** ve **SMS** özelliklerini aktif et

### Adım 3: Webhook URL'leri Ayarla
Phone number ayarlarında:
- **SMS Webhook:** `https://bluedot-connect.vercel.app/api/twilio/sms`
- **Voice Webhook:** `https://bluedot-connect.vercel.app/api/twilio/voice`

### Adım 4: Credentials Al
[Console](https://console.twilio.com/) ana sayfasından:
```
TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=xxxxx...
TWILIO_PHONE_NUMBER=+90xxxxx... (aldığın numara)
```

---

## 🤖 3. OpenAI Kurulumu

### Adım 1: OpenAI Hesabı
1. [OpenAI Platform](https://platform.openai.com/) → Sign Up
2. Ödeme bilgilerini ekle (minimum $5)

### Adım 2: API Key Oluştur
1. **API Keys** → **Create new secret key**
2. Key'i kopyala (bir daha gösterilmez!)
```
OPENAI_API_KEY=sk-xxxxx...
```

---

## ⚙️ 4. Environment Variables Ayarlama

### Vercel'de ENV Ekleme:
1. Vercel Dashboard → Projen → **Settings** → **Environment Variables**
2. Aşağıdaki tüm değerleri ekle:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+90xxxxxxxxxx

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel KV Configuration (otomatik gelecek)
KV_URL=redis://xxxxxxxx.kv.vercel-storage.com
KV_REST_API_URL=https://xxxxxxxx.kv.vercel-storage.com
KV_REST_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
KV_REST_API_READ_ONLY_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Environment Variables Ekleme:
1. **Key** alanına değişken adını yaz
2. **Value** alanına değeri yapıştır
3. **Environment** olarak **Production**, **Preview**, ve **Development** seç
4. **Add** tıkla

---

## 🧪 5. Test Adımları

### Adım 1: Sürücü Ekleme Testi
1. Site aç: https://bluedot-connect.vercel.app
2. **Sürücüler** sekmesi → **Manuel Ekle**
3. Test sürücüsü ekle:
   - İsim: "Test Sürücüsü"
   - Telefon: Kendi numaranı ekle (test için)
   - E-posta: Kendi e-postan

### Adım 2: SMS Kampanyası Testi
1. **Kampanyalar** sekmesi → **Yeni Kampanya**
2. SMS kampanya oluştur:
   - Ad: "Test SMS"
   - Kanal: SMS
   - Mesaj: "Bu bir test mesajıdır."
   - Hedef: Test sürücüsünü seç

### Adım 3: Kampanya Başlatma
1. **Dashboard** sekmesi
2. Oluşturduğun kampanyada **Başlat** tıkla
3. Telefonuna SMS gelecek!

### Adım 4: Sesli Arama Testi
1. **Kampanyalar** → Yeni sesli kampanya
2. **Dashboard** → **Başlat**
3. Telefonuna arama gelecek

---

## 🔧 6. Sorun Giderme

### SMS Gelmiyor?
- Twilio phone number'da SMS aktif mi?
- Türkiye numarası mı aldın?
- ENV variables doğru mu?

### Sesli Arama Çalışmıyor?
- Phone number'da Voice aktif mi?
- Webhook URL'leri doğru mu?
- OpenAI API key'i geçerli mi?

### Database Çalışmıyor?
- Vercel KV oluşturuldu mu?
- ENV variables projeye eklendi mi?
- Deploy sonrası ayarlar aktif oldu mu?

---

## 💰 7. Maliyet Hesaplama

### Aylık Ortalama Maliyetler:
- **Vercel KV:** Ücretsiz (30K komut/ay)
- **Twilio SMS:** $0.0075/SMS (Türkiye)
- **Twilio Voice:** $0.085/dakika 
- **OpenAI:** ~$2/ay (ortalama kullanım)

**1000 SMS + 100 dakika arama = ~$17/ay**

---

## ✅ 8. Kurulum Tamamlandı!

Tüm adımları tamamladıysan artık:
- ✅ Sürücüleri ekleyebilirsin
- ✅ SMS kampanyaları oluşturabilirsin  
- ✅ Sesli arama kampanyaları yapabilirsin
- ✅ AI ile yanıtları analiz edebilirsin
- ✅ Dashboard'da sonuçları görebilirsin

**🎉 Tebrikler! EV Fleet Communication Tool kullanıma hazır!**

---

## 📞 Destek

Sorun yaşarsan:
1. Bu rehberi tekrar kontrol et
2. Vercel Deployment logs'larını incele
3. Browser console'da hata var mı bak
4. ENV variables'ların hepsini doğrula
