# 🔺 KEMET SOCIAL — كيمت سوشيال
**منصة المجتمع السياحي المصري | Egypt's Tourism Social Platform**

---

## نظرة عامة

منصة سوشيال ميديا متكاملة مخصصة للسياحة المصرية، تجمع بين:
- **شبكة اجتماعية** بأسلوب تويتر بالكامل
- **متجر رحلات سياحية** مع نظام دفع متكامل
- **تطبيق موبايل** (React Native / Expo)
- **واجهة برمجية REST** (Flask + SQLite)
- **قاعدة بيانات** علائقية كاملة مع triggers و views

---

## هيكل المشروع

```
kemet-social/
│
├── database/
│   ├── db.py              ← قاعدة البيانات الكاملة + ORM layer
│   ├── schema.sql         ← SQL Schema مرجعي
│   └── kemet.db           ← SQLite database (يُنشأ تلقائياً)
│
├── web/
│   ├── api.py             ← Flask REST API (19 route group)
│   ├── src/
│   │   ├── main.jsx       ← React entry point
│   │   ├── App.jsx        ← التطبيق الكامل (Landing, Feed, Store...)
│   │   └── utils/
│   │       └── api.js     ← API client (connects frontend → backend)
│   ├── index.html         ← HTML entry
│   ├── vite.config.js     ← Vite bundler config
│   └── package.json
│
├── mobile/
│   ├── App.js             ← React Native app كامل
│   ├── app.json           ← Expo config
│   ├── babel.config.js
│   └── package.json
│
├── shared/
│   └── constants.js       ← ثوابت مشتركة (Web + Mobile)
│
├── test_integration.py    ← 108 اختبار شامل
├── start.sh               ← سكريبت تشغيل موحّد
└── README.md
```

---

## التشغيل السريع

### المتطلبات
- Python 3.8+
- Node.js 18+ (للويب والموبايل)
- npm أو yarn

### تشغيل كل شيء دفعة واحدة
```bash
bash start.sh
```

### تشغيل منفصل

```bash
# الاختبارات فقط
bash start.sh test

# API فقط (بدون ويب)
bash start.sh api

# الويب + API معاً
bash start.sh web

# الموبايل + API
bash start.sh mobile
```

### يدوياً خطوة بخطوة

```bash
# 1. تثبيت Python packages
pip3 install flask flask-cors

# 2. تشغيل API
cd web && python3 api.py

# 3. في terminal آخر — تشغيل الويب
cd web && npm install && npm run start

# 4. في terminal آخر — تشغيل الموبايل
cd mobile && npm install && npx expo start
```

---

## قاعدة البيانات

### الجداول (13 جدول)

| الجدول | الوصف |
|--------|-------|
| `users` | المستخدمون + العضوية |
| `sessions` | جلسات تسجيل الدخول + Tokens |
| `posts` | المنشورات |
| `likes` | الإعجابات |
| `comments` | التعليقات (مع nested replies) |
| `follows` | علاقات المتابعة |
| `messages` | الرسائل الخاصة |
| `notifications` | الإشعارات |
| `categories` | تصنيفات الرحلات |
| `tours` | الرحلات والخدمات السياحية |
| `bookings` | الحجوزات |
| `payments` | المدفوعات |
| `reviews` | تقييمات الرحلات |

### الـ Triggers (تحديث تلقائي)
- `likes_count` في جدول `posts` — يزيد/يقل تلقائياً
- `comments_count` — يتحدث عند الإضافة
- `followers_count` و `following_count` — يتحدثان عند Follow/Unfollow
- `posts_count` — يزيد عند نشر منشور جديد
- `updated_at` — يتحدث تلقائياً

### الـ Views
- `v_posts_full` — منشورات كاملة مع بيانات المستخدم
- `v_bookings_full` — حجوزات كاملة مع بيانات المستخدم والرحلة

---

## API Endpoints

### Auth
```
POST   /api/auth/register     ← تسجيل مستخدم جديد
POST   /api/auth/login        ← تسجيل الدخول → token
POST   /api/auth/logout       ← تسجيل الخروج
GET    /api/auth/me           ← بيانات المستخدم الحالي
```

### Users
```
GET    /api/users/:id         ← بروفايل مستخدم
PUT    /api/users/profile     ← تعديل البروفايل
POST   /api/users/:id/follow  ← متابعة / إلغاء متابعة
```

