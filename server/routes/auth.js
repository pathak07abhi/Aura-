const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper to remove sensitive password field
function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// USER SIGNUP
router.post('/user/signup', async (req, res) => {
  try {
    const { name, email, password, phone, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('User Signup Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
});

// USER LOGIN
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('User Login Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ADMIN SIGNUP
router.post('/admin/signup', async (req, res) => {
  try {
    const { name, storeName, email, password, phone, avatarUrl } = req.body;

    if (!name || !storeName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, store name, email, and password are required.' });
    }

    const existingAdmin = db.findAdminByEmail(email);
    if (existingAdmin) {
      return res.status(409).json({ success: false, message: 'An admin account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const storeId = 'store_aur' + Math.floor(10000 + Math.random() * 90000);
    
    const newAdmin = {
      id: 'adm_' + Date.now(),
      storeId,
      name,
      storeName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    db.addAdmin(newAdmin);

    const token = jwt.sign(
      { id: newAdmin.id, email: newAdmin.email, storeId: newAdmin.storeId, name: newAdmin.name, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Seller Portal account created successfully!',
      token,
      admin: sanitizeUser(newAdmin)
    });
  } catch (err) {
    console.error('Admin Signup Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during admin signup.' });
  }
});

// ADMIN LOGIN
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Store Email/ID and password are required.' });
    }

    const admin = db.findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, storeId: admin.storeId, name: admin.name, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: `Merchant ${admin.storeName} Authenticated!`,
      token,
      admin: sanitizeUser(admin)
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
});

// GET CURRENT AUTH PROFILE
router.get('/me', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    const admin = db.findAdminById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    return res.json({ success: true, role: 'admin', user: sanitizeUser(admin) });
  } else {
    const user = db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User profile not found.' });
    return res.json({ success: true, role: 'user', user: sanitizeUser(user) });
  }
});

// UPDATE PROFILE
router.put('/profile', authenticateToken, (req, res) => {
  const { name, phone, avatarUrl, storeName } = req.body;

  if (req.user.role === 'admin') {
    const updated = db.updateAdmin(req.user.id, { name, phone, avatarUrl, storeName });
    if (!updated) return res.status(404).json({ success: false, message: 'Admin not found' });
    return res.json({ success: true, message: 'Admin profile updated', admin: sanitizeUser(updated) });
  } else {
    const updated = db.updateUser(req.user.id, { name, phone, avatarUrl });
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: 'Profile updated successfully', user: sanitizeUser(updated) });
  }
});

module.exports = router;
