const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.menuId) filter = { menuItem: req.params.menuId };
  const allReviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    numResults: allReviews.length,
    data: {
      allReviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.menuItem) req.body.menuItem = req.params.menuId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
