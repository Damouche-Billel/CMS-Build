const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const merchandiseRoutes = require('./routes/merchandise');
const apiRoutes = require('./routes/api');
const fixtureRoutes = require('./routes/fixtures');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true
}));

// Serve static files
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fennecFCsecretkey2025',
  resave: true, // Changed to true
  saveUninitialized: true, // Changed to true
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || process.env.DB_URI, // Added fallback
    collectionName: 'sessions',
    ttl: 24 * 60 * 60,
    autoRemove: 'native',
    crypto: {
      secret: process.env.SESSION_SECRET || 'fennecFCsecretkey2025'
    }
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false, // Set to false for development
    sameSite: 'lax'
  }
}));

// Add error handler for session store
app.use((req, res, next) => {
  if (!req.session) {
    console.error('Session Error');
    return next(new Error('session error'));
  }
  next();
});

// Create indexes and default admin user if needed
const initializeDatabase = async () => {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      await User.create({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@fennecfc.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isVerified: true
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

mongoose.connection.once('open', () => {
  console.log('Running database initialization...');
  initializeDatabase();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/merchandise', merchandiseRoutes);
app.use('/api/fixtures', fixtureRoutes);
app.use('/api', apiRoutes);

// Catch-all route to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start server only after DB connection
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

module.exports = app;
