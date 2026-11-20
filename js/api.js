const WHATSAPP_NUMBER = "306993027531";

function whatsappUrl(product, quantity = 1) {
  const message = product
    ? [
        "مرحباً، أود طلب المنتج التالي:",
        `الاسم: ${product.name}`,
        `القسم: ${product.category}`,
        `السعر للوحدة: ${product.price} $`,
        `الكمية: ${quantity}`,
        `الإجمالي: ${(Number(product.price) * Number(quantity)).toFixed(Number(product.price) % 1 || Number(quantity) % 1 ? 2 : 0)} $`,
        `الوصف: ${product.description}`,
        `تفاصيل المنتج: ${product.details || product.description}`,
        `العرض: ${product.is_featured == 1 ? "نعم، عرض مميز" : "لا"}`,
      ].join("\n")
    : "مرحباً، أود الاستفسار عن عطور مسك.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذرت قراءة الصورة بعد ضغطها."));
    reader.readAsDataURL(blob);
  });
}

async function compressImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("الملف المختار ليس صورة.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("حجم الصورة الأصلية كبير جداً؛ اختر صورة أقل من 20 MB.");
  }
  if (typeof createImageBitmap !== "function") {
    throw new Error("متصفحك لا يدعم ضغط الصور تلقائياً؛ جرّب متصفحاً أحدث.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 50_000_000) {
      throw new Error("أبعاد الصورة كبيرة جداً؛ اختر صورة بأبعاد أقل.");
    }

    const maxDimension = 1600;
    let scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const targetBytes = 450 * 1024;

    for (let resizeAttempt = 0; resizeAttempt < 7; resizeAttempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("تعذرت معالجة الصورة في هذا المتصفح.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.9, 0.84, 0.78, 0.7, 0.62]) {
        let blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (!blob) continue;

        if (blob.type !== "image/webp") {
          blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", quality),
          );
        }
        if (blob && blob.size <= targetBytes) return await blobToDataURL(blob);
      }
      scale *= 0.82;
    }
    throw new Error("تعذر ضغط الصورة إلى الحجم المطلوب؛ جرّب صورة أخرى.");
  } finally {
    bitmap.close?.();
  }
}

// ==========================================
// دوال الربط مع الـ Backend APIs (محدثة وآمنة)
// ==========================================

// 1. تسجيل الدخول
async function adminLogin(username, password) {
  try {
    const response = await fetch('backend/api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      console.error("استجابة غير صالحة من السيرفر:", text);
      return { status: "error", message: "خطأ في استجابة الخادم (JSON غير صالح)" };
    }
  } catch (error) {
    console.error("خطأ في الاتصال:", error);
    return { status: "error", message: "فشل الاتصال بالخادم" };
  }
}

// 2. جلب المنتجات والإحصائيات للوحة التحكم
async function fetchDashboardData() {
  try {
    const response = await fetch('backend/api/get_products.php');
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      console.error("استجابة غير صالحة من السيرفر:", text);
      return { status: "error", products: [], statistics: {} };
    }
  } catch (error) {
    console.error("خطأ في جلب البيانات:", error);
    return { status: "error", products: [], statistics: {} };
  }
}

// 3. إضافة منتج جديد (مع إرسال الصورة والبيانات عبر FormData)
async function addNewProduct(formData) {
  try {
    const response = await fetch('backend/api/add_product.php', {
      method: 'POST',
      body: formData 
    });
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      console.error("استجابة غير صالحة من السيرفر:", text);
      return { status: "error", message: "خطأ في استجابة الخادم أثناء الحفظ" };
    }
  } catch (error) {
    console.error("خطأ في إضافة المنتج:", error);
    return { status: "error", message: "حدث خطأ أثناء الإرسال" };
  }
}

// تعديل منتج موجود مع إبقاء الصورة القديمة إذا لم يتم اختيار صورة جديدة.
async function updateProduct(productId, formData) {
  try {
    formData.set('id', productId);
    const response = await fetch('backend/api/update_product.php', {
      method: 'POST',
      body: formData
    });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("استجابة غير صالحة من السيرفر:", text);
      return { status: "error", message: "خطأ في استجابة الخادم أثناء التعديل" };
    }
  } catch (error) {
    console.error("خطأ في تعديل المنتج:", error);
    return { status: "error", message: "حدث خطأ أثناء تعديل المنتج" };
  }
}

// 4. حذف منتج محدد عبر الـ ID
async function deleteProduct(productId) {
  try {
    const response = await fetch('backend/api/delete_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId })
    });
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      console.error("استجابة غير صالحة من السيرفر:", text);
      return { status: "error", message: "خطأ في استجابة الخادم أثناء الحذف" };
    }
  } catch (error) {
    console.error("خطأ في الحذف:", error);
    return { status: "error", message: "فشل الاتصال لحذف المنتج" };
  }
}
