//server.js - Main entry point for the Fennec FC CMS application

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');

//Load environment variables
dotenv.config();

//Import routes
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const merchandiseRoutes = require('./routes/merchandise');
const apiRoutes = require('./routes/api');
const fixtureRoutes = require('./routes/fixtures');

//Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

//Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fennecFC', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); //Logging
app.use(helmet({ contentSecurityPolicy: false })); //Security headers
app.use(cors()); //CORS
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true
}));

//Serve static files
app.use(express.static('public'));

//Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fennecFCsecretkey2025',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/fennecFC',
    collectionName: 'sessions'
  }),
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, //24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', articleRoutes);
app.use('/api/merchandise', merchandiseRoutes);
app.use('/api/fixtures', fixtureRoutes);
app.use('/api', apiRoutes);

//Serve the frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

//Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;