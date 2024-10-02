const Book = require('../models/Book');
const path = require('path');
const multer = require('multer');

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Define the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use a timestamp to avoid file name conflicts
  }
});

const upload = multer({ storage });

//homepage rendering
const renderHome = (req, res) => {
  try {
    res.render('home'); 
  } catch (err) {
    console.error('Error rendering home page:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Render the page to create a new book
const renderCreateBook = async (req, res) => {
  try {
    const books = await Book.find({ user_id: req.session.userId });
    res.render('books', { books, message: req.session.message || {} });
    delete req.session.message; // Clear the message after rendering
  } catch (err) {
    console.error('Error rendering create book page:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Handle the creation of a new book with image upload
const createBook = async (req, res) => {
  const { title, description, publishYear, author } = req.body;
  const coverPagePath = req.file ? `/uploads/${req.file.filename}` : ''; // Get the uploaded image path

  const book = new Book({
    user_id: req.session.userId,
    title,
    description,
    publishYear,
    author,
    coverPagePath
  });

  try {
    await book.save();
    req.session.message = { type: 'success', content: 'Book successfully created!' };
    res.redirect('/books');
  } catch (err) {
    console.error('Error creating a new book:', err);
    req.session.message = { type: 'error', content: 'Failed to create book. Please try again.' };
    res.redirect('/books');
  }
};

// Render the page to edit a book
const renderEditBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book.user_id.toString() === req.session.userId) {
      res.render('edit-book', { book, message: req.session.message || {} });
      delete req.session.message; // Clear the message after rendering
    } else {
      req.session.message = { type: 'error', content: 'Unauthorized to edit this book.' };
      res.redirect('/books');
    }
  } catch (err) {
    console.error('Error rendering edit book page:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Handle updating a book with optional image upload
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book.user_id.toString() === req.session.userId) {
      const updatedData = { ...req.body };

      // If a new cover page is uploaded, update the coverPagePath
      if (req.file) {
        updatedData.coverPagePath = `/uploads/${req.file.filename}`;
      }

      await Book.findByIdAndUpdate(req.params.id, updatedData);
      req.session.message = { type: 'success', content: 'Book successfully updated!' };
    } else {
      req.session.message = { type: 'error', content: 'Unauthorized to update this book.' };
    }
    res.redirect('/books');
  } catch (err) {
    console.error('Error updating the book:', err);
    req.session.message = { type: 'error', content: 'Failed to update book. Please try again.' };
    res.redirect('/books');
  }
};

// Handle deleting a book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book.user_id.toString() === req.session.userId) {
      await Book.findByIdAndDelete(req.params.id);
      req.session.message = { type: 'success', content: 'Book successfully deleted!' };
    } else {
      req.session.message = { type: 'error', content: 'Unauthorized to delete this book.' };
    }
    res.redirect('/books');
  } catch (err) {
    console.error('Error deleting the book:', err);
    req.session.message = { type: 'error', content: 'Failed to delete book. Please try again.' };
    res.redirect('/books');
  }
};

// Render a single book view
const renderViewBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('user_id');
    if (book) {
      res.render('view-book', { book });
    } else {
      res.status(404).send('Book not found');
    }
  } catch (err) {
    console.error('Error rendering book view:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Render all books
const renderAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.render('all-books', { books });
  } catch (err) {
    console.error('Error rendering all books:', err);
    res.status(500).send('Internal Server Error');
  }
};
const getBookOfTheDay = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const sessionData = req.session.bookOfTheDay || {}; // Retrieve stored session data

    // Check if the stored date is today
    if (sessionData.date === today && sessionData.bookId) {
      // Render the previously selected book
      const book = await Book.findById(sessionData.bookId);
      return res.render('book-of-the-day', { book });
    }

    // Fetch all books and select a new random one
    const books = await Book.find({});
    if (books.length === 0) {
      return res.render('book-of-the-day', { book: null }); // Handle case where no books are available
    }

    const randomIndex = Math.floor(Math.random() * books.length);
    const bookOfTheDay = books[randomIndex];

    // Store the selected book's ID and today's date in the session
    req.session.bookOfTheDay = {
      bookId: bookOfTheDay._id,
      date: today,
    };

    res.render('book-of-the-day', { book: bookOfTheDay });
  } catch (err) {
    console.error('Error fetching Book of the Day:', err);
    res.status(500).send('Internal Server Error');
  }
};
// Handle searching books by title or author
const searchBooks = async (req, res) => {
  const searchQuery = req.query.query || ''; // Get the search query from the request

  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },  // Case-insensitive title search
        { author: { $regex: searchQuery, $options: 'i' } }  // Case-insensitive author search
      ]
    });

    res.render('index', { books, searchPerformed: true, user: req.session.user });
  } catch (err) {
    console.error('Error searching books:', err);
    res.status(500).send('Internal Server Error');
  }
};
// Exporting the controller functions to be used in routes
module.exports = {
  renderHome,
  renderCreateBook,
  createBook: [upload.single('coverPage'), createBook], // Add multer middleware for image upload
  renderEditBook,
  updateBook: [upload.single('coverPage'), updateBook], // Add multer middleware for image upload
  deleteBook,
  renderViewBook,
  renderAllBooks,
  searchBooks,
  getBookOfTheDay,
};