# 🛠️ دليل مطور الفرونت إند - (لوحة التحكم - Admin) ⚙️

أهلاً بك يا مدير النظام! هذا الدليل مخصص لمساعدتك في بناء واجهة الإدارة (Admin Dashboard) للمتجر. تتطلب هذه العمليات أن يكون لدى المستخدم صلاحية `admin`.

---

## ⚙️ معلومات عامة
*   **Base URL**: `https://e-library-api-production.up.railway.app/api/v1`

---

## 📦 إدارة الكتب والمنشورات (Product Management)

### 1. رفع كتاب جديد (Upload)
تتطلب هذه العملية استخدام `multipart/form-data` لإرسال الملفات والبيانات معاً.
*   **المسار**: `POST /files/upload`
*   **البيانات (FormData)**:
    *   `title`: (مطلوب) العنوان.
    *   `description`: (اختياري) الوصف.
    *   `price`: (مطلوب) السعر بالسنت (مثلاً 12000 تعني 120 دولار).
    *   `discountPrice`: (اختياري) السعر المخفض.
    *   `isOnSale`: (`true`/`false`) تفعيل العرض.
    *   `category`: (مطلوب) `_id` المجال (خذه من `GET /categories`).
    *   `productType`: (مطلوب) `_id` النوع (خذه من `GET /product-types`).
    *   `file`: (مطلوب) الملف PDF/EPUB.
    *   `cover`: (اختياري) صورة الغلاف.

```javascript
const uploadBook = async (formData, token) => {
  const { data } = await axios.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
  return data;
};

// مثال تجهيز الـ FormData:
const fd = new FormData();
fd.append('title', 'كتاب الفكر السياسي الجديد');
fd.append('price', 15000);
fd.append('isOnSale', 'true');
fd.append('discountPrice', 10000); // عرض بـ 100 بدلاً من 150
fd.append('category', '69ce...'); 
fd.append('productType', '69ce...');
fd.append('file', pdfFile);
fd.append('cover', coverImage);
```

### 2. تعديل بيانات كتاب (Update)
*   **المسار**: `PATCH /files/:id`
*   **الوصول**: يمكنك تعديل البيانات فقط (JSON) أو إرسال `FormData` لتغيير الملفات أيضاً.

### 3. حذف كتاب (Delete)
*   **المسار**: `DELETE /files/:id`
*   **الوصول**: سيقوم السيرفر بحذف الملف من Cloudflare R2 ومن قاعدة البيانات نهائياً.

---

## 📑 إدارة المجالات والأنواع (Categories & Types)

هذه الجداول منفصلة ويمكن إدارتها بالكامل (إضافة وتعديل وحذف).

### 1. المجالات (Categories)
*   **عرض الكل**: `GET /categories`
*   **إضافة**: `POST /categories` -> `{ name, description }`
*   **تعديل**: `PATCH /categories/:id` -> `{ name, description }`
*   **حذف**: `DELETE /categories/:id`

### 2. أنواع المنتجات (Product Types)
*   **عرض الكل**: `GET /product-types`
*   **إضافة**: `POST /product-types` -> `{ name, description }`
*   **تعديل**: `PATCH /product-types/:id`
*   **حذف**: `DELETE /product-types/:id`

---

## 💳 متابعة المدفوعات (Order Tracking)

يمكن للادمن متابعة الحالات القادمة من Stripe لمراقبة المبيعات.
*   **الفلترة (Query Params)**: 
    *   `status`: (مثل `disputed`, `refunded`, `succeeded`, `failed`) لمراقبة حالات معينة.
    *   `provider`: (مثل `stripe`, `paymob`) لمقارنة أداء بوابات الدفع.
*   **البيانات الراجعة**: تحتوي على بيانات المستخدم الذي اشترى، والكتاب، وحالة العملية في Stripe/Paymob.

### 2. ملخص الإحصائيات المالية (Financial Stats)
هذا المسار يعطيك الأرقام النهائية للأرباح والخسائر والنزاعات دون الحاجة لجلب كل العمليات.
*   **المسار**: `GET /payments/stats` (Admin Only)
*   **النتيجة**: كائن يحتوي على (اجمالي الأرباح، اجمالي المستردات، واجمالي المبالغ المجمدة بسبب نزاعات بنكية).

```javascript
const checkSales = async (token) => {
  // 1. جلب قائمة النزاعات فقط (Disputes)
  const disputes = await axios.get('/api/v1/payments?status=disputed', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // 2. جلب ملخص الإحصائيات المالية
  const stats = await axios.get('/api/v1/payments/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log("إجمالي الأرباح السليمة:", stats.data.data.succeeded.amount / 100);
  console.log("إجمالي المبالغ في نزاعات:", stats.data.data.disputed.amount / 100);
};
```

---

## 📈 لوحة التحليلات المتقدمة (Full Admin Analytics)

يوفر هذا الجزء تقارير شاملة واحترافية لمتابعة أداء المتجر ونمو المستخدمين.

### 1. ملخص الـ Dashboard (KPIs)
*   **المسار**: `GET /admin/dashboard`
*   **الوصف**: يرجع الأرقام الحيوية فوراً (إجمالي الإيرادات، عدد المستخدمين، عدد الكتب، وأحدث 5 عمليات بيع).

### 2. تحليلات المستخدمين (User Growth)
*   **المسار**: `GET /admin/stats/users`
*   **الوصف**: يحلل نمو المستخدمين (الإجمالي، المسجلين الجدد في آخر 30 يوم، عدد المشترين الفعليين، ونسبة التحويل Conversion Rate).

### 3. تقارير الإيرادات (Revenue Breakdown)
*   **المسار**: `GET /admin/revenue`
*   **الوصف**: تفاصيل مالية (يومية لآخر شهر، وشهرية للسنة الحالية).

### 4. المنتجات الأكثر مبيعاً (Top Sellers)
*   **المسار**: `GET /admin/stats/books`
*   **الوصف**: يرجع قائمة بأكثر 10 كتب تحقيقاً للمبيعات والإيرادات.

### 5. تقارير ذكاء الأعمال المتقدمة (Advanced BI Insights)
*   **المسار**: `GET /admin/stats/advanced`
*   **الوصف**: يوفر بيانات استراتيجية للإدارة وتشمل:
    *   `categoryPerformance`: أداء المبيعات حسب كل مجال (Revenue per Category).
    *   `aov`: متوسط قيمة الطلب (Average Order Value).
    *   `stagnantBooks`: الكتب "الراكدة" التي لم تبع أبداً وتم رفعها منذ أكثر من 30 يوم.
    *   `signupChannels`: تحليل طرق تسجيل المستخدمين (Google vs Local).

```javascript
// مثال جلب التحليلات المتقدمة
const loadAdvancedStats = async (token) => {
  const { data } = await axios.get('/admin/stats/advanced', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("أداء المجالات:", data.data.categoryPerformance);
  console.log("متوسط الإنفاق:", data.data.aov.averageCents / 100);
};
```

---

## 💡 نصائح هامة للادمن:
1.  **الأسعار**: تأكد دائماً أنك ترسل الأسعار بالسنت. (السعر المخزن هو ما يدفعه المستخدم في النهاية بالسنت).
2.  **الفئات**: قبل السماح للادمن بإضافة كتاب، قم دائماً بعمل `GET` للمجالات والأنواع لعرضها له في `Select Menu`.
3.  **الصلاحيات**: إذا لم يكن المستخدم يمتلك صلاحية `admin` في حسابه، سيمنعه السيرفر بحالة `403 Forbidden`.

بالتوفيق في بناء لوحة التحكم المتميزة! 🚀
