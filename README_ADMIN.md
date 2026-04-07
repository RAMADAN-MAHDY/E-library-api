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
*   **الوصف**: يقوم برفع كتاب جديد إلى المتجر. يتطلب صلاحيات `admin`.
*   **البيانات المطلوبة (FormData)**:
    *   `title`: `string` (مطلوب) - عنوان الكتاب.
    *   `description`: `string` (اختياري) - وصف موجز للكتاب.
    *   `price`: `number` (مطلوب) - سعر الكتاب بالسنت (مثلاً 12000 تعني 120 دولار).
    *   `discountPrice`: `number` (اختياري) - السعر المخفض للكتاب بالسنت.
    *   `isOnSale`: `boolean` (اختياري) - لتحديد ما إذا كان الكتاب معروضًا للبيع بخصم (`true`/`false`).
    *   `category`: `string` (مطلوب) - `_id` الخاص بالمجال الذي ينتمي إليه الكتاب.
    *   `productType`: `string` (مطلوب) - `_id` الخاص بنوع المنتج (مثل كتاب، تقرير).
    *   `file`: `File` (مطلوب) - ملف الكتاب نفسه (PDF/EPUB).
    *   `cover`: `File` (اختياري) - صورة الغلاف للكتاب.
*   **الاستجابة الناجحة (Success Response - Status: 201 Created)**:
    ```json
    {
      "status": "success",
      "code": 201,
      "message": "File uploaded successfully",
      "data": {
        "_id": "string",
        "title": "string",
        "description": "string",
        "price": "number",
        "discountPrice": "number",
        "isOnSale": "boolean",
        "coverUrl": "string",     // رابط صورة الغلاف
        "fileUrl": "string",      // رابط الملف
        "category": {
          "_id": "string",
          "name": "string"
        },
        "productType": {
          "_id": "string",
          "name": "string"
        },
        "owner": "string",     // معرف الناشر (المستخدم الذي قام بالرفع)
        "createdAt": "date",
        "updatedAt": "date"
      }
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **400 Bad Request - خطأ في التحقق أو بيانات غير صالحة**:
        ```json
        {
          "status": "fail",
          "code": 400,
          "message": "Validation Error",
          "errors": [
            {
              "field": "title",
              "message": "Title is required"
            },
            {
              "field": "file",
              "message": "File is required"
            }
          ]
        }
        ```
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const uploadBook = async (formData, token) => {
      try {
        const response = await axios.post('https://e-library-api-production.up.railway.app/api/v1/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Book uploaded successfully:', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Failed to upload book:', error.response ? error.response.data : error.message);
        throw error;
      }
    };

    // مثال تجهيز الـ FormData:
    // const fd = new FormData();
    // fd.append('title', 'كتاب الفكر السياسي الجديد');
    // fd.append('price', 15000);
    // fd.append('isOnSale', 'true');
    // fd.append('discountPrice', 10000);
    // fd.append('category', '69ce...');
    // fd.append('productType', '69ce...');
    // fd.append('file', pdfFile); // pdfFile هو كائن File
    // fd.append('cover', coverImage); // coverImage هو كائن File
    // uploadBook(fd, 'your_admin_jwt_token');
    ```

### 2. تعديل بيانات كتاب (Update)
*   **المسار**: `PATCH /files/:id`
*   **الوصف**: يقوم بتعديل بيانات كتاب موجود. يمكن تعديل البيانات فقط (JSON) أو إرسال `FormData` لتغيير الملفات أيضاً. يتطلب صلاحيات `admin`.
*   **معاملات المسار (Path Parameters)**:
    *   `id`: `string` (مطلوب) - معرف الكتاب المراد تعديله.
