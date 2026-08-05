const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Uploaded Files Statically
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), message: 'AURA Fashion Auth & Storage Backend Active' });
});

// Fallback Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 AURA Backend Server running on http://localhost:${PORT}`);
  console.log(`📁 Static files served at http://localhost:${PORT}/uploads`);
});
