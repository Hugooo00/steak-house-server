const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const allReviews = await Review.find();

  res.status(200).json({
    status: 'success',
    numResults: allReviews.length,
    data: {
      allReviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});