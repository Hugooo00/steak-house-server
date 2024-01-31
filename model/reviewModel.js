const mongoose = require('mongoose');
const Menu = require('./menuModel');

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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Populating Reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Calculate Average Rating
// 1) Static method to calculate and update average ratings.
reviewSchema.statics.calAvgRatings = async function (menuId) {
  const calAvgRating = await this.aggregate([
    { $match: { menuItem: menuId } },
    {
      $group: {
        _id: '$menuItem',
        sumRatingsQuantity: { $sum: 1 },
        avgRating: { $avg: '$reviewRating' },
      },
    },
  ]);
  console.log(calAvgRating);
  // Assign resultes to the field of ratingsAverage and ratingsQuantity
  if (calAvgRating.length > 0) {
    await Menu.findByIdAndUpdate(menuId, {
      ratingsAverage: calAvgRating[0].avgRating,
      ratingsQuantity: calAvgRating[0].sumRatingsQuantity,
    });
  } else {
    await Menu.findByIdAndUpdate(menuId, {
      ratingsAverage: 8.5,
      ratingsQuantity: 0,
    });
  }
};

// 2) Post-save hook to trigger average rating calculation.
reviewSchema.post('save', function () {
  this.constructor.calAvgRatings(this.menuItem);
});

// Calculate again after update or delete review
// /^findOneAnd/ : findByIdAndUpdate and findByIdAndDelete in this case
// 1) Pre-hook: Fetches original document before update/delete.
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewObject = await this.clone().findOne();
  console.log(this.reviewObject);
  next();
});

// 2) Post-hook: Updates menu's average ratings and quantity after update/delete.
reviewSchema.post(/^findOneAnd/, async function () {
  // console.log('Post findOneAnd hook:', this.reviewObject);
  await this.reviewObject.constructor.calAvgRatings(this.reviewObject.menuItem);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
