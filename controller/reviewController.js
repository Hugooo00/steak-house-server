const Review = require('../model/reviewModel');
const AppError = require('../utils/appError');
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

exports.getOnereview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updatedReview) {
    return next(new AppError('No review found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      updatedReview,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const deleteReview = await Review.findByIdAndDelete(req.params.id);

  if (!deleteReview) {
    return next(new AppError('No review found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
