# 📖 دليل مطور الفرونت إند - (المستخدم العادي) 📚

أهلاً بك! هذا الدليل مخصص لمساعدتك في بناء واجهة المستخدم (User Interface) لمتجر الكتب. يركز هذا الملف على العمليات التي يقوم بها الزائر أو المشتري.

---

## ⚙️ معلومات عامة
*   **Base URL**: `https://e-library-api-production.up.railway.app/api/v1`
*   **Authentication**: يتم إرسال التوكن في الهيدر:
    `Authorization: Bearer <JWT_TOKEN>`

---

## 📦 الشكل العام للرد (Standard Response structure)
جميع الردود الناجحة تأتي بهذا الشكل:
```json
{
  "status": "success",
  "data": { ... } // هنا توجد البيانات الفعلية (أو مصفوفة بيانات)
}
```
في حالة وجود خطأ:
```json
{
  "status": "error",
  "message": "رسالة توضح سبب الخطأ"
}
```

---

## 🔐 نظام الحسابات (Authentication)

### 1. إنشاء حساب (Register)
*   **المسار**: `POST /auth/register`
*   **البيانات**: `{ name, email, password }`

### 2. تسجيل الدخول (Login)
*   **المسار**: `POST /auth/login`
*   **البيانات**: `{ email, password }`

#### شكل الرد (Response):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "65f...",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user" // أو "admin"
    },
    "token": "eyJhbG..." // توكن JWT
  }
}
```

### 3. تسجيل الدخول عبر جوجل (Google Auth)
هذه العملية تعتمد على التحويل (Redirect) وليس طلب API مباشر من الكود:
1.  **بدء العملية**: قم بتوجيه المستخدم إلى الرابط التالي:
    `GET /auth/google` (مثلاً باستخدام `<a href="...">` أو `window.location.assign`).
2.  **بعد النجاح**: سيقوم السيرفر بتحويل المستخدم تلقائياً إلى رابط في الفرونت إند الخاص بك:
    `https://your-frontend-url.com/auth-success?token=<JWT_TOKEN>`
3.  **مهمتك**: اسحب التوكن من الرابط (Query Params) واحفظه في `localStorage` لاستخدامه في الطلبات القادمة.

---

## 📚 تصفح الكتب والمنشورات

### 1. جلب قائمة الكتب (مع الترقيم والبحث والفلترة)
المسار يدعم البحث النصي، الفلترة حسب المجال (Category) أو النوع (ProductType)، والترقيم لتحسين الأداء.
*   **المسار**: `GET /files`
*   **المعاملات (Query Params)**:
    *   `q`: للبحث بالاسم أو الوصف.
    *   `category`: ID المجال (خذه من قائمة المجالات).
    *   `productType`: ID النوع (كتاب، تقرير..).
    *   `page`: رقم الصفحة (الافتراضي 1).
    *   `limit`: عدد العناصر (الافتراضي 12).

```javascript
// مثال جلب الصفحة الأولى من "الفلسفة" مع البحث عن كلمة "تاريخ"
const fetchBooks = async () => {
  const { data } = await axios.get('/files', {
    params: {
      page: 1,
      limit: 10,
      category: '69ce...', // ID المجال
      q: 'تاريخ'
    }
  });
  console.log(data.data); // قائمة الكتب كما في المثال التالي
  console.log(data.pagination); // معلومات الترقيم
};
```

