/* ==========================================================================
   AURA FASHION MASTER UNIFIED APPLICATION LOGIC
   ========================================================================== */

const PRODUCTS = [
  {
    id: 'p1',
    sku: 'AUR-BLZ-01',
    brand: 'AURA STUDIO',
    title: 'AURA Oversized Silk-Linen Co-ord Blazer',
    category: 'Women',
    price: 2999,
    originalPrice: 4999,
    rating: 4.8,
    reviews: 142,
    discount: '40% OFF',
    stock: 42,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
    tags: ['blazer', 'linen', 'co-ords', 'women']
  },
  {
    id: 'p2',
    sku: 'AUR-TEE-09',
    brand: 'MONOCHROME',
    title: 'Heavyweight Drop-Shoulder Tee',
    category: 'Men',
    price: 1299,
    originalPrice: 1999,
    rating: 4.9,
    reviews: 88,
    discount: '35% OFF',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
    tags: ['tee', 'oversized', 'men', 'streetwear']
  },
  {
    id: 'p3',
    sku: 'AUR-TR-12',
    brand: 'KINETIC',
    title: 'Pleated Tailored Wide Trousers',
    category: 'Men',
    price: 2199,
    originalPrice: 3299,
    rating: 4.7,
    reviews: 54,
    discount: '33% OFF',
    stock: 28,
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600',
    tags: ['pants', 'trousers', 'pleated', 'formal']
  },
  {
    id: 'p4',
    sku: 'AUR-ETH-04',
    brand: 'ETHNIC CRAFT',
    title: 'Handwoven Chanderi Kurta Set',
    category: 'Ethnic',
    price: 2499,
    originalPrice: 3999,
    rating: 4.9,
    reviews: 112,
    discount: '38% OFF',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
    tags: ['ethnic', 'kurta', 'festive']
  },
  {
    id: 'p5',
    sku: 'AUR-JKT-07',
    brand: 'AURA URBAN',
    title: 'Minimalist Utility Bomber Jacket',
    category: 'Streetwear',
    price: 3499,
    originalPrice: 4999,
    rating: 4.6,
    reviews: 67,
    discount: '30% OFF',
    stock: 14,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    tags: ['jacket', 'bomber', 'streetwear', 'men']
  },
  {
    id: 'p6',
    sku: 'AUR-DRS-03',
    brand: 'LUMEN',
    title: 'Draped Asymmetric Satin Midi Dress',
    category: 'Women',
    price: 2899,
    originalPrice: 4299,
    rating: 4.8,
    reviews: 95,
    discount: '32% OFF',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600',
    tags: ['dress', 'satin', 'women', 'party']
  }
];

