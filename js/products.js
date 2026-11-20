const STORAGE_KEY = "misk-perfumes-products-v1";
if (typeof products === 'undefined') {
  var products = [];
}
let activeFilter = "الكل";

// 1. جلب المنتجات من الـ Backend مباشرة عند تحميل الصفحة
async function loadProductsFromBackend() {
  try {
    const response = await fetch('backend/api/get_products.php');
    const data = await response.json();
    if (data.status === "success") {
      products = data.products || [];
      renderProducts();
    } else {
      console.error("فشل جلب المنتجات:", data.message);
    }
  } catch (error) {
    console.error("خطأ في الاتصال بالخادم لجلب المنتجات:", error);
  }
}

// دالة حفظ وهمية أو للاستخدام المحلي المؤقت (الحفظ يتم عبر الـ backend)
function saveProducts() {
  // البيانات تُحفظ مباشرة في قاعدة بيانات MySQL عبر لوحة التحكم
}

function visibleProducts() {
  let list = products.filter(
    (p) => activeFilter === "الكل" || p.category === activeFilter,
  );
  const sort = document.getElementById("sortSelect")?.value;
  if (sort === "price-low")
    list.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === "price-high")
    list.sort((a, b) => Number(b.price) - Number(a.price));
  return list;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const list = visibleProducts();
  
  grid.innerHTML = list.length
    ? list
        .map(
          (p, i) => `<article class="product-card" style="--i:${i}">
    <div class="product-image-wrap"><img src="${escapeHtml(p.image ? 'uploads/' + p.image : "assets/perfume-masculine.jpg")}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='assets/perfume-masculine.jpg'" />${p.is_featured == 1 ? '<span class="product-tag sale">عرض مميز</span>' : `<span class="product-tag">${escapeHtml(p.category)}</span>`}<button class="favorite-button" data-favorite="${escapeHtml(p.id)}" aria-label="إضافة إلى المفضلة">♡</button></div>
    <div class="product-card-copy"><div class="product-meta"><span>${escapeHtml(p.category)} · مِسك</span><span>✦ ✦ ✦ ✦ ✦</span></div><h3>${escapeHtml(p.name)}</h3><p class="product-desc">${escapeHtml(p.description)}</p><div class="product-card-bottom"><span class="product-price">${money(p.price)}</span><div class="card-actions"><button class="details-button" data-details="${escapeHtml(p.id)}">تفاصيل أكثر</button><a class="add-button order-now-button" href="${whatsappUrl(p, 1)}" target="_blank" rel="noopener noreferrer">اطلب الآن ↗️</a></div></div></div></article>`,
        )
        .join("")
    : '<div class="empty-products">لا توجد منتجات في هذا القسم حالياً.</div>';

  // ربط أحداث أزرار التفاصيل بعد تحديث الـ HTML
  grid.querySelectorAll("[data-details]").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = products.find(p => String(p.id) === String(btn.dataset.details));
      if (product) showDetails(product);
    });
  });

  document
    .querySelectorAll(".filter-tab")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.filter === activeFilter),
    );
  const allTab = document.querySelector('.filter-tab[data-filter="الكل"] span');
  if (allTab) allTab.textContent = String(products.length).padStart(2, "0");
}

function setFilter(filter) {
  activeFilter = filter;
  renderProducts();
}

function showDetails(product) {
  const modalImg = document.getElementById("modalImage");
  if (modalImg) {
    modalImg.src = product.image ? 'uploads/' + product.image : "assets/perfume-masculine.jpg";
    modalImg.alt = product.name;
  }
  
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("modalCategory", `${product.category} · مِسك للعطور`);
  setTxt("modalName", product.name);
  
  const priceEl = document.getElementById("modalPrice");
  if (priceEl) priceEl.innerHTML = money(product.price);

  setTxt("modalDescription", product.description);
  setTxt("modalExtra", product.details || product.extra || product.description);

  const quantityInput = document.getElementById("modalQuantity");
  const orderLink = document.getElementById("modalWhatsApp");
  
  if (quantityInput && orderLink) {
    quantityInput.value = "1";
    const updateOrderLink = () => {
      const quantity = Math.min(
        99,
        Math.max(1, Number(quantityInput.value) || 1),
      );
      quantityInput.value = String(quantity);
      orderLink.href = whatsappUrl(product, quantity);
    };
    quantityInput.oninput = updateOrderLink;
    updateOrderLink();
  }
  
  openModal("productModal");
}

// استدعاء جلب المنتجات عند تحميل الصفحة لأول مرة
document.addEventListener("DOMContentLoaded", () => {
  loadProductsFromBackend();
});