*   **البيانات المطلوبة (Request Body - يمكن أن تكون JSON أو FormData)**:
    *   `title`: `string` (اختياري) - عنوان الكتاب الجديد.
    *   `description`: `string` (اختياري) - وصف الكتاب الجديد.
    *   `price`: `number` (اختياري) - سعر الكتاب الجديد بالسنت.
    *   `discountPrice`: `number` (اختياري) - السعر المخفض الجديد.
    *   `isOnSale`: `boolean` (اختياري) - حالة العرض الجديدة.
    *   `category`: `string` (اختياري) - `_id` المجال الجديد.
    *   `productType`: `string` (اختياري) - `_id` النوع الجديد.
    *   `file`: `File` (اختياري) - ملف الكتاب الجديد (PDF/EPUB).
    *   `cover`: `File` (اختياري) - صورة الغلاف الجديدة.
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "File updated successfully",
      "data": {
        "_id": "string",
        "title": "string",
        // ... باقي حقول الكتاب المحدثة
      }
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **400 Bad Request - خطأ في التحقق أو بيانات غير صالحة**:
        ```json
        {
          "status": "fail",
          "code": 400,
          "message": "Validation Error"
        }
        ```
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **404 Not Found - الكتاب غير موجود**:
        ```json
        {
          "status": "fail",
          "code": 404,
          "message": "File not found"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios - تحديث JSON)**:
    ```javascript
    import axios from 'axios';

    const updateBookJson = async (bookId, updateData, token) => {
      try {
        const response = await axios.patch(`https://e-library-api-production.up.railway.app/api/v1/files/${bookId}`, updateData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Book updated successfully (JSON):', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Failed to update book (JSON):', error.response ? error.response.data : error.message);
        throw error;
      }
    };

    // مثال على الكود (Axios - تحديث FormData مع ملفات)
    const updateBookFormData = async (bookId, formData, token) => {
      try {
        const response = await axios.patch(`https://e-library-api-production.up.railway.app/api/v1/files/${bookId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Book updated successfully (FormData):', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Failed to update book (FormData):', error.response ? error.response.data : error.message);
        throw error;
      }
    };

    // مثال للاستخدام:
    // updateBookJson('bookId123', { title: 'عنوان جديد', price: 20000 }, 'your_admin_jwt_token');
    // const fdUpdate = new FormData();
    // fdUpdate.append('cover', newCoverImageFile);
    // updateBookFormData('bookId123', fdUpdate, 'your_admin_jwt_token');
    ```

### 3. حذف كتاب (Delete)
*   **المسار**: `DELETE /files/:id`
*   **الوصف**: يقوم بحذف كتاب معين من المتجر بشكل دائم، بما في ذلك الملفات المرتبطة به من Cloudflare R2. يتطلب صلاحيات `admin`.
*   **معاملات المسار (Path Parameters)**:
    *   `id`: `string` (مطلوب) - معرف الكتاب المراد حذفه.
*   **الوصول**: سيقوم السيرفر بحذف الملف من Cloudflare R2 ومن قاعدة البيانات نهائياً.
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "File deleted successfully",
      "data": null
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **404 Not Found - الكتاب غير موجود**:
        ```json
        {
          "status": "fail",
          "code": 404,
          "message": "File not found"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const deleteBook = async (bookId, token) => {
      try {
        const response = await axios.delete(`https://e-library-api-production.up.railway.app/api/v1/files/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Book deleted successfully:', response.data.message);
        return response.data;
      } catch (error) {
        console.error('Failed to delete book:', error.response ? error.response.data : error.message);
        throw error;
      }
    };
    ```

---

## 📑 إدارة المجالات والأنواع (Categories & Types)

هذه الجداول منفصلة ويمكن إدارتها بالكامل (إضافة وتعديل وحذف).

### 1. المجالات (Categories)
*   **عرض الكل**: `GET /categories`
    *   **الوصف**: يجلب قائمة بجميع فئات الكتب المتاحة.
    *   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
        ```json
        {
          "status": "success",
          "code": 200,
          "message": "Categories fetched successfully",
          "data": [
            {
              "_id": "string",
              "name": "string",
              "description": "string",
              "coverUrl": "string",
              "createdAt": "date",
              "updatedAt": "date"
            }
          ]
        }
        ```
    *   **الاستجابة عند الخطأ (Error Response)**:
        *   **500 Internal Server Error**:
            ```json
            {
              "status": "error",
              "code": 500,
              "message": "Internal Server Error"
            }
            ```
    *   **مثال على الكود (Axios)**:
        ```javascript
        import axios from 'axios';

        const fetchCategories = async (token) => {
          try {
            const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/categories', {
              headers: {
                Authorization: `Bearer ${token}` // قد يتطلب توكن للمصادقة إذا كانت هذه النقطة محمية
              }
            });
            console.log('Categories:', response.data.data);
            return response.data.data;
          } catch (error) {
            console.error('Failed to fetch categories:', error.response ? error.response.data : error.message);
            throw error;
          }
        };
        ```
*   **إضافة**: `POST /categories`
    *   **الوصف**: يضيف فئة جديدة (Category) بصورة غلاف اختيارية. يتطلب صلاحيات `admin`.
    *   **البيانات المطلوبة (FormData)**:
        *   `name`: `string` (مطلوب) - اسم الفئة החדש.
        *   `description`: `string` (اختياري) - وصف للفئة.
        *   `cover`: `File` (اختياري) - صورة غلاف الفئة لرفعها على Cloudflare R2.
    *   **الاستجابة الناجحة (Success Response - Status: 201 Created)**:
        ```json
        {
          "status": "success",
          "code": 201,
          "message": "Category created successfully",
          "data": {
            "_id": "string",
            "name": "string",
            "description": "string",
            "coverUrl": "string",
            "createdAt": "date",
            "updatedAt": "date"
          }
        }
        ```
    *   **الاستجابة عند الخطأ (Error Response)**:
        *   **400 Bad Request - خطأ في التحقق**:
            ```json
            {
              "status": "fail",
              "code": 400,
              "message": "Validation Error",
              "errors": [
                {
                  "field": "name",
                  "message": "Category name is required"
                }
              ]
            }
            ```
        *   **401 Unauthorized - غير مصرح**:
            ```json
            {
              "status": "fail",
              "code": 401,
              "message": "Unauthorized"
            }
            ```
        *   **403 Forbidden - لا توجد صلاحيات إدارية**:
            ```json
            {
              "status": "fail",
              "code": 403,
              "message": "Forbidden: Admin access required"
            }
            ```
        *   **500 Internal Server Error**:
            ```json
            {
              "status": "error",
              "code": 500,
              "message": "Internal Server Error"
            }
            ```
    *   **مثال على الكود (Axios)**:
        ```javascript
        import axios from 'axios';

        const addCategory = async (name, description, coverImage, token) => {
          try {
            const formData = new FormData();
            formData.append('name', name);
            if (description) formData.append('description', description);
            if (coverImage) formData.append('cover', coverImage); // File Object

            const response = await axios.post('https://e-library-api-production.up.railway.app/api/v1/categories', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('Category added:', response.data.data);
            return response.data.data;
          } catch (error) {
            console.error('Failed to add category:', error.response ? error.response.data : error.message);
            throw error;
          }
        };
        ```
*   **تعديل**: `PATCH /categories/:id`
    *   **الوصف**: يقوم بتعديل بيانات فئة موجودة وصورة الغلاف الخاصة بها. يتطلب صلاحيات `admin`.
    *   **معاملات المسار (Path Parameters)**:
        *   `id`: `string` (مطلوب) - معرف الفئة المراد تعديلها.
    *   **البيانات المطلوبة (FormData)**:
        *   `name`: `string` (اختياري) - اسم الفئة الجديد.
        *   `description`: `string` (اختياري) - وصف الفئة الجديد.
        *   `cover`: `File` (اختياري) - ملف الصورة الجديد.
    *   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
        ```json
        {
          "status": "success",
          "code": 200,
          "message": "Category updated successfully",
          "data": {
            "_id": "string",
            "name": "string",
            "description": "string",
            "coverUrl": "string",
            "createdAt": "date",
            "updatedAt": "date"
          }
        }
        ```
    *   **الاستجابة عند الخطأ (Error Response)**:
        *   **400 Bad Request - خطأ في التحقق**:
            ```json
            {
              "status": "fail",
              "code": 400,
              "message": "Validation Error"
            }
            ```
        *   **401 Unauthorized - غير مصرح**:
            ```json
            {
              "status": "fail",
              "code": 401,
              "message": "Unauthorized"
            }
            ```
        *   **403 Forbidden - لا توجد صلاحيات إدارية**:
            ```json
            {
              "status": "fail",
              "code": 403,
              "message": "Forbidden: Admin access required"
            }
            ```
        *   **404 Not Found - الفئة غير موجودة**:
            ```json
            {
              "status": "fail",
              "code": 404,
              "message": "Category not found"
            }
            ```
        *   **500 Internal Server Error**:
            ```json
            {
              "status": "error",
              "code": 500,
              "message": "Internal Server Error"
            }
            ```
    *   **مثال على الكود (Axios)**:
        ```javascript
        import axios from 'axios';

        const updateCategory = async (categoryId, formData, token) => {
          try {
            const response = await axios.patch(`https://e-library-api-production.up.railway.app/api/v1/categories/${categoryId}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            });
            console.log('Category updated:', response.data.data);
            return response.data.data;
          } catch (error) {
            console.error('Failed to update category:', error.response ? error.response.data : error.message);
            throw error;
          }
        };
        ```
*   **حذف**: `DELETE /categories/:id`
    *   **الوصف**: يقوم بحذف فئة معينة. يتطلب صلاحيات `admin`.
    *   **معاملات المسار (Path Parameters)**:
        *   `id`: `string` (مطلوب) - معرف الفئة المراد حذفها.
    *   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
        ```json
        {
          "status": "success",
          "code": 200,
          "message": "Category deleted successfully",
          "data": null
        }
        ```
    *   **الاستجابة عند الخطأ (Error Response)**:
        *   **401 Unauthorized - غير مصرح**:
            ```json
            {
              "status": "fail",
              "code": 401,
              "message": "Unauthorized"
            }
            ```
        *   **403 Forbidden - لا توجد صلاحيات إدارية**:
            ```json
            {
              "status": "fail",
              "code": 403,
              "message": "Forbidden: Admin access required"
            }
            ```
        *   **404 Not Found - الفئة غير موجودة**:
            ```json
            {
              "status": "fail",
              "code": 404,
              "message": "Category not found"
            }
            ```
        *   **500 Internal Server Error**:
            ```json
            {
              "status": "error",
              "code": 500,
              "message": "Internal Server Error"
            }
            ```
    *   **مثال على الكود (Axios)**:
        ```javascript
        import axios from 'axios';

        const deleteCategory = async (categoryId, token) => {
          try {
            const response = await axios.delete(`https://e-library-api-production.up.railway.app/api/v1/categories/${categoryId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Category deleted:', response.data.message);
            return response.data;
          } catch (error) {
            console.error('Failed to delete category:', error.response ? error.response.data : error.message);
            throw error;
          }
        };
        ```

### 2. أنواع المنتجات (Product Types)
*   **عرض الكل**: `GET /product-types`
    *   **الوصف**: يجلب قائمة بجميع أنواع المنتجات المتاحة (مثل كتاب، تقرير، مجلة).
    *   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
        ```json
        {
          "status": "success",
          "code": 200,
          "message": "Product types fetched successfully",
          "data": [
            {
              "_id": "string",
              "name": "string",
              "description": "string",
              "createdAt": "date",
              "updatedAt": "date"
            }
          ]
        }
        ```
    *   **الاستجابة عند الخطأ (Error Response)**:
        *   **500 Internal Server Error**:
            ```json
            {
              "status": "error",
              "code": 500,
              "message": "Internal Server Error"
            }
            ```
    *   **مثال على الكود (Axios)**:
        ```javascript
        import axios from 'axios';

        const fetchProductTypes = async (token) => {
          try {
            const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/product-types', {
              headers: {
                Authorization: `Bearer ${token}` // قد يتطلب توكن للمصادقة إذا كانت هذه النقطة محمية
              }
            });
            console.log('Product Types:', response.data.data);
            return response.data.data;
          } catch (error) {
            console.error('Failed to fetch product types:', error.response ? error.response.data : error.message);
            throw error;
          }
        };
        ```
*   **إضافة**: `POST /product-types`
    *   **الوصف**: يضيف نوع منتج جديد. يتطلب صلاحيات `admin`.
    *   **البيانات المطلوبة (Request Body)**:
        ```json
        {
          "name": "string",        // مطلوب: اسم نوع المنتج الجديد
          "description": "string"  // اختياري: وصف لنوع المنتج
        }
        ```
    *   **الاستجابة الناجحة (Success Response - Status: 201 Created)**:
        ```json
        {
          "status": "success",
          "code": 201,
          "message": "Product type created successfully",
          "data": {
            "_id": "string",
            "name": "string",
            "description": "string",
            "createdAt": "date",
            "updatedAt": "date"
          }
        }
        ```
    *   **الاستجابة عند الخطأ (Error Response)**:
        *   **400 Bad Request - خطأ في التحقق**:
            ```json
            {
              "status": "fail",
              "code": 400,
              "message": "Validation Error",
              "errors": [
                {
                  "field": "name",
                  "message": "Product type name is required"
                }
              ]
            }
            ```
        *   **401 Unauthorized - غير مصرح**:
            ```json
            {
              "status": "fail",
              "code": 401,
              "message": "Unauthorized"
            }
            ```
        *   **403 Forbidden - لا توجد صلاحيات إدارية**:
            ```json
            {
              "status": "fail",
              "code": 403,
              "message": "Forbidden: Admin access required"
            }
            ```
        *   **500 Internal Server Error**:
            ```json
            {
              "status": "error",
              "code": 500,
              "message": "Internal Server Error"
            }
            ```
    *   **مثال على الكود (Axios)**:
        ```javascript
        import axios from 'axios';

        const addProductType = async (name, description, token) => {
          try {
            const response = await axios.post('https://e-library-api-production.up.railway.app/api/v1/product-types', {
              name,
              description
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Product type added:', response.data.data);
            return response.data.data;
          } catch (error) {
            console.error('Failed to add product type:', error.response ? error.response.data : error.message);
            throw error;
          }
        };
        ```
*   **تعديل**: `PATCH /product-types/:id`
    *   **الوصف**: يقوم بتعديل بيانات نوع منتج موجود. يتطلب صلاحيات `admin`.
    *   **معاملات المسار (Path Parameters)**:
        *   `id`: `string` (مطلوب) - معرف نوع المنتج المراد تعديله.
    *   **البيانات المطلوبة (Request Body)**:
        ```json
        {
          "name": "string",        // اختياري: اسم نوع المنتج الجديد
          "description": "string"  // اختياري: وصف نوع المنتج الجديد
        }
        ```
    *   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
        ```json
        {
          "status": "success",
          "code": 200,
          "message": "Product type updated successfully",
          "data": {
            "_id": "string",
            "name": "string",
            "description": "string",
            "createdAt": "date",
            "updatedAt": "date"
          }
        }
        ```
    *   **الاستجابة عند الخطأ (Error Response)**:
        *   **400 Bad Request - خطأ في التحقق**:
            ```json
            {
              "status": "fail",
              "code": 400,
              "message": "Validation Error"
            }
            ```
        *   **401 Unauthorized - غير مصرح**:
            ```json
            {
              "status": "fail",
              "code": 401,
              "message": "Unauthorized"
            }
            ```
        *   **403 Forbidden - لا توجد صلاحيات إدارية**:
            ```json
            {
              "status": "fail",
              "code": 403,
              "message": "Forbidden: Admin access required"
            }
            ```
        *   **404 Not Found - نوع المنتج غير موجود**:
            ```json
            {
              "status": "fail",
              "code": 404,
              "message": "Product type not found"
            }
            ```
        *   **500 Internal Server Error**:
            ```json
            {
              "status": "error",
              "code": 500,
              "message": "Internal Server Error"
            }
            ```
    *   **مثال على الكود (Axios)**:
        ```javascript
        import axios from 'axios';

        const updateProductType = async (productTypeId, updateData, token) => {
          try {
            const response = await axios.patch(`https://e-library-api-production.up.railway.app/api/v1/product-types/${productTypeId}`, updateData, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Product type updated:', response.data.data);
            return response.data.data;
          } catch (error) {
            console.error('Failed to update product type:', error.response ? error.response.data : error.message);
            throw error;
          }
        };
        ```
*   **حذف**: `DELETE /product-types/:id`
    *   **الوصف**: يقوم بحذف نوع منتج معين. يتطلب صلاحيات `admin`.
    *   **معاملات المسار (Path Parameters)**:
        *   `id`: `string` (مطلوب) - معرف نوع المنتج المراد حذفه.
    *   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
        ```json
        {
          "status": "success",
          "code": 200,
          "message": "Product type deleted successfully",
          "data": null
        }
        ```
    *   **الاستجابة عند الخطأ (Error Response)**:
        *   **401 Unauthorized - غير مصرح**:
            ```json
            {
              "status": "fail",
              "code": 401,
              "message": "Unauthorized"
            }
            ```
        *   **403 Forbidden - لا توجد صلاحيات إدارية**:
            ```json
            {
              "status": "fail",
              "code": 403,
              "message": "Forbidden: Admin access required"
            }
            ```
        *   **404 Not Found - نوع المنتج غير موجود**:
            ```json
            {
              "status": "fail",
              "code": 404,
              "message": "Product type not found"
            }
            ```
        *   **500 Internal Server Error**:
            ```json
            {
              "status": "error",
              "code": 500,
              "message": "Internal Server Error"
            }
            ```
    *   **مثال على الكود (Axios)**:
        ```javascript
        import axios from 'axios';

        const deleteProductType = async (productTypeId, token) => {
          try {
            const response = await axios.delete(`https://e-library-api-production.up.railway.app/api/v1/product-types/${productTypeId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Product type deleted:', response.data.message);
            return response.data;
          } catch (error) {
            console.error('Failed to delete product type:', error.response ? error.response.data : error.message);
            throw error;
          }
        };
        ```

---

## 💳 متابعة المدفوعات (Order Tracking)

يمكن للادمن متابعة الحالات القادمة من Stripe لمراقبة المبيعات.
*   **المسار**: `GET /payments`
*   **الوصف**: يجلب قائمة بجميع عمليات الدفع. يمكن فلترتها حسب الحالة ومزود الدفع. يتطلب صلاحيات `admin`.
*   **الفلترة (Query Params)**:
    *   `status`: `string` (اختياري) - فلترة حسب حالة الدفع (مثل `succeeded`, `failed`, `refunded`, `disputed`).
    *   `provider`: `string` (اختياري) - فلترة حسب مزود الدفع (مثل `stripe`, `paymob`).
    *   `page`: `number` (اختياري) - رقم الصفحة (الافتراضي 1).
    *   `limit`: `number` (اختياري) - عدد العناصر في الصفحة (الافتراضي 10).
*   **البيانات الراجعة**: تحتوي على بيانات المستخدم الذي اشترى، والكتاب، وحالة العملية في Stripe/Paymob.
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "Payments fetched successfully",
      "data": {
        "results": [
          {
            "_id": "string",
            "user": {
              "_id": "string",
              "name": "string",
              "email": "string"
            },
            "book": {
              "_id": "string",
              "title": "string",
              "coverUrl": "string"
            },
            "amount": "number",
            "currency": "string",
            "provider": "string",
            "status": "string",
            "transactionId": "string",
            "createdAt": "date",
            "updatedAt": "date"
          }
        ],
        "pagination": {
          "totalResults": "number",
          "totalPages": "number",
          "currentPage": "number",
          "limit": "number"
        }
      }
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const fetchPayments = async (token, params = {}) => {
      try {
        const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/payments', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            status: params.status,
            provider: params.provider,
            page: params.page || 1,
            limit: params.limit || 10
          }
        });
        console.log('Payments list:', response.data.data.results);
        console.log('Pagination info:', response.data.data.pagination);
        return response.data.data;
      } catch (error) {
        console.error('Failed to fetch payments:', error.response ? error.response.data : error.message);
        throw error;
      }
    };

    // مثال جلب قائمة النزاعات فقط (Disputes)
    // fetchPayments('your_admin_jwt_token', { status: 'disputed' });
    ```

### 2. ملخص الإحصائيات المالية (Financial Stats)
هذا المسار يعطيك الأرقام النهائية للأرباح والخسائر والنزاعات دون الحاجة لجلب كل العمليات.
*   **المسار**: `GET /payments/stats` (Admin Only)
*   **الوصف**: يجلب ملخصًا للإحصائيات المالية للمتجر، بما في ذلك إجمالي الأرباح، المستردات، والمبالغ المجمدة بسبب النزاعات. يتطلب صلاحيات `admin`.
*   **النتيجة**: كائن يحتوي على (اجمالي الأرباح، اجمالي المستردات، واجمالي المبالغ المجمدة بسبب نزاعات بنكية).
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "Financial stats fetched successfully",
      "data": {
        "succeeded": {
          "count": "number", // عدد العمليات الناجحة
          "amount": "number" // إجمالي المبلغ من العمليات الناجحة (بالسنت)
        },
        "refunded": {
          "count": "number", // عدد العمليات المستردة
          "amount": "number" // إجمالي المبلغ المسترد (بالسنت)
        },
        "disputed": {
          "count": "number", // عدد العمليات المتنازع عليها
          "amount": "number" // إجمالي المبلغ المتنازع عليه (بالسنت)
        },
        "totalRevenue": "number" // إجمالي الإيرادات الصافية (بالسنت)
      }
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const fetchFinancialStats = async (token) => {
      try {
        const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/payments/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Financial Stats:', response.data.data);
        console.log("إجمالي الأرباح السليمة:", response.data.data.succeeded.amount / 100);
        console.log("إجمالي المبالغ في نزاعات:", response.data.data.disputed.amount / 100);
        return response.data.data;
      } catch (error) {
        console.error('Failed to fetch financial stats:', error.response ? error.response.data : error.message);
        throw error;
      }
    };
    ```

---

## 📈 لوحة التحليلات المتقدمة (Full Admin Analytics)

يوفر هذا الجزء تقارير شاملة واحترافية لمتابعة أداء المتجر ونمو المستخدمين.

### 1. ملخص الـ Dashboard (KPIs)
*   **المسار**: `GET /admin/dashboard`
*   **الوصف**: يرجع الأرقام الحيوية فوراً (إجمالي الإيرادات، عدد المستخدمين، عدد الكتب، وأحدث 5 عمليات بيع). يتطلب صلاحيات `admin`.
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "Dashboard data fetched successfully",
      "data": {
        "totalRevenue": "number",    // إجمالي الإيرادات (بالسنت)
        "totalUsers": "number",      // إجمالي عدد المستخدمين
        "totalBooks": "number",      // إجمالي عدد الكتب
        "latestSales": [             // أحدث 5 عمليات بيع
          {
            "_id": "string",
            "bookTitle": "string",
            "userName": "string",
            "amount": "number",
            "currency": "string",
            "createdAt": "date"
          }
        ]
      }
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const fetchAdminDashboard = async (token) => {
      try {
        const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Admin Dashboard Data:', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Failed to fetch admin dashboard:', error.response ? error.response.data : error.message);
        throw error;
      }
    };
    ```

### 2. تحليلات المستخدمين (User Growth)
*   **المسار**: `GET /admin/stats/users`
*   **الوصف**: يحلل نمو المستخدمين (الإجمالي، المسجلين الجدد في آخر 30 يوم، عدد المشترين الفعليين، ونسبة التحويل Conversion Rate). يتطلب صلاحيات `admin`.
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "User stats fetched successfully",
      "data": {
        "totalUsers": "number",
        "newUsersLast30Days": "number",
        "payingUsers": "number",
        "conversionRate": "number" // نسبة مئوية
      }
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const fetchUserGrowthStats = async (token) => {
      try {
        const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/admin/stats/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('User Growth Stats:', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Failed to fetch user growth stats:', error.response ? error.response.data : error.message);
        throw error;
      }
    };
    ```

### 3. تقارير الإيرادات (Revenue Breakdown)
*   **المسار**: `GET /admin/revenue`
*   **الوصف**: يوفر تفاصيل مالية مفصلة (يومية لآخر شهر، وشهرية للسنة الحالية). يتطلب صلاحيات `admin`.
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "Revenue data fetched successfully",
      "data": {
        "dailyRevenueLast30Days": [
          {
            "date": "date",
            "totalRevenue": "number" // الإيرادات لليوم المحدد بالسنت
          }
        ],
        "monthlyRevenueCurrentYear": [
          {
            "month": "string", // اسم الشهر
            "totalRevenue": "number" // الإيرادات للشهر المحدد بالسنت
          }
        ]
      }
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const fetchRevenueReports = async (token) => {
      try {
        const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/admin/revenue', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Daily Revenue (Last 30 Days):', response.data.data.dailyRevenueLast30Days);
        console.log('Monthly Revenue (Current Year):', response.data.data.monthlyRevenueCurrentYear);
        return response.data.data;
      } catch (error) {
        console.error('Failed to fetch revenue reports:', error.response ? error.response.data : error.message);
        throw error;
      }
    };
    ```

### 4. المنتجات الأكثر مبيعاً (Top Sellers)
*   **المسار**: `GET /admin/stats/books`
*   **الوصف**: يرجع قائمة بأكثر 10 كتب تحقيقاً للمبيعات والإيرادات. يتطلب صلاحيات `admin`.
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "Top selling books fetched successfully",
      "data": [
        {
          "_id": "string",
          "title": "string",
          "coverUrl": "string",
          "totalSalesCount": "number", // إجمالي عدد مرات البيع
          "totalRevenue": "number"     // إجمالي الإيرادات من هذا الكتاب بالسنت
        }
      ]
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const fetchTopSellingBooks = async (token) => {
      try {
        const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/admin/stats/books', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Top Selling Books:', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Failed to fetch top selling books:', error.response ? error.response.data : error.message);
        throw error;
      }
    };
    ```

### 5. تقارير ذكاء الأعمال المتقدمة (Advanced BI Insights)
*   **المسار**: `GET /admin/stats/advanced`
*   **الوصف**: يوفر بيانات استراتيجية للإدارة وتشمل أداء الفئات، متوسط قيمة الطلب، الكتب الراكدة، وقنوات التسجيل. يتطلب صلاحيات `admin`.
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "code": 200,
      "message": "Advanced stats fetched successfully",
      "data": {
        "categoryPerformance": [ // أداء المبيعات حسب كل مجال
          {
            "category": "string",
            "totalRevenue": "number", // الإيرادات من هذه الفئة بالسنت
            "salesCount": "number"    // عدد المبيعات في هذه الفئة
          }
        ],
        "aov": { // متوسط قيمة الطلب
          "averageCents": "number",
          "averageFormatted": "string"
        },
        "stagnantBooks": [ // الكتب "الراكدة" التي لم تبع أبداً وتم رفعها منذ أكثر من 30 يوم
          {
            "_id": "string",
            "title": "string",
            "createdAt": "date"
          }
        ],
        "signupChannels": [ // تحليل طرق تسجيل المستخدمين (Google vs Local)
          {
            "channel": "string", // "google" أو "local"
            "count": "number"
          }
        ]
      }
    }
    ```
*   **الاستجابة عند الخطأ (Error Response)**:
    *   **401 Unauthorized - غير مصرح**:
        ```json
        {
          "status": "fail",
          "code": 401,
          "message": "Unauthorized"
        }
        ```
    *   **403 Forbidden - لا توجد صلاحيات إدارية**:
        ```json
        {
          "status": "fail",
          "code": 403,
          "message": "Forbidden: Admin access required"
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "status": "error",
          "code": 500,
          "message": "Internal Server Error"
        }
        ```
*   **مثال على الكود (Axios)**:
    ```javascript
    import axios from 'axios';

    const loadAdvancedStats = async (token) => {
      try {
        const response = await axios.get('https://e-library-api-production.up.railway.app/api/v1/admin/stats/advanced', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("أداء المجالات:", response.data.data.categoryPerformance);
        console.log("متوسط الإنفاق:", response.data.data.aov.averageCents / 100);
        console.log("الكتب الراكدة:", response.data.data.stagnantBooks);
        console.log("قنوات التسجيل:", response.data.data.signupChannels);
        return response.data.data;
      } catch (error) {
        console.error('Failed to load advanced stats:', error.response ? error.response.data : error.message);
        throw error;
      }
    };
    ```

---

## ⚙️ إعدادات الموقع الثابتة (Settings)

يتيح لك هذا القسم عرض وتعديل معلومات الموقع العامة التي تظهر للمستخدمين (رقم التواصل، روابط السوشيال ميديا، ونص الحقوق).

### 1. تعديل الإعدادات (Update Settings)
*   **المسار**: `PUT /settings`
*   **الوصف**: يقوم بتحديث الحقول المحددة في الإعدادات. ليس من الضروري إرسال كافة الحقول، فقط الحقول المراد تحديثها ستتغير. يتطلب صلاحيات `admin`.
*   **البيانات المطلوبة (Request Body)**:
    ```json
    {
      "footerText": "string",   // اختياري: نص الحقوق أسفل الموقع
      "phone": "string",        // اختياري: رقم الهاتف للتواصل
      "facebookLink": "string", // اختياري: رابط صفحة الفيسبوك (يجب أن يكون رابط صالح)
      "instagramLink": "string",// اختياري: رابط صفحة انستجرام (يجب أن يكون رابط صالح)
      "whatsappLink": "string"  // اختياري: رابط الواتساب (يجب أن يكون رابط صالح)
    }
    ```
*   **الاستجابة الناجحة (Success Response - Status: 200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Settings updated successfully",
      "data": {
        "footerText": "© 2026 E-Library. All rights reserved.",
        "phone": "+1234567890",
        "facebookLink": "https://facebook.com/elibrary",
        "instagramLink": "https://instagram.com/elibrary",
        "whatsappLink": "https://wa.me/1234567890",
        "createdAt": "date",
        "updatedAt": "date"
      }
    }
    ```
*   **الاستجابة عند الخطأ (Errors)**:
    * **422 Unprocessable Entity**: في حال إرسال روابط غير صالحة، أو نصوص أقصر/أطول من الحد المسموح.
    * **403 Forbidden**: في حال لم يكن المستخدم `admin`.

---

## 💡 نصائح هامة للادمن:
1.  **الأسعار**: تأكد دائماً أنك ترسل الأسعار بالسنت. (السعر المخزن هو ما يدفعه المستخدم في النهاية بالسنت).
2.  **الفئات**: قبل السماح للادمن بإضافة كتاب، قم دائماً بعمل `GET` للمجالات والأنواع لعرضها له في `Select Menu`.
3.  **الصلاحيات**: إذا لم يكن المستخدم يمتلك صلاحية `admin` في حسابه، سيمنعه السيرفر بحالة `403 Forbidden`.

بالتوفيق في بناء لوحة التحكم المتميزة! 🚀