let cart = [
  { id: 'p1', title: 'AURA Oversized Silk Blazer', size: 'S', price: 2999, qty: 1, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300' },
  { id: 'p3', title: 'Pleated Tailored Trousers', size: 'M', price: 2199, qty: 1, image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300' }
];

let currentProducts = PRODUCTS;

document.addEventListener('DOMContentLoaded', async () => {
  await loadCatalogProducts();
  checkAuthSession();
  renderCart();
  startCountdownTimer();
});

// Load products from API server with fallback to local PRODUCTS array
async function loadCatalogProducts() {
  if (typeof API !== 'undefined') {
    try {
      const apiProds = await API.getProducts();
      if (apiProds && apiProds.length > 0) {
        currentProducts = apiProds;
      }
    } catch (e) {
      console.log('Using local catalog products fallback');
    }
  }
  renderHomeProducts(currentProducts);
  renderSearchProducts(currentProducts);
  renderAdminInventoryList(currentProducts);
}

// Restore user or seller auth session on startup
function checkAuthSession() {
  if (typeof API === 'undefined') return;

  const user = API.getStoredUser('user');
  if (user) {
    updateCustomerUI(user);
  }

  const admin = API.getStoredUser('admin');
  if (admin) {
    updateAdminUI(admin);
  }
}

// Update UI elements with logged-in user profile
function updateCustomerUI(user) {
  const greetingName = document.querySelector('.user-greeting .greeting-title');
  if (greetingName && user.name) {
    greetingName.innerText = user.name;
  }

  const profName = document.getElementById('user-profile-name');
  const profEmail = document.getElementById('user-profile-email');
  const profAvatar = document.getElementById('user-profile-avatar');

  if (profName) profName.innerText = user.name;
  if (profEmail) profEmail.innerText = user.email;
  if (profAvatar && user.avatarUrl) profAvatar.src = user.avatarUrl;
}

// Update UI elements with logged-in admin store profile
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

// Mode Switcher (Consumer / Admin)
function switchUserMode(mode) {
  const consumerPane = document.getElementById('consumer-view');
  const adminPane = document.getElementById('admin-view');
  const bottomNav = document.getElementById('consumer-bottom-nav');

  if (mode === 'admin') {
    if (consumerPane) consumerPane.classList.remove('active');
    if (adminPane) adminPane.classList.add('active');
    if (bottomNav) bottomNav.style.display = 'none';
    showToast('Switched to Seller Portal');
  } else {
    if (adminPane) adminPane.classList.remove('active');
    if (consumerPane) consumerPane.classList.add('active');
    if (bottomNav) bottomNav.style.display = 'flex';
    navigateToScreen('screen-home');
    showToast('Switched to Customer Store');
  }
}

// Screen Navigation
function navigateToScreen(screenId) {
  const screens = document.querySelectorAll('#consumer-view .app-screen, #admin-view .app-screen');
  screens.forEach(s => s.classList.remove('active'));

  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => btn.classList.remove('active'));

  if (screenId === 'screen-home') navBtns[0]?.classList.add('active');
  if (screenId === 'screen-search') navBtns[1]?.classList.add('active');
  if (screenId === 'screen-cart') navBtns[2]?.classList.add('active');
  if (screenId === 'screen-profile') navBtns[3]?.classList.add('active');
}

// Open Login & Auth Screens
function openConsumerLogin() {
  switchUserMode('consumer');
  const screens = document.querySelectorAll('#consumer-view .app-screen');
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById('screen-consumer-login')?.classList.add('active');
}

function openSellerLogin() {
  switchUserMode('admin');
  const screens = document.querySelectorAll('#admin-view .app-screen');
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById('screen-seller-login')?.classList.add('active');
}


// Auth Tab Switching ('login' vs 'signup')
function switchAuthTab(role, tabType) {
  const isUser = role === 'user';
  const loginBtn = document.getElementById(isUser ? 'user-tab-login-btn' : 'seller-tab-login-btn');
  const signupBtn = document.getElementById(isUser ? 'user-tab-signup-btn' : 'seller-tab-signup-btn');
  const loginPane = document.getElementById(isUser ? 'user-pane-login' : 'seller-pane-login');
  const signupPane = document.getElementById(isUser ? 'user-pane-signup' : 'seller-pane-signup');

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

// Live Image Upload Preview
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

// Real Customer Login Handler
async function handleConsumerSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('consumer-email')?.value.trim();
  const password = document.getElementById('consumer-password')?.value;

  try {
    const res = await API.loginUser({ email, password });
    showToast(`Welcome back, ${res.user.name}! 🎉`);
    updateCustomerUI(res.user);
    setTimeout(() => navigateToScreen('screen-home'), 600);
  } catch (err) {
    showToast(`Sign In Failed: ${err.message}`);
  }
}

// Real Customer Sign Up Handler
async function handleConsumerSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('user-signup-name')?.value.trim();
  const email = document.getElementById('user-signup-email')?.value.trim();
  const password = document.getElementById('user-signup-password')?.value;
  const phone = document.getElementById('user-signup-phone')?.value.trim();
  const avatarFileInput = document.getElementById('user-signup-avatar-file');

  let avatarUrl = '';
  if (avatarFileInput && avatarFileInput.files[0]) {
    try {
      showToast('Uploading profile photo...');
      const uploadRes = await API.uploadFile(avatarFileInput.files[0]);
      avatarUrl = uploadRes.fullUrl || uploadRes.url;
    } catch (err) {
      console.warn('Avatar upload failed, continuing with default profile avatar.');
    }
  }

  try {
    const res = await API.signupUser({ name, email, password, phone, avatarUrl });
    showToast(`Account Created! Welcome to AURA, ${res.user.name}! ✨`);
    updateCustomerUI(res.user);
    setTimeout(() => navigateToScreen('screen-home'), 600);
  } catch (err) {
    showToast(`Sign Up Failed: ${err.message}`);
  }
}

// Real Seller Login Handler
async function handleSellerSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('seller-id')?.value.trim();
  const password = document.getElementById('seller-password')?.value;

  try {
    const res = await API.loginAdmin({ email, password });
    showToast(`Merchant ${res.admin.storeName} Authenticated! 🚀`);
    updateAdminUI(res.admin);
    setTimeout(() => {
      const screens = document.querySelectorAll('#admin-view .app-screen');
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById('screen-admin-dashboard')?.classList.add('active');
    }, 600);
  } catch (err) {
    showToast(`Merchant Auth Failed: ${err.message}`);
  }
}

