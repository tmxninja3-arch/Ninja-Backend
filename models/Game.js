const mongoose = require('mongoose');

// Game Schema
const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a game title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
      max: [10000, 'Price cannot exceed 10000'],
    },
    genre: {
      type: String,
      required: [true, 'Please provide a genre'],
      enum: {
        values: [
          'Action',
          'Adventure',
          'RPG',
          'Strategy',
          'Sports',
          'Racing',
          'Simulation',
          'Puzzle',
          'Horror',
          'Fighting',
          'Platformer',
          'Shooter',
          'Other',
        ],
        message: '{VALUE} is not a valid genre',
      },
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/300x400?text=Game+Cover',
    },
    downloadURL: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true,
    },
    stock: {
      type: Number,
      default: 999,
      min: [0, 'Stock cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
   },
  { 
    timestamps: true 
  }
);

// Index for faster searches
gameSchema.index({ title: 'text', description: 'text' });

// Export the model
module.exports = mongoose.model('Game', gameSchema);