#### شكل الرد للقوائم (Paginated Response):
هذا الشكل ينطبق على `GET /files`, `GET /files/on-sale`:
```json
{
  "status": "success",
  "data": [
    {
      "id": "65f...",
      "title": "عنوان الكتاب",
      "description": "وصف قصير",
      "price": 100, // السعر الأصلي (بالسنت)
      "discountPrice": 80, // السعر بعد الخصم (إن وجد)
      "isOnSale": true,
      "coverUrl": "https://...", // رابط الصورة
      "category": { "_id": "...", "name": "اسم المجال" },
      "productType": { "_id": "...", "name": "كتاب" },
      "createdAt": "2024-..."
    }
  ],
  "pagination": {
    "totalResults": 50,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. تفاصيل كتاب معين
*   **المسار**: `GET /files/:id`
*   **الوصف**: يرجع كافة التفاصيل.

#### شكل الرد (Response):
يرجع كائن (Object) يحتوي على بيانات إضافية مثل `size` و `mimeType`:
```json
{
  "status": "success",
  "data": {
    "id": "65f...",
    "title": "...",
    "price": 100,
    "coverUrl": "...",
    "size": 102450, // حجم الملف بالبايت
    "mimeType": "application/pdf",
    "category": { ... },
    "productType": { ... }
  }
}
```

### 3. جلب العروض والخصومات فقط (On Sale)
*   **المسار**: `GET /files/on-sale`
*   **الوصف**: يرجع فقط الكتب التي عليها خصم حالياً (`isOnSale: true`).

### 4. الأكثر طلباً (Trending)
*   **المسار**: `GET /files/trending`
*   **الوصف**: يرجع الكتب الأكثر مبيعاً بناءً على عدد مرات الشراء الناجحة.

### 5. الأكثر تفضيلاً (Popular)
*   **المسار**: `GET /files/popular`
*   **الوصف**: يرجع الكتب التي تمت إضافتها للمفضلة أكثر من غيرها.

---

## 🗂️ القوائم المساعدة (Filters)
لإظهار قائمة المجالات أو الأنواع في "القائمة الجانبية" للفلترة:
*   **المجالات**: `GET /categories`
    *   **الرد**: مصفوفة من المجالات `{ _id, name, description, coverUrl }`.
*   **الأنواع**: `GET /product-types`
    *   **الرد**: مصفوفة من الأنواع `{ _id, name }`.

---

## 🛒 سلة المشتريات (Cart)

*   **عرض السلة**: `GET /cart`
*   **إضافة عنصر**: `POST /cart/:fileId` (ملاحظة: مسار الرابط يحتوي على ID الكتاب)
*   **حذف عنصر**: `DELETE /cart/:fileId`
*   **تفريغ السلة**: `DELETE /cart`

### شكل الاستجابة (Response):
البيانات الراجعة للسلة ستحتوي على قائمة بالكتب, مع تفاصيل الكتاب بما في ذلك `title` ورابط الغلاف:
```javascript
{
  "status": "success",
  "data": {
    "_id": "64e...",
    "user": "64e...",
    "items": [
      {
        "file": {
          "_id": "65f...",
          "title": "عنوان الكتاب",
          "description": "وصف قصير",
          "price": 100,
          "coverUrl": "https://...",
          "originalName": "file.pdf"
        },
        "quantity": 1,
        "priceAtAdd": 100
      }
    ],
    "total": 100
  }
}
```

---

## ⭐ المفضلة (Favorites)
تتيح للمستخدم حفظ الكتب التي نالت إعجابه للعودة إليها لاحقاً.
*   **عرض المفضلة**: `GET /favorites`
*   **إضافة للمفضلة**: `POST /favorites/add` -> البيانات: `{ fileId }`
*   **حذف من المفضلة**: `DELETE /favorites/remove/:fileId`

#### شكل الرد (Response):
يرجع مصفوفة من الكتب المفضلة بنفس شكل بيانات الكتاب في `GET /files`:
```json
{
  "status": "success",
  "data": [
    { "id": "...", "title": "...", "price": 100, "coverUrl": "..." }
  ]
}
```

---

## 💳 عملية الشراء (Payments)

النظام يدعم وسيلتي دفع: **Stripe** و **Paymob**. يمكنك الاختيار بينهما عند طلب السيرفر.

### 1. بدء عملية دفع
*   **المسار**: `POST /payments/create-intent`
*   **البيانات (Body)**: 
    *   `bookId`: (مطلوب) ID الكتاب.
    *   `provider`: (اختياري) إما `"stripe"` أو  `"paymob"`. الافتراضي هو `stripe`.
    *   `currency`: (اختياري) العملة (كود ISO مثل `"USD"` أو `"EGP"`).
    *   `phone`: (**مطلوب لـ Paymob**) رقم هاتف العميل لإتمام العملية.
    *   `quantity`: (اختياري) الكمية.

### 2. التعامل مع النتيجة (Stripe)
إذا اخترت `provider: "stripe"`، سيرجع لك السيرفر **clientSecret** و **redirectionUrl**.
*   **المهمة**: 
    1. استخدم الـ `clientSecret` مع مكتبة Stripe React/JS لإظهار نموذج الدفع.
    2. عند استدعاء دالة التأكيد `confirmPayment` في الفرونت إند، قم بتمرير الـ `redirectionUrl` المستلم في خانة الـ `return_url`. ستقوم Stripe بتحويل المستخدم لهذا الرابط تلقائياً بعد نجاح الدفع.

### 3. التعامل مع النتيجة (Paymob)
إذا اخترت `provider: "paymob"`، سيرجع لك السيرفر **paymentLink** و **redirectionUrl**.
*   **المهمة**: قم بتوجيه المستخدم (Redirect) لـ `paymentLink` ليقوم بالدفع. سيعود المستخدم تلقائياً لـ `redirectionUrl` (وهو `/payment-status`) بعد معالجة الطلب في الخلفية.


### 3. مثال متكامل لبدء عملية الدفع (Full Example)
هذا الكود يوضح كيفية طلب الدفع والتعامل مع النتيجة بناءً على الوسيلة المختارة:

```javascript
const handlePurchase = async (bookId, method = 'stripe') => {
  try {
    // 1. طلب إنشاء عملية الدفع من السيرفر
    const { data } = await axios.post('/payments/create-intent', {
      bookId: bookId,
      provider: method, // 'stripe' أو 'paymob'
      currency: 'EGP',
      phone: '01012345678' // مطلوب لـ Paymob
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { paymentLink, clientSecret, redirectionUrl, provider } = data.data;

    // 2. التحقق من الوسيلة المختارة وتنفيذ الخطوة التالية
    if (provider === 'paymob') {
      // حالة Paymob: قم بتحويل المستخدم لصفحة الدفع الخارجية فوراً
      // السيرفر سيعيد المستخدم لـ redirectionUrl تلقائياً بعد الدفع
      window.location.assign(paymentLink);
    } 
    else if (provider === 'stripe') {
      // حالة Stripe: استخدم الـ clientSecret مع مكتبة Stripe
      const stripe = await loadStripe('your_publishable_key');
      
      const session = await stripe.confirmPayment({
        elements, // نموذج الدفع الخاص بـ Stripe
        confirmParams: {
          // هـــــام: استخدم الرابط المستلم من السيرفر هنا
          return_url: redirectionUrl, 
        },
      });
    }
  } catch (error) {
    console.error("Payment Error:", error.response?.data?.message || error.message);
  }
};
```
```

### 4. التحقق من حالة الدفع (بعد الرجوع من بوابة الدفع)
بعد إتمام الدفع (خاصة في Paymob)، سيقوم السيرفر بتحويل المستخدم إلى رابط في الفرونت إند الخاص بك:
`https://your-frontend-url.com/payment-status?success=true&orderId=123456...`

**المهمة**: استخدم الـ `orderId` (أو الـ `transactionId` في حالة Stripe) لجلب تفاصيل العملية والتأكد من نجاحها ومعرفة ID الكتاب المرتبط بها.
*   **المسار**: `GET /payments/:transactionId` (يتطلب تسجيل دخول).

#### شكل الرد (Response):
```json
{
  "status": "success",
  "data": {
    "_id": "65f...",
    "status": "succeeded",
    "amount": 1000,
    "provider": "paymob",
    "book": {
      "id": "65f...",
      "title": "اسم الكتاب",
      "price": 1000,
      "coverUrl": "https://..."
    },
    "createdAt": "..."
  }
}
```

### 5. عرض سجل المشتريات (مكتبتي)
إظهار قائمة بكافة كافية الكتب التي اشتراها المستخدم بنجاح:
*   **المسار**: `GET /payments/my-purchases` (يتطلب تسجيل دخول).

#### شكل الرد (Response):
يرجع مصفوفة من عمليات الشراء الناجحة:
```json
{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "status": "succeeded",
      "book": { 
        "id": "...", 
        "title": "...", 
        "price": 1000,
        "coverUrl": "..." 
      }
    }
  ]
}
```

---

## 📥 التحميل (Downloads)
بعد نجاح الشراء، يمكن للمستخدم طلب رابط التحميل المؤقت.
*   **المسار**: `GET /files/:id/download-link` (يتطلب تسجيل دخول).

#### شكل الرد (Response):
```json
{
  "status": "success",
  "data": {
    "url": "https://r2.storage.com/temp-link-to-file...",
    "expiresIn": 300 // الرابط صالح لمدة 5 دقائق
  }
}
```

---

## ⚙️ إعدادات الموقع الثابتة (Settings)
تسمح لك هذه النقطة بجلب معلومات الموقع العامة مثل روابـط التواصل الاجتماعي ورقم الهاتف والنص التذييلي، لاستخدامها في تذييل الصفحة (Footer) أو أزرار الاتصال.
*   **المسار**: `GET /settings`
*   **الوصف**: يرجع الإعدادات العامة والتواصل الخاصة بالمتجر. (لا يتطلب تسجيل دخول).
*   **مثال للاستجابة**:
    ```json
    {
      "status": "success",
      "data": {
        "footerText": "© 2026 E-Library. All rights reserved.",
        "phone": "+1234567890",
        "facebookLink": "https://facebook.com/elibrary",
        "instagramLink": "https://instagram.com/elibrary",
        "whatsappLink": "https://wa.me/1234567890"
      }
    }
    ```

---

## 🔄 مسار العمل المتكامل (Example Flow):
1.  يضغط المستخدم "شراء" -> تطلب `POST /payments/create-intent`.
2.  يتم توجيه المستخدم لصفحة الدفع الخارجية في Paymob.
3.  بعد الدفع، يعود المستخدم لموقعك -> تسحب الـ `orderId` من الرابط.
4.  تطلب `GET /payments/:orderId` للتأكد من نجاح العملية ومعرفة الـ `bookId`.
5.  تعرض للمستخدم زر "تحميل" -> عند الضغط يطلب `GET /files/:bookId/download-link`.
6.  تفتح الرابط الناتج في نافذة جديدة ليبدأ التحميل.

---

## 💡 ملاحظات تقنية:
1.  **الأسعار**: يتم التعامل بالسنت (Cents). إذا كان السعر `12000` يعني **120.00** دولار.
2.  **العروض**: إذا كان الحقل `isOnSale` قيمته `true` في بيانات الكتاب، يجب عرض سعر الـ `discountPrice` للمستخدم كالسعر الحالي وتشطيب السعر القديم `price`.
3.  **الصور**: روابط `coverUrl` هي روابط سحابية مؤقتة (Presigned) صالحة لمدة أسبوع.
4.  **حالات الدفع (Status)**:
    *   `succeeded`: العملية ناجحة (يسمح بالتحميل).
    *   `failed` / `canceled`: العملية فشلت أو ألغيت.
    *   `refunded`: تم استرداد المبلغ (يتم إيقاف التحميل فوراً).
    *   `disputed`: هناك نزاع بنكي أو شكوى (يتم تعليق التحميل مؤقتاً لحين حل النزاع).

بالتوفيق! 🚀
