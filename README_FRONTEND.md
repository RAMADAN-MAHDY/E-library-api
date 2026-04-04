# 📖 دليل مطور الفرونت إند - (المستخدم العادي) 📚

أهلاً بك! هذا الدليل مخصص لمساعدتك في بناء واجهة المستخدم (User Interface) لمتجر الكتب. يركز هذا الملف على العمليات التي يقوم بها الزائر أو المشتري.

---

## ⚙️ معلومات عامة
*   **Base URL**: `https://40f2-197-133-60-148.ngrok-free.app/api/v1`
*   **Authentication**: يتم إرسال التوكن في الهيدر:
    `Authorization: Bearer <JWT_TOKEN>`

---

## 🔐 نظام الحسابات (Authentication)

### 1. إنشاء حساب (Register)
*   **المسار**: `POST /auth/register`
*   **البيانات**: `{ name, email, password }`

### 2. تسجيل الدخول (Login)
*   **المسار**: `POST /auth/login`
*   **البيانات**: `{ email, password }`

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
  console.log(data.data); // قائمة الكتب
  console.log(data.pagination); // معلومات الصفحات (totalResults, totalPages, etc)
};
```

### 2. تفاصيل كتاب معين
*   **المسار**: `GET /files/:id`
*   **الوصف**: يرجع كافة التفاصيل بما في ذلك المجال والنوع والخصومات.

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
*   **الأنواع**: `GET /product-types`

---

## 🛒 سلة المشتريات (Cart)

*   **عرض السلة**: `GET /cart`
*   **إضافة عنصر**: `POST /cart/add` -> البيانات: `{ fileId }`
*   **حذف عنصر**: `DELETE /cart/remove/:fileId`

---

## ⭐ المفضلة (Favorites)
تتيح للمستخدم حفظ الكتب التي نالت إعجابه للعودة إليها لاحقاً.
*   **عرض المفضلة**: `GET /favorites`
*   **إضافة للمفضلة**: `POST /favorites/add` -> البيانات: `{ fileId }`
*   **حذف من المفضلة**: `DELETE /favorites/remove/:fileId`

---

## 💳 عملية الشراء (Payments)

النظام يستخدم **Stripe**. قبل الشراء، يجب إنشاء "Payment Intent".
*   **المسار**: `POST /payments/create-intent`
*   **البيانات**: `{ bookId, quantity, currency }` (الكمية اختيارية، الافتراضي 1).

**ملاحظة هامة:** السيرفر يتحقق تلقائياً من وجود خصم (`isOnSale`) ويستخدم السعر المخفض في الحساب لضمان الأمان.

```javascript
const payPreview = async (bookId) => {
  const { data } = await axios.post('/payments/create-intent', {
    bookId: bookId,
    quantity: 1
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // ارجع للفرونت إند بـ clientSecret لإتمام الدفع مع Stripe UI
  return data.data.clientSecret;
};
```

---

## 📥 التحميل (Downloads)
بعد نجاح الشراء، يمكن للمستخدم طلب رابط التحميل.
*   **المسار**: `GET /files/:id/download-link` (يتطلب تسجيل دخول).

---

## 💡 ملاحظات تقنية:
1.  **الأسعار**: يتم التعامل بالسنت (Cents). إذا كان السعر `12000` يعني **120.00** دولار.
2.  **العروض**: إذا كان الحقل `isOnSale` قيمته `true` في بيانات الكتاب، يجب عرض سعر الـ `discountPrice` للمستخدم كالسعر الحالي وتشطيب السعر القديم `price`.
3.  **الصور**: روابط `coverUrl` هي روابط سحابية مؤقتة (Presigned) صالحة لمدة أسبوع.

بالتوفيق! 🚀