// Real Seller Sign Up Handler
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
      console.warn('Store logo upload failed');
    }
  }

  try {
    const res = await API.signupAdmin({ name, storeName, email, password, phone, avatarUrl });
    showToast(`Merchant Registered! Store ID: ${res.admin.storeId}`);
    updateAdminUI(res.admin);
    setTimeout(() => {
      const screens = document.querySelectorAll('#admin-view .app-screen');
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById('screen-admin-dashboard')?.classList.add('active');
    }, 600);
  } catch (err) {
    showToast(`Registration Failed: ${err.message}`);
  }
}

// Sign Out Handler
function handleLogout(role = 'user') {
  API.clearToken(role);
  if (role === 'admin') {
    openSellerLogin();
    showToast('Signed out from Seller Portal');
  } else {
    openConsumerLogin();
    showToast('Signed out from Customer Account');
  }
}


// Customer Catalog Functions
function renderHomeProducts(items) {
  const grid = document.getElementById('home-product-grid');
  if (!grid) return;
  grid.innerHTML = items.map(p => `
    <div class="product-card" onclick="openPDP('${p.id}')">
      <div class="card-media">
        <img src="${p.image}" alt="${p.title}" />
        <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(this)"><i class="ri-heart-line"></i></button>
        <span class="discount-chip">${p.discount}</span>
      </div>
      <div class="card-details">
        <span class="card-brand">${p.brand}</span>
        <h4 class="card-title">${p.title}</h4>
        <div class="card-price-row">
          <span class="card-price">₹${Number(p.price).toLocaleString('en-IN')}</span>
          <span class="rating-tag"><i class="ri-star-fill"></i> ${p.rating}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderSearchProducts(items) {
  const grid = document.getElementById('search-product-grid');
  if (!grid) return;
  grid.innerHTML = items.map(p => `
    <div class="product-card" onclick="openPDP('${p.id}')">
      <div class="card-media">
        <img src="${p.image}" alt="${p.title}" />
        <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(this)"><i class="ri-heart-line"></i></button>
      </div>
      <div class="card-details">
        <span class="card-brand">${p.brand}</span>
        <h4 class="card-title">${p.title}</h4>
        <div class="card-price-row">
          <span class="card-price">₹${Number(p.price).toLocaleString('en-IN')}</span>
          <span class="rating-tag"><i class="ri-star-fill"></i> ${p.rating}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function openPDP(productId) {
  const prod = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  document.getElementById('pdp-main-image').src = prod.image;
  document.getElementById('pdp-title').innerText = prod.title;
  document.getElementById('pdp-price').innerText = `₹${Number(prod.price).toLocaleString('en-IN')}`;
  navigateToScreen('screen-pdp');
}

function filterCategory(catName) {
  const roundels = document.querySelectorAll('.roundel');
  roundels.forEach(r => r.classList.remove('active'));

  if (catName === 'All') {
    renderHomeProducts(PRODUCTS);
    showToast('Showing All Collections');
  } else {
    const filtered = PRODUCTS.filter(p => p.category === catName || p.tags.includes(catName.toLowerCase()));
    renderHomeProducts(filtered.length ? filtered : PRODUCTS);
    showToast(`Filtered by ${catName}`);
  }
}

function handleSearchInput(query) {
  const q = query.toLowerCase().trim();
  const countSpan = document.getElementById('results-count');

  if (!q) {
    renderSearchProducts(PRODUCTS);
    if (countSpan) countSpan.innerText = 'Showing Catalog';
    return;
  }

  const filtered = PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(q) || 
    p.brand.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q)
  );

  renderSearchProducts(filtered);
  if (countSpan) countSpan.innerText = `Found ${filtered.length} results for "${query}"`;
}

function clearSearch() {
  const input = document.getElementById('main-search-input');
  if (input) {
    input.value = '';
    handleSearchInput('');
  }
}

function quickSearch(tag) {
  const input = document.getElementById('main-search-input');
  if (input) {
    input.value = tag;
    handleSearchInput(tag);
  }
}

function triggerVoiceSearch() {
  showToast('Voice Search Active: "Show oversized blazers"');
}

function triggerImageSearch() {
  showToast('Visual Scanner Active: Searching similar apparel...');
}

function openFilterModal() {
  showToast('Opening Search Filter Drawer');
}

