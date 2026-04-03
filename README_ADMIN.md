# 🛠️ دليل مطور الفرونت إند - (لوحة التحكم - Admin) ⚙️

أهلاً بك يا مدير النظام! هذا الدليل مخصص لمساعدتك في بناء واجهة الإدارة (Admin Dashboard) للمتجر. تتطلب هذه العمليات أن يكون لدى المستخدم صلاحية `admin`.

---

## ⚙️ معلومات عامة
*   **Base URL**: `https://40f2-197-133-60-148.ngrok-free.app/api/v1`
*   **Authentication**: لابد من تسجيل الدخول والموافقة من السيرفر كمسؤول.

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
*   **المسار**: `GET /payments` (Admin Only)
*   **الفلترة**: `GET /payments?status=succeeded`
*   **البيانات الراجعة**: تحتوي على بيانات المستخدم الذي اشترى، والكتاب، وحالة العملية في Stripe.

```javascript
const checkSales = async (token) => {
  const { data } = await axios.get('/payments', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // قائمة المدفوعات مع تفاصيل العميل والكتاب
  console.log(data.data); 
};
```

---

## 💡 نصائح هامة للادمن:
1.  **الأسعار**: تأكد دائماً أنك ترسل الأسعار بالسنت. (السعر المخزن هو ما يدفعه المستخدم في النهاية بالسنت).
2.  **الفئات**: قبل السماح للادمن بإضافة كتاب، قم دائماً بعمل `GET` للمجالات والأنواع لعرضها له في `Select Menu`.
3.  **الصلاحيات**: إذا لم يكن المستخدم يمتلك صلاحية `admin` في حسابه، سيمنعه السيرفر بحالة `403 Forbidden`.

بالتوفيق في بناء لوحة التحكم المتميزة! 🚀
