# 📚 دليل المطور - E-liprary Backend

أهلاً بك! هذا الملف مصمم لمساعدة مطوري الفرونت إند (Frontend) في التعامل مع الـ API الخاص بمتجر الكتب الإلكترونية. تم بناء النظام باستخدام **Node.js, Express, MongoDB** والتخزين السحابي **Cloudflare R2**.

---

## ⚙️ معلومات عامة
*   **Base URL**: `http://localhost:5000/api/v1`
*   **Content-Type**: `application/json` (في أغلب الطلبات)
*   **Authentication**: يتم استخدام `JWT Token` في الـ Header كالتالي:
    `Authorization: Bearer <token>`

---

## 🔐 نظام الحسابات (Authentication)

### 1. إنشاء حساب جديد
*   **المسار**: `POST /auth/register`
```javascript
const response = await axios.post('/auth/register', {
  name: "John Doe",
  email: "john@example.com",
  password: "password123"
});
// النتيجة: ترجع البيانات مع الـ Token
```

### 2. تسجيل الدخول
*   **المسار**: `POST /auth/login`
```javascript
const login = async (email, password) => {
  const { data } = await axios.post('/auth/login', { email, password });
  // احفظ الـ data.token في الـ LocalStorage أو State
  return data;
};
```

---

## 📖 إدارة الكتب (Files & Books)

### 1. عرض كل الكتب (Public Catalog)
هذا المسار عام ولا يحتاج تسجيل دخول. الرابط يحتوي على `coverUrl` جاهز للعرض.
*   **المسار**: `GET /files`
```javascript
const { data } = await axios.get('/files');
// data.data هي مصفوفة تحتوي على الكتب مع روابط الصور
```

### 2. رفع كتاب جديد (Upload)
يتطلب `multipart/form-data` لأنه يحتوي على ملفات.
*   **المسار**: `POST /files/upload`
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

// طريقة تجهيز الـ FormData في الفرونت إند:
// const fData = new FormData();
// fData.append('title', 'My New Book');
// fData.append('file', mainFile); // الملف الأساسي
// fData.append('cover', coverImage); // صورة الغلاف اختياري
```

### 3. تعديل كتاب (Update)
يدعم تعديل البيانات فقط (JSON) أو تعديل الملفات (Multipart).
*   **المسار**: `PATCH /files/:id`
```javascript
// تعديل العنوان والسعر فقط
await axios.patch(`/files/${bookId}`, {
  title: "New Title",
  price: 2000
}, { headers: { Authorization: `Bearer ${token}` } });
```

### 4. الحصول على رابط التحميل (Download)
لأن الروابط في Cloudflare R2 مؤمنة ومؤقتة، يجب طلب رابط التحميل عند الضغط على زر "تحميل".
*   **المسار**: `GET /files/:id/download-link`
```javascript
const download = async (id, token) => {
  const { data } = await axios.get(`/files/${id}/download-link`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  window.open(data.data.url, '_blank'); // سيفتح رابط التحميل المباشر
};
```

---

## 🛒 سلة المشتريات (Cart)

كل مستخدم لديه سلة مرتبطة بحسابه في قاعدة البيانات.

### 1. عرض السلة
*   **المسار**: `GET /cart`
```javascript
const { data } = await axios.get('/cart', {
  headers: { Authorization: `Bearer ${token}` }
});
// ترجع السلة مع إجمالي السعر (totalPrice)
```

### 2. إضافة كتاب للسلة
*   **المسار**: `POST /cart/add`
```javascript
await axios.post('/cart/add', { fileId: "ID_BOOK" }, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 💳 الدفع (Payments)

النظام متكامل مع **Stripe**.

### إنشاء عملية دفع (Create Payment Intent)
بعد أن يقرر المستخدم الشراء، نطلب من السيرفر إنشاء `Secret Key` لـ Stripe.
*   **المسار**: `POST /payments/create-intent`
```javascript
const createPayment = async (token) => {
  const { data } = await axios.post('/payments/create-intent', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data.data.clientSecret; // استخدم هذا مع Stripe Elements في الفرونت إند
};
```

---

## 💡 ملاحظات هامة للفرونت إند:
1.  **الأسعار**: يتم تخزين الأسعار في قاعدة البيانات بـ **"القروش" (Cents)**. يعني لو الكتاب سعره 10 دولار، القيمة هتكون `1000`. اقسم دائماً على 100 عند العرض.
2.  **الأخطاء**: السيرفر يرجع الأخطاء دائماً بهذا التنسيق:
    `{ "status": "error", "message": "رسالة الخطأ هنا" }`
3.  **روابط الصور**: روابط الصور (Cover Images) في قائمة الكتب هي روابط **مؤقتة** (تنتهي بعد 5 دقائق)، لذا لا تقم بتخزين الرابط نفسه، بل قم بعمل Refresh للقائمة إذا لزم الأمر.

بالتوفيق في بناء واجهة المتجر! 🚀