// Shopping Bag & Billing
function renderCart() {
  const container = document.getElementById('cart-items-container');
  const cartBadge = document.getElementById('nav-cart-badge');
  const cartCount = document.getElementById('cart-count');

  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  if (cartBadge) cartBadge.innerText = totalQty;
  if (cartCount) cartCount.innerText = totalQty;

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 40px 0; color: #A0A0A0;">Your bag is empty</div>`;
    updateBill(0);
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item-card">
      <button class="remove-cart-item-btn" onclick="removeFromCart('${item.id}')" title="Remove Item"><i class="ri-delete-bin-6-line"></i></button>
      <img src="${item.image}" alt="${item.title}" />
      <div class="item-info">
        <h4 class="item-title">${item.title}</h4>
        <div class="item-meta">Size: ${item.size || 'S'} • Color: Noir</div>
        <div class="item-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  updateBill(subtotal);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  showToast('Item removed from Shopping Bag');
}

function selectPaymentMethod(method, btnElem) {
  const options = document.querySelectorAll('.pay-option');
  options.forEach(opt => opt.classList.remove('active'));
  btnElem.classList.add('active');

  const panes = document.querySelectorAll('.pay-pane');
  panes.forEach(pane => pane.classList.remove('active'));

  const targetPane = document.getElementById(`pay-pane-${method}`);
  if (targetPane) targetPane.classList.add('active');
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }
  renderCart();
}

function addToBagFromPDP() {
  const item = cart.find(i => i.id === 'p1');
  if (item) item.qty += 1;
  else cart.push({ id: 'p1', title: 'AURA Oversized Silk Blazer', size: 'S', price: 149, qty: 1, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300' });
  renderCart();
  showToast('Added to Shopping Bag! 🛍️');
}

function clearCart() {
  cart = [];
  renderCart();
  showToast('Shopping Bag Cleared');
}

function applyPromo() {
  const input = document.getElementById('promo-input');
  const status = document.getElementById('promo-status');
  if (!input || !input.value.trim()) {
    showToast('Please enter a valid promo code');
    return;
  }
  const code = input.value.trim().toUpperCase();
  if (code === 'AURA20') {
    if (status) status.innerText = '✓ Promo Code AURA20 Applied! (20% OFF)';
    showToast('Promo Code AURA20 Applied!');
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    updateBill(subtotal);
  } else {
    showToast('Invalid Coupon Code. Try AURA20');
  }
}

function updateBill(subtotal) {
  const tax = Math.round(subtotal * 0.18);
  const isPromo = document.getElementById('promo-status')?.innerText.includes('AURA20');
  const discount = isPromo ? Math.round(subtotal * 0.20) : 0;
  const total = Math.round(subtotal + tax - discount);

  const subEl = document.getElementById('bill-subtotal');
  const taxEl = document.getElementById('bill-tax');
  const discEl = document.getElementById('bill-discount');
  const totEl = document.getElementById('bill-total');
  const dockTot = document.getElementById('dock-total-val');
  const modalTotal = document.getElementById('modal-total-pay');

  if (subEl) subEl.innerText = `₹${Math.round(subtotal).toLocaleString('en-IN')}`;
  if (taxEl) taxEl.innerText = `₹${tax.toLocaleString('en-IN')}`;
  if (discEl) discEl.innerText = `-₹${discount.toLocaleString('en-IN')}`;
  if (totEl) totEl.innerText = `₹${total.toLocaleString('en-IN')}`;
  if (dockTot) dockTot.innerText = `₹${total.toLocaleString('en-IN')}`;
  if (modalTotal) modalTotal.innerText = `₹${total.toLocaleString('en-IN')}`;
}

function openPaymentDrawer() {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.classList.add('active');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.18);
  const isPromo = document.getElementById('promo-status')?.innerText.includes('AURA20');
  const discount = isPromo ? Math.round(subtotal * 0.20) : 0;
  const total = Math.round(subtotal + tax - discount);

  const modalTotal = document.getElementById('modal-total-pay');
  if (modalTotal) modalTotal.innerText = `₹${total.toLocaleString('en-IN')}`;
  showToast('Opening Unified Indian Payment Gateway... 💳');
}

function selectSize(btn) {
  const pills = document.querySelectorAll('.size-pill');
  pills.forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
}

function openSizeChartModal() {
  showToast('Size Guide: S (Bust 34", Waist 28"), M (Bust 36", Waist 30")');
}

function toggleWishlist(btn) {
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  if (btn.classList.contains('active')) {
    icon.className = 'ri-heart-fill';
    showToast('Saved to Wishlist ❤️');
  } else {
    icon.className = 'ri-heart-line';
  }
}

function toggleWishlistPDP(btn) {
  toggleWishlist(btn);
}

function checkDeliverySLA() {
  const pin = document.getElementById('pincode-input')?.value || '10001';
  document.getElementById('sla-result').innerHTML = `⚡ Express Delivery available for <strong>${pin}</strong> by <strong>Tomorrow, 4:00 PM</strong>`;
  showToast(`SLA Checked for Zip ${pin}`);
}

function startCountdownTimer() {
  let seconds = 2 * 3600 + 14 * 60 + 59;
  const timerElem = document.getElementById('timer');
  if (!timerElem) return;

  setInterval(() => {
    seconds--;
    if (seconds <= 0) seconds = 8100;
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timerElem.innerText = `${h} : ${m} : ${s}`;
  }, 1000);
}

// Admin Sub-Tab & Actions
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
        <span class="inv-sku">SKU: ${p.sku || 'AUR-SKU'} • ₹${Number(p.price).toLocaleString('en-IN')}</span>
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
      showToast('Image upload failed, using default placeholder.');
    }
  }

  try {
    const res = await API.addProduct({ title, brand, category, price, stock, image });
    showToast(`Apparel Item "${title}" Added to Catalog! ✨`);
    closeAddProductModal();
    document.getElementById('add-product-form')?.reset();
    const preview = document.getElementById('prod-image-preview');
    if (preview) preview.style.display = 'none';

    await loadCatalogProducts();
  } catch (err) {
    showToast(`Failed to add product: ${err.message}`);
  }
}

