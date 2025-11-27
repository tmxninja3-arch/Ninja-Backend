const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express
const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
  // Add your Vercel frontend URL after deployment
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1 && !origin.includes('vercel.app')) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// ============================================
// STATIC FILES (Optional - for local uploads)
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));

// ============================================
// ROOT ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: '🎮 GameStore API is running...',
    version: '1.0.0',
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: 'connected',
  });
});

// ============================================
// API INFO
// ============================================
app.get('/api', (req, res) => {
  res.json({
    message: 'GameStore API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      games: '/api/games',
      orders: '/api/orders',
      upload: '/api/upload',
    },
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// ============================================
// START SERVER (for local development)
// ============================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('=================================');
  });
}

// ============================================
// EXPORT FOR VERCEL
// ============================================
module.exports = app;