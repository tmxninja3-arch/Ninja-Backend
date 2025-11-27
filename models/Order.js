const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    games: [
      {
        game: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Game',
          required: true,
        },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Marked Paid'],
      default: 'COD',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);