const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const initialProducts = [
  {
    id: 'p1',
    sku: 'AUR-BLZ-01',
    brand: 'AURA STUDIO',
    title: 'AURA Oversized Silk-Linen Co-ord Blazer',
    category: 'Women',
    price: 149,
    originalPrice: 249,
    rating: 4.8,
    reviews: 142,
    discount: '40% OFF',
    stock: 42,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
    tags: ['blazer', 'linen', 'co-ords', 'women'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    sku: 'AUR-TEE-09',
    brand: 'MONOCHROME',
    title: 'Heavyweight Drop-Shoulder Tee',
    category: 'Men',
    price: 45,
    originalPrice: 75,
    rating: 4.9,
    reviews: 88,
    discount: '40% OFF',
    stock: 5,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
    tags: ['tee', 'oversized', 'men', 'streetwear'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p3',
    sku: 'AUR-TR-12',
    brand: 'KINETIC',
    title: 'Pleated Tailored Wide Trousers',
    category: 'Men',
    price: 89,
    originalPrice: 130,
    rating: 4.7,
    reviews: 54,
    discount: '31% OFF',
    stock: 28,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600',
    tags: ['pants', 'trousers', 'pleated', 'formal'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p4',
    sku: 'AUR-ETH-04',
    brand: 'ETHNIC CRAFT',
    title: 'Handwoven Chanderi Kurta Set',
    category: 'Ethnic',
    price: 110,
    originalPrice: 180,
    rating: 4.9,
    reviews: 112,
    discount: '38% OFF',
    stock: 18,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
    tags: ['ethnic', 'kurta', 'festive'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p5',
    sku: 'AUR-JKT-07',
    brand: 'AURA URBAN',
    title: 'Minimalist Utility Bomber Jacket',
    category: 'Streetwear',
    price: 120,
    originalPrice: 180,
    rating: 4.6,
    reviews: 67,
    discount: '33% OFF',
    stock: 14,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    tags: ['jacket', 'bomber', 'streetwear', 'men'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p6',
    sku: 'AUR-DRS-03',
    brand: 'LUMEN',
    title: 'Draped Asymmetric Satin Midi Dress',
    category: 'Women',
    price: 135,
    originalPrice: 210,
    rating: 4.8,
    reviews: 95,
    discount: '35% OFF',
    stock: 22,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600',
    tags: ['dress', 'satin', 'women', 'party'],
    createdAt: new Date().toISOString()
  }
];

// Read JSON File helper
function readJSON(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

// Write JSON File helper
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Database Operations
const db = {
  // Users
  getUsers: () => readJSON(USERS_FILE, []),
  saveUsers: (users) => writeJSON(USERS_FILE, users),
  findUserByEmail: (email) => {
    const users = readJSON(USERS_FILE, []);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id) => {
    const users = readJSON(USERS_FILE, []);
    return users.find(u => u.id === id);
  },
  addUser: (user) => {
    const users = readJSON(USERS_FILE, []);
    users.push(user);
    writeJSON(USERS_FILE, users);
    return user;
  },
  updateUser: (id, updates) => {
    const users = readJSON(USERS_FILE, []);
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
      writeJSON(USERS_FILE, users);
      return users[idx];
    }
    return null;
  },

  // Admins / Sellers
  getAdmins: () => readJSON(ADMINS_FILE, []),
  saveAdmins: (admins) => writeJSON(ADMINS_FILE, admins),
  findAdminByEmail: (email) => {
    const admins = readJSON(ADMINS_FILE, []);
    return admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  },
  findAdminById: (id) => {
    const admins = readJSON(ADMINS_FILE, []);
    return admins.find(a => a.id === id);
  },
  addAdmin: (admin) => {
    const admins = readJSON(ADMINS_FILE, []);
    admins.push(admin);
    writeJSON(ADMINS_FILE, admins);
    return admin;
  },
  updateAdmin: (id, updates) => {
    const admins = readJSON(ADMINS_FILE, []);
    const idx = admins.findIndex(a => a.id === id);
    if (idx !== -1) {
      admins[idx] = { ...admins[idx], ...updates, updatedAt: new Date().toISOString() };
      writeJSON(ADMINS_FILE, admins);
      return admins[idx];
    }
    return null;
  },

  // Products
  getProducts: () => readJSON(PRODUCTS_FILE, initialProducts),
  saveProducts: (products) => writeJSON(PRODUCTS_FILE, products),
  addProduct: (product) => {
    const products = readJSON(PRODUCTS_FILE, initialProducts);
    products.unshift(product);
    writeJSON(PRODUCTS_FILE, products);
    return product;
  },
  updateProduct: (id, updates) => {
    const products = readJSON(PRODUCTS_FILE, initialProducts);
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updates };
      writeJSON(PRODUCTS_FILE, products);
      return products[idx];
    }
    return null;
  },
  deleteProduct: (id) => {
    let products = readJSON(PRODUCTS_FILE, initialProducts);
    products = products.filter(p => p.id !== id);
    writeJSON(PRODUCTS_FILE, products);
    return true;
  },

  // Orders
  getOrders: () => readJSON(ORDERS_FILE, []),
  addOrder: (order) => {
    const orders = readJSON(ORDERS_FILE, []);
    orders.unshift(order);
    writeJSON(ORDERS_FILE, orders);
    return order;
  }
};

// Initialize default data if missing
db.getProducts();

module.exports = db;
