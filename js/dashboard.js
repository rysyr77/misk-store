const ADMIN_SESSION_KEY = "misk-store-admin-logged-in-v1";
let editingProductId = null;
let uploadData = "";
// متغير عام مشترك مع products.js. استخدام let هنا كان يسبب SyntaxError
// عند إعادة تعريف المتغير في products.js ويمنع تحميل منتجات الواجهة.
var products = []; // المنتجات التي سيتم جلبها من قاعدة البيانات

// 1. جلب المنتجات من الـ Backend وتحديث العرض
async function loadProductsAndDashboard(pane = "overview") {
  const data = await fetchDashboardData();
  if (data.status === "success") {
    products = data.products || [];
    renderDashboard(pane);
  } else {
    showToast("فشل جلب بيانات المنتجات من الخادم");
  }
}

function adminTable() {
  if (!products.length)
    return '<div class="empty-products">لا توجد منتجات. أضف منتجاً جديداً للبدء.</div>';
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>المنتج</th><th>القسم</th><th>السعر</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${products.map((p) => `<tr><td><div class="admin-product"><img src="${escapeHtml(p.image ? 'uploads/' + p.image : 'assets/perfume-masculine.jpg')}" onerror="this.src='assets/perfume-masculine.jpg'" alt="" /><span>${escapeHtml(p.name)}</span></div></td><td>${escapeHtml(p.category)}</td><td>$${escapeHtml(p.price)}</td><td>${p.is_featured == 1 ? "عرض مميز" : "عادي"}</td><td><button class="table-action" data-edit="${escapeHtml(p.id)}">تعديل</button><button class="table-action delete" data-delete="${escapeHtml(p.id)}">حذف</button></td></tr>`).join("")}</tbody></table></div>`;
}

function renderDashboard(pane = "overview") {
  const content = document.getElementById("dashboardContent");
  if (!content) return;
  const title =
    {
      overview: "نظرة عامة",
      manage: "إدارة المنتجات",
      add: editingProductId ? "تعديل المنتج" : "إضافة منتج جديد",
      edit: "تعديل المنتج",
    }[pane] || "نظرة عامة";
  
  const titleEl = document.getElementById("dashboardTitle");
  if (titleEl) titleEl.textContent = title;

  document
    .querySelectorAll(".dash-nav")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        b.dataset.pane === pane ||
          (pane === "edit" && b.dataset.pane === "manage"),
      ),
    );

  const featuredCount = products.filter((p) => p.is_featured == 1).length;

  if (pane === "overview") {
    content.innerHTML = `<div class="stats-grid"><div class="stat-card"><small>إجمالي المنتجات</small><strong>${products.length}</strong><span>منتج في المتجر</span></div><div class="stat-card"><small>منتجات عليها عرض</small><strong>${featuredCount}</strong><span>تظهر بوسم عرض مميز</span></div><div class="stat-card"><small>أقسام المتجر</small><strong>03</strong><span>نسائي · رجالي · بوكس</span></div></div><div class="dash-section-title"><h3>أحدث المنتجات</h3><button class="dash-action" data-open-pane="manage">عرض الكل ←</button></div>${adminTable()}`;
  } else if (pane === "manage") {
    content.innerHTML = `<div class="dash-section-title" style="margin-top:0"><h3>قائمة منتجات المتجر (${products.length})</h3><button class="dash-action" data-open-pane="add">＋ إضافة منتج</button></div>${adminTable()}`;
  } else if (pane === "add" || pane === "edit") {
    const product = editingProductId
      ? products.find((p) => String(p.id) === String(editingProductId))
      : null;
    uploadData = product?.image || "";
    content.innerHTML = `<form class="product-form" id="productForm"><div class="form-grid"><label>اسم المنتج<input name="name" required maxlength="60" value="${escapeHtml(product?.name || "")}" placeholder="مثال: عطر ميس ديور" /></label><label>السعر<input name="price" type="number" min="0" step="0.01" required value="${escapeHtml(product?.price ?? "")}" placeholder="45" /></label></div><label>القسم<select name="category"><option ${product?.category === "نسائي" ? "selected" : ""}>نسائي</option><option ${product?.category === "رجالي" ? "selected" : ""}>رجالي</option><option ${product?.category === "بوكس" ? "selected" : ""}>بوكس</option></select></label><label>رفع صورة من جهازك<input id="imageFile" type="file" accept="image/*" name="image" /></label><img class="upload-preview" id="uploadPreview" src="${escapeHtml(product?.image ? 'uploads/' + product.image : '')}" style="${product?.image ? "display:block" : ""}" alt="معاينة الصورة" /><label>الوصف<input name="description" required value="${escapeHtml(product?.description || "")}" placeholder="وصف قصير للمنتج" /></label><label>تفاصيل أكثر<textarea name="details" placeholder="الموسم المناسب، النفحات، الثبات...">${escapeHtml(product?.details || product?.extra || "")}</textarea></label><label class="form-check"><input type="checkbox" name="is_featured" ${product?.is_featured == 1 ? "checked" : ""} /> هذا المنتج عرض مميز</label><div class="form-buttons"><button class="button button-gold">${product ? "حفظ التعديلات" : "حفظ المنتج"} <span>✓</span></button><button type="button" class="button button-light" data-open-pane="manage">إلغاء</button></div></form>`;
  }

  content.querySelectorAll("[data-open-pane]").forEach((btn) =>
    btn.addEventListener("click", () => {
      editingProductId = null;
      loadProductsAndDashboard(btn.dataset.openPane);
    }),
  );

  content.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => {
      editingProductId = btn.dataset.edit;
      renderDashboard("edit");
    }),
  );

  content.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const p = products.find((x) => String(x.id) === String(btn.dataset.delete));
      if (p && confirm(`حذف المنتج «${p.name}» من قاعدة البيانات؟`)) {
        const res = await deleteProduct(p.id);
        if (res.status === "success") {
          showToast("تم حذف المنتج بنجاح من قاعدة البيانات");
          loadProductsAndDashboard("manage");
        } else {
          showToast(res.message || "فشل حذف المنتج");
        }
      }
    }),
  );

  const form = document.getElementById("productForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      
      const fileInput = document.getElementById("imageFile");
      if (fileInput && fileInput.files[0]) {
        fd.set('image', fileInput.files[0]);
      }

      showToast("جارٍ حفظ المنتج في قاعدة البيانات...");
      const res = editingProductId
        ? await updateProduct(editingProductId, fd)
        : await addNewProduct(fd);

      if (res.status === "success") {
        showToast("تم حفظ المنتج بنجاح");
        editingProductId = null;
        loadProductsAndDashboard("manage");
      } else {
        showToast(res.message || "حدث خطأ أثناء الحفظ");
      }
    });

    document.getElementById("imageFile")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const input = e.target;
      input.disabled = true;
      showToast("جارٍ ضغط الصورة...");
      try {
        const compressedDataUrl = await compressImage(file);
        const preview = document.getElementById("uploadPreview");
        preview.src = compressedDataUrl;
        preview.style.display = "block";
        showToast("تم ضغط الصورة وتجهيزها للرفع");
      } catch (error) {
        console.error(error);
        showToast(error.message || "تعذرت معالجة الصورة.");
        input.value = "";
      } finally {
        input.disabled = false;
      }
    });
  }
}

async function openDashboard() {
  editingProductId = null;
  await loadProductsAndDashboard("overview");
  openModal("dashboardModal");
}

// 2. ربط نافذة تسجيل الدخول والنقر المزدوج على الشعار
const siteBrand = document.getElementById("siteBrand");
if (siteBrand) {
  siteBrand.addEventListener("dblclick", (event) => {
    event.preventDefault();
    if (isAdminLoggedIn()) {
      openDashboard();
      return;
    }
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.reset();
    
    const loginError = document.getElementById("loginError");
    if (loginError) loginError.textContent = "";
    
    openModal("adminLoginModal");
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById("loginUser");
    const passwordInput = document.getElementById("loginPass");
    const loginError = document.getElementById("loginError");

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const result = await adminLogin(username, password);

    if (result && result.status === "success") {
      setAdminLoggedIn(true);
      closeModal("adminLoginModal");
      openDashboard();
    } else {
      if (loginError) {
        loginError.textContent = result.message || "اسم المستخدم أو كلمة المرور غير صحيحة.";
      }
    }
  });
}

document.querySelectorAll(".dash-nav").forEach((btn) =>
  btn.addEventListener("click", () => {
    editingProductId = null;
    loadProductsAndDashboard(btn.dataset.pane);
  }),
);

const adminLogoutBtn = document.getElementById("adminLogout");
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", () => {
    setAdminLoggedIn(false);
    closeModal("dashboardModal");
    showToast("تم تسجيل الخروج من لوحة الإدارة");
  });
}

function isAdminLoggedIn() {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function setAdminLoggedIn(isLoggedIn) {
  try {
    if (isLoggedIn) localStorage.setItem(ADMIN_SESSION_KEY, "true");
    else localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (error) {
    console.error("تعذر حفظ حالة تسجيل الدخول.", error);
  }
}

// استعادة لوحة الإدارة تلقائياً إذا كان المدير مسجلاً دخوله
if (isAdminLoggedIn()) {
  loadProductsAndDashboard("overview");
}
