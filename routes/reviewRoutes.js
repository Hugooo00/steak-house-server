const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

const router = express.Router({ mergeParams: true }); // Using mergeParams to get menuId

router.use(authController.routeProtect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.routeProtect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

module.exports = router;
