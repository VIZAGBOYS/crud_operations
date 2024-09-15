const mongoose = require('mongoose');

// Define the schema for a book
const BookSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true  // Ensure a book is always associated with a user
  },
  title: {
    type: String,
    required: true  // Title is required
  },
  description: {
    type: String,
    required: true  // Description is required
  },
  publishYear: {
    type: Number,
    required: true,  // Publish year is required
    validate: {
      validator: Number.isInteger,  // Ensure it's an integer
      message: '{VALUE} is not a valid year'  // Error message for invalid publish year
    }
  },
  author: {
    type: String,
    required: true  // Author is required
  },
  coverPagePath: {
    type: String,   // Store the path to the cover image
    default: 'default-cover.jpg'  // Default cover image if none is provided
  }
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

// Export the Book model
module.exports = mongoose.model('Book', BookSchema);