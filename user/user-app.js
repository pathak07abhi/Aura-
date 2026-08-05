/* ==========================================================================
   AURA FASHION CUSTOMER APP LOGIC
   ========================================================================== */

let cart = [
  { id: 'p1', title: 'AURA Oversized Silk Blazer', size: 'S', price: 149, qty: 1, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300' },
  { id: 'p3', title: 'Pleated Tailored Trousers', size: 'M', price: 89, qty: 1, image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300' }
];

let currentProducts = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadCatalogProducts();
  checkAuthSession();
  renderCart();
  startCountdownTimer();
});

function navigateToScreen(screenId) {
  const screens = document.querySelectorAll('.app-screen');
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

function openConsumerLogin() {
  const screens = document.querySelectorAll('.app-screen');
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById('screen-consumer-login')?.classList.add('active');
}


async function loadCatalogProducts() {
  if (typeof API !== 'undefined') {
    try {
      const apiProds = await API.getProducts();
      if (apiProds && apiProds.length > 0) currentProducts = apiProds;
    } catch (e) {
      console.log('Using local catalog fallback');
    }
  }
  renderHomeProducts(currentProducts);
  renderSearchProducts(currentProducts);
}

function checkAuthSession() {
  if (typeof API === 'undefined') return;
  const user = API.getStoredUser('user');
  if (user) updateCustomerUI(user);
}

function updateCustomerUI(user) {
  const greetingName = document.querySelector('.user-greeting .greeting-title');
  if (greetingName && user.name) greetingName.innerText = user.name;

  const profName = document.getElementById('user-profile-name');
  const profEmail = document.getElementById('user-profile-email');
  const profAvatar = document.getElementById('user-profile-avatar');

  if (profName) profName.innerText = user.name;
  if (profEmail) profEmail.innerText = user.email;
  if (profAvatar && user.avatarUrl) profAvatar.src = user.avatarUrl;
}

function switchAuthTab(role, tabType) {
  const loginBtn = document.getElementById('user-tab-login-btn');
  const signupBtn = document.getElementById('user-tab-signup-btn');
  const loginPane = document.getElementById('user-pane-login');
  const signupPane = document.getElementById('user-pane-signup');

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
      console.warn('Avatar upload failed');
    }
  }

  try {
    const res = await API.signupUser({ name, email, password, phone, avatarUrl });
    showToast(`Account Created! Welcome, ${res.user.name}! ✨`);
    updateCustomerUI(res.user);
    setTimeout(() => navigateToScreen('screen-home'), 600);
  } catch (err) {
    showToast(`Sign Up Failed: ${err.message}`);
  }
}


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
          <span class="card-price">$${p.price}</span>
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
          <span class="card-price">$${p.price}</span>
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
  document.getElementById('pdp-price').innerText = `$${prod.price}`;
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

function triggerVoiceSearch() {
  showToast('Voice Search Active: "Show oversized blazers"');
}

function triggerImageSearch() {
  showToast('Visual Scanner Active: Searching similar apparel...');
}

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
        <div class="item-price">$${item.price}</div>
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

function updateBill(subtotal) {
  const tax = subtotal * 0.08;
  const discount = subtotal * 0.20;
  const total = subtotal + tax - discount;

  const subEl = document.getElementById('bill-subtotal');
  const taxEl = document.getElementById('bill-tax');
  const discEl = document.getElementById('bill-discount');
  const totEl = document.getElementById('bill-total');
  const dockTot = document.getElementById('dock-total-val');

  if (subEl) subEl.innerText = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.innerText = `$${tax.toFixed(2)}`;
  if (discEl) discEl.innerText = `-$${discount.toFixed(2)}`;
  if (totEl) totEl.innerText = `$${total.toFixed(2)}`;
  if (dockTot) dockTot.innerText = `$${total.toFixed(2)}`;
}

function openPaymentDrawer() {
  showToast('Opening Unified Payment Gateway...');
}

function selectSize(btn) {
  const pills = document.querySelectorAll('.size-pill');
  pills.forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
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

function openFilterModal() {
  showToast('Opening Search Filter Drawer');
}

function quickSearch(tag) {
  const input = document.getElementById('main-search-input');
  if (input) {
    input.value = tag;
    handleSearchInput(tag);
  }
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

function openSizeChartModal() {
  showToast('Size Guide: S (Bust 34", Waist 28"), M (Bust 36", Waist 30")');
}

function handleLogout(role = 'user') {
  API.clearToken(role);
  openConsumerLogin();
  showToast('Signed out from Customer Account');
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

