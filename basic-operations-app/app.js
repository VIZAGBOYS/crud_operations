const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const methodOverride = require('method-override'); // Added
require('dotenv').config(); // Import environment variables

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory
app.use(helmet()); // Security middleware
app.use(morgan('dev')); // Logging middleware
app.use(methodOverride('_method')); // Middleware to support DELETE and PUT in forms

// Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET, // Use environment variable for session secret
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // Use environment variable for MongoDB URI
  }),
}));

// Routes
app.use('/', userRoutes);
app.use('/books', bookRoutes);

// Default Route for Root URL
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 404 Error Handling Middleware
app.use((req, res, next) => {
  res.status(404).send('Page Not Found');
});

// General Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Server Error');
});

// Starting the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
  try {
    const open = (await import('open')).default;
    await open(`http://localhost:${PORT}`);
  } catch (error) {
    console.error('Error opening the browser:', error);
  }
});
