const mongoose = require('mongoose');
// const Menu = require('./menuModel');

const reviewSchema = new mongoose.Schema(
  {
    reviewContent: {
      type: String,
      required: [true, 'Review content can not be empty!'],
    },
    reviewRating: { type: Number, min: 1, max: 10 },
    reviewCreateAt: { type: Date, default: Date.now },
    menuItem: {
      type: mongoose.Schema.ObjectId,
      ref: 'Menu',
      required: [true, 'Review must belong to a Menu Item.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Populating Reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
