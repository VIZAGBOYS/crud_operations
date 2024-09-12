const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookcontroller');

// Middleware to ensure the user is authenticated
// Example: router.use(isAuthenticated); // Uncomment if authentication middleware is used

// Route to render the page for creating a new book
router.get('/', bookController.renderCreateBook);

// Route to handle the creation of a new book
router.post('/', bookController.createBook);

// Route to render the page for editing a book
router.get('/edit/:id', bookController.renderEditBook);

// Route to handle updating a book
router.post('/edit/:id', bookController.updateBook);

// Route to handle deleting a book
router.delete('/delete/:id', bookController.deleteBook); // Use DELETE method for deletion

// Route to render a single book view
router.get('/view/:id', bookController.renderViewBook);

// Route to render all books
router.get('/all', bookController.renderAllBooks);

// Route to handle searching books by title or author
router.get('/search', bookController.searchBooks);

module.exports = router;