### Posts
```
GET    /api/posts             ← الفيد (limit, offset)
POST   /api/posts             ← نشر منشور جديد
DELETE /api/posts/:id         ← حذف منشور
POST   /api/posts/:id/like    ← إعجاب / إلغاء إعجاب
GET    /api/posts/:id/comments ← تعليقات منشور
POST   /api/posts/:id/comments ← إضافة تعليق
```

### Store
```
GET    /api/store/categories  ← التصنيفات
GET    /api/store/tours       ← الرحلات (فلتر: category, featured)
GET    /api/store/tours/:id   ← تفاصيل رحلة
GET    /api/store/nicknames   ← قائمة أسماء الفراعنة
```

### Bookings
```
GET    /api/bookings          ← حجوزاتي
POST   /api/bookings          ← حجز جديد
POST   /api/bookings/:id/pay  ← تأكيد الدفع
```

### Messages
```
GET    /api/messages/inbox    ← صندوق الوارد
GET    /api/messages/:userId  ← محادثة مع مستخدم
POST   /api/messages/:userId  ← إرسال رسالة
```

### Notifications
```
GET    /api/notifications     ← الإشعارات
POST   /api/notifications/read ← تحديد الكل كمقروء
```

### Reviews & Stats
```
POST   /api/reviews/:tourId   ← تقييم رحلة
GET    /api/stats             ← إحصائيات عامة
GET    /api/health            ← حالة الخادم
```

---

## طرق الدفع المدعومة

| الطريقة | الوصف |
|---------|-------|
| `card` | بطاقة ائتمان / خصم |
| `paypal` | PayPal |
| `vodafone` | فودافون كاش |
| `instapay` | InstaPay |
| `whatsapp` | تحويل عبر واتساب |

---

## الرحلات المتوفرة (Seed Data)

| الرحلة | السعر | المدة |
|--------|-------|-------|
| رحلة الأقصر والأسوان الملكية | $1,200 | 7 أيام |
| باقة الأهرامات والقاهرة | $850 | 5 أيام |
| جولة النيل الفاخرة (كروز) | $1,800 | 10 أيام |
| استشارة سياحية شخصية | $150 | خدمة |
| باقة سياحة علاجية - أسنان | $600 | 5 أيام |
| تجربة الواحات والصحراء | $950 | 6 أيام |

---

## مستويات العضوية

| المستوى | الوصف |
|---------|-------|
| `free` | مجاني |
| `classic` | كلاسيك 🥈 |
| `gold` | ذهبي 🥇 |
| `platinum` | بلاتيني 💎 |

---

## حسابات تجريبية

```
البريد:    ramesses@kemet.com
كلمة السر: Demo1234!
النيكنيم:  رمسيس العظيم 👑
العضوية:   Gold

البريد:    nefertiti@kemet.com
كلمة السر: Demo1234!
النيكنيم:  نفرتيتي 💎
العضوية:   Platinum

البريد:    thutmose@kemet.com
كلمة السر: Demo1234!
النيكنيم:  تحتمس الثالث ⚔️
العضوية:   Classic
```

---

## نتائج الاختبارات

```
108/108 اختبار ✅ — جميع الاختبارات تجتاز
```

تشمل الاختبارات:
- تسجيل الدخول والخروج وحماية المسارات
- CRUD كامل للمنشورات
- نظام الإعجابات والتعليقات المتداخلة
- نظام المتابعة
- الرسائل الخاصة
- الإشعارات
- الاستور والحجوزات والمدفوعات
- التقييمات
- Database Triggers & Views
- الحماية الأمنية (401, 403, 404)

---

## التقنيات المستخدمة

### Backend
- **Python 3** + **Flask** + **Flask-CORS**
- **SQLite 3** — قاعدة بيانات خفيفة وسريعة
- **WAL Mode** للأداء العالي

### Web Frontend
- **React 18** + **Vite**
- **JavaScript ES6+**
- لا يوجد CSS framework — تصميم خاص بالكامل

### Mobile
- **React Native** + **Expo**
- متوافق مع iOS و Android

---

## الخطوات القادمة (النسخة 2.0)

- [ ] تحميل الصور الحقيقية (Cloudinary / S3)
- [ ] إشعارات Push (Firebase)
- [ ] دردشة فورية (WebSocket)
- [ ] خريطة تفاعلية للمواقع السياحية
- [ ] نظام مكالمات فيديو للاستشارات
- [ ] لوحة إدارة (Admin Dashboard)
- [ ] بوابة دفع حقيقية (Stripe / Paymob)
- [ ] دعم متعدد اللغات (فرنسي، ألماني)

---

*KEMET SOCIAL v1.0.0 — Powered by kemetlegacy.com*
*ترخيص سياحي طبي رسمي ✓*