async function handleUserAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    showToast('Uploading new avatar image...');
    const uploadRes = await API.uploadFile(file);
    const avatarUrl = uploadRes.fullUrl || uploadRes.url;

    const profAvatar = document.getElementById('user-profile-avatar');
    if (profAvatar) profAvatar.src = avatarUrl;

    await API.updateProfile({ avatarUrl }, 'user');
    showToast('Profile photo updated successfully! 📸');
  } catch (err) {
    showToast(`Avatar upload failed: ${err.message}`);
  }
}

// Interactive Payment Drawer & Checkout Handler
function openPaymentDrawer() {
  const modal = document.getElementById('payment-modal');
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.18);
  const isPromo = document.getElementById('promo-status')?.innerText.includes('AURA20');
  const discount = isPromo ? Math.round(subtotal * 0.20) : 0;
  const total = Math.max(0, Math.round(subtotal + tax - discount));

  const totalEl = document.getElementById('modal-total-pay');
  if (totalEl) totalEl.innerText = `₹${total.toLocaleString('en-IN')}`;

  if (modal) modal.classList.add('active');
}

function closePaymentDrawer() {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.classList.remove('active');
}

function handlePlaceOrder(e) {
  e.preventDefault();
  const address = document.getElementById('checkout-address')?.value || 'Flat 402, Bandra West, Mumbai 400050';
  const orderId = 'AUR-IND-' + Math.floor(100000 + Math.random() * 900000);
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Authorizing Real-Time Payment...`;
  }

  showToast('Processing payment securely... ⏳');

  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Confirm & Pay ₹ (INR) <i class="ri-shield-check-fill"></i>`;
    }
    closePaymentDrawer();
    cart = [];
    renderCart();

    const activeOrderSpan = document.getElementById('active-order-id');
    if (activeOrderSpan) activeOrderSpan.innerText = `Order #${orderId}`;

    showToast(`🎉 Payment Confirmed! Order #${orderId} placed successfully. Delivering to ${address}`);
    setTimeout(() => navigateToScreen('screen-profile'), 500);
  }, 1200);
}

// Size Chart Modal Handlers
function openSizeChartModal() {
  const modal = document.getElementById('size-chart-modal');
  if (modal) modal.classList.add('active');
}

function closeSizeChartModal() {
  const modal = document.getElementById('size-chart-modal');
  if (modal) modal.classList.remove('active');
}

// Search Filter Modal Handlers
function openFilterModal() {
  const modal = document.getElementById('filter-modal');
  if (modal) modal.classList.add('active');
}

function closeFilterModal() {
  const modal = document.getElementById('filter-modal');
  if (modal) modal.classList.remove('active');
}

function applySearchFilters(e) {
  e.preventDefault();
  const cat = document.getElementById('filter-cat-select')?.value;
  const maxPrice = parseFloat(document.getElementById('filter-max-price')?.value) || Infinity;

  let filtered = currentProducts;
  if (cat && cat !== 'All') {
    filtered = filtered.filter(p => p.category === cat);
  }
  if (maxPrice < Infinity) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }

  renderSearchProducts(filtered);
  closeFilterModal();
  showToast(`Filter Applied: ${filtered.length} products found`);
}

// Barcode Scanner Simulator Modal
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

function handleSocialLogin(provider) {
  showToast(`Authenticated via ${provider}! Welcome to AURA.`);
  setTimeout(() => {
    navigateToScreen('screen-home');
  }, 600);
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


