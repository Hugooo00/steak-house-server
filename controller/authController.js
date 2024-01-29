const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// Signup a new user
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Create token and return to the client side
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password exist
  if (!email || !password) {
    return new AppError('Please provide email and password', 400);
  }

  // Check if email is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return new AppError('The email in not correct', 401);
  }

  // Check if the input password and the user's stored password are the same.
  const compareResult = await user.comparePassword(password, user.password);
  if (!compareResult) {
    return new AppError('The password is not correct', 401);
  }

  // Create token and return to the client side
  const token = signToken(user._id);
  res.status(201).json({
    status: 'success',
    token,
  });
});

// Protect secret route
exports.routeProtect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if the token is exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('💥', token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  // 2) Verify the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decode); // {id, iat, exp}

  // 3) Check if user still exists
  const curUser = await User.findById(decode.id);
  if (!curUser) {
    return next(new AppError('The user no longer exist', 401));
  }

  // 4) Check if user changed password after token was issued
  if (curUser.checkPasswordChangeAfterToken(decode.iat)) {
    // "iat" means issue at
    return next(
      new AppError('User has changed password! Please log in again.', 401),
    );
  }

  req.user = curUser;
  next();
});

// Authorizations; restrict to user permissions
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You don't have any permission to operate this action",
          403,
        ),
      );
    }
    next();
  };

// Forget password and send reset password message(include reset token) to user's email
exports.forgetPasswordAndSendEmail = catchAsync(async (req, res, next) => {
  // Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  // Generate random reset token and save it to database
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset token to user's Email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Dear user,\n\nIt appears that you have requested a password reset. To proceed, please submit a PATCH request with your new password and password confirmation to the following URL: ${resetURL}.\n\nIf you did not initiate this request, please disregard this message for your security. No changes have been made to your account.\n\nBest regards,\nYour SteakHouse Co. Team`;
  // console.log(message);
  try {
    await sendEmail({
      email: user.email,
      subject: 'This is your password reset token (Only valid within 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to user email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});
