/* ==========================================================================
   AURA FASHION ADMIN & SELLER PORTAL LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  checkAdminSession();
  await loadAdminInventory();
});

function checkAdminSession() {
  if (typeof API === 'undefined') return;
  const admin = API.getStoredUser('admin');
  if (admin) {
    updateAdminUI(admin);
  }
}

function updateAdminUI(admin) {
  const storeTitle = document.querySelector('.admin-header h2');
  if (storeTitle && admin.storeName) {
    storeTitle.innerText = admin.storeName;
  }
  const storeBadge = document.querySelector('.admin-header .admin-badge');
  if (storeBadge && admin.storeId) {
    storeBadge.innerHTML = `<i class="ri-shield-flash-line"></i> AURA MERCHANT: ${admin.storeId}`;
  }
}

async function loadAdminInventory() {
  if (typeof API === 'undefined') return;
  try {
    const products = await API.getProducts();
    renderAdminInventoryList(products);
  } catch (e) {
    console.log('Failed to fetch inventory for admin');
  }
}

function renderAdminInventoryList(items) {
  const container = document.querySelector('#admin-tab-inventory .inventory-list');
  const countHeader = document.querySelector('#admin-tab-inventory .inventory-header h3');

  if (countHeader) countHeader.innerText = `Live Stock Inventory (${items.length})`;
  if (!container) return;

  container.innerHTML = items.map(p => `
    <div class="inv-item-card">
      <img src="${p.image}" alt="${p.title}" />
      <div class="inv-info">
        <strong>${p.title}</strong>
        <span class="inv-sku">SKU: ${p.sku || 'AUR-SKU'} • $${p.price}</span>
        <span class="status-pill ${p.stock > 10 ? 'in-stock' : 'low-stock'}">${p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}</span>
      </div>
      <div class="inv-stepper">
        <button onclick="adjustStock(this, -1)">-</button>
        <span>${p.stock}</span>
        <button onclick="adjustStock(this, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function openSellerLogin() {
  const screens = document.querySelectorAll('.app-screen');
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById('screen-seller-login')?.classList.add('active');
}

function switchAuthTab(role, tabType) {
  const loginBtn = document.getElementById('seller-tab-login-btn');
  const signupBtn = document.getElementById('seller-tab-signup-btn');
  const loginPane = document.getElementById('seller-pane-login');
  const signupPane = document.getElementById('seller-pane-signup');

  if (tabType === 'login') {
    loginBtn?.classList.add('active');
    signupBtn?.classList.remove('active');
    loginPane?.classList.add('active');
    signupPane?.classList.remove('active');
  } else {
    signupBtn?.classList.add('active');
    loginBtn?.classList.remove('active');
    signupPane?.classList.add('active');
    loginPane?.classList.remove('active');
  }
}

function previewUploadImage(event, previewImgId) {
  const file = event.target.files[0];
  if (!file) return;
  const preview = document.getElementById(previewImgId);
  if (preview) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

async function handleSellerSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('seller-id')?.value.trim();
  const password = document.getElementById('seller-password')?.value;

  try {
    const res = await API.loginAdmin({ email, password });
    showToast(`Merchant ${res.admin.storeName} Authenticated! 🚀`);
    updateAdminUI(res.admin);
    setTimeout(() => {
      const screens = document.querySelectorAll('.app-screen');
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById('screen-admin-dashboard')?.classList.add('active');
    }, 600);
  } catch (err) {
    showToast(`Merchant Auth Failed: ${err.message}`);
  }
}

async function handleSellerSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('seller-signup-name')?.value.trim();
  const storeName = document.getElementById('seller-signup-store')?.value.trim();
  const email = document.getElementById('seller-signup-email')?.value.trim();
  const password = document.getElementById('seller-signup-password')?.value;
  const phone = document.getElementById('seller-signup-phone')?.value.trim();
  const logoFileInput = document.getElementById('seller-signup-avatar-file');

  let avatarUrl = '';
  if (logoFileInput && logoFileInput.files[0]) {
    try {
      showToast('Uploading store logo...');
      const uploadRes = await API.uploadFile(logoFileInput.files[0]);
      avatarUrl = uploadRes.fullUrl || uploadRes.url;
    } catch (err) {
      console.warn('Logo upload failed');
    }
  }

  try {
    const res = await API.signupAdmin({ name, storeName, email, password, phone, avatarUrl });
    showToast(`Merchant Registered! Store ID: ${res.admin.storeId}`);
    updateAdminUI(res.admin);
    setTimeout(() => {
      const screens = document.querySelectorAll('.app-screen');
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById('screen-admin-dashboard')?.classList.add('active');
    }, 600);
  } catch (err) {
    showToast(`Registration Failed: ${err.message}`);
  }
}

function openAddProductModal() {
  const modal = document.getElementById('add-product-modal');
  if (modal) modal.classList.add('active');
}

function closeAddProductModal() {
  const modal = document.getElementById('add-product-modal');
  if (modal) modal.classList.remove('active');
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const title = document.getElementById('prod-title')?.value.trim();
  const brand = document.getElementById('prod-brand')?.value.trim();
  const category = document.getElementById('prod-category')?.value;
  const price = document.getElementById('prod-price')?.value;
  const stock = document.getElementById('prod-stock')?.value;
  const fileInput = document.getElementById('prod-image-file');

  let image = '';
  if (fileInput && fileInput.files[0]) {
    try {
      showToast('Uploading product image file...');
      const uploadRes = await API.uploadFile(fileInput.files[0]);
      image = uploadRes.fullUrl || uploadRes.url;
    } catch (err) {
      showToast('Image upload failed, using default image.');
    }
  }

  try {
    const res = await API.addProduct({ title, brand, category, price, stock, image });
    showToast(`Apparel Item "${title}" Published! ✨`);
    closeAddProductModal();
    document.getElementById('add-product-form')?.reset();
    const preview = document.getElementById('prod-image-preview');
    if (preview) preview.style.display = 'none';

    await loadAdminInventory();
  } catch (err) {
    showToast(`Failed to add product: ${err.message}`);
  }
}

function switchAdminTab(tabName, btn) {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const panes = document.querySelectorAll('.admin-tab-pane');
  panes.forEach(p => p.classList.remove('active'));

  const targetPane = document.getElementById(`admin-tab-${tabName}`);
  if (targetPane) targetPane.classList.add('active');
}

function adjustStock(btn, delta) {
  const stepperSpan = btn.parentElement.querySelector('span');
  if (!stepperSpan) return;
  let currentVal = parseInt(stepperSpan.innerText, 10) || 0;
  currentVal = Math.max(0, currentVal + delta);
  stepperSpan.innerText = currentVal;
  showToast(`Stock count updated to ${currentVal} units`);
}

function filterAdminOrders(type, btn) {
  const filters = document.querySelectorAll('.a-filter');
  filters.forEach(f => f.classList.remove('active'));
  btn.classList.add('active');
  showToast(`Filtering Orders: ${type.toUpperCase()}`);
}

function updateOrderStatus(btn) {
  btn.innerText = 'Dispatched ✓';
  btn.style.background = '#10B981';
  btn.disabled = true;
  showToast('Order status updated to Dispatched');
}

function togglePasswordVisibility(inputId, iconElem) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    iconElem.className = 'ri-eye-line toggle-pass-icon';
  } else {
    input.type = 'password';
    iconElem.className = 'ri-eye-off-line toggle-pass-icon';
  }
}

function handleLogout(role = 'admin') {
  API.clearToken(role);
  openSellerLogin();
  showToast('Signed out from Seller Portal');
}

function openBarcodeModal() {
  const modal = document.getElementById('barcode-modal');
  if (modal) modal.classList.add('active');
}

function closeBarcodeModal() {
  const modal = document.getElementById('barcode-modal');
  if (modal) modal.classList.remove('active');
}

function simulateBarcodeScan() {
  const mockSku = 'AUR-BLZ-' + Math.floor(10 + Math.random() * 90);
  closeBarcodeModal();
  showToast(`Scanned Barcode: ${mockSku} (Stock Sync Complete)`);
}

function printShippingLabel() {
  showToast('Printing Express Courier Shipping Label...');
}

function exportPDFReport() {
  showToast('Generating Sales & Revenue PDF Report...');
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}


