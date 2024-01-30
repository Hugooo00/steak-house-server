const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/userModel');

// Filter the object field
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.getOneUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined ',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword.',
        400,
      ),
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.setAccountActiveState = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { activeState: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
