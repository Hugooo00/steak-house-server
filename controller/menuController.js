const Menu = require('../model/menuModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// Top3 Popular Steak filtering middleWare
exports.aliasTopSteak = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage,-price';
  req.query.fields = 'name,price,ratingsAverage,description,image,category';
  req.query.category = 'Steak';
  next();
};

exports.getAllMenu = catchAsync(async (req, res) => {
  // Filtering the exculde fields
  const queryObject = { ...req.query };
  const exculdeFields = ['sort', 'limit', 'fields', 'page'];
  exculdeFields.forEach((el) => {
    delete queryObject[el];
  });

  // Filter the gte|gt|lte|lt , so can achieve like '>' operator in query
  let queryObj = JSON.stringify(queryObject);
  queryObj = queryObj.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let query = Menu.find(JSON.parse(queryObj));

  // Sorting by fields
  if (req.query.sort) {
    const sortedBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortedBy);
  } else {
    query = query.sort('-createdAt'); // default
  }

  // Field selected limiting
  if (req.query.fields) {
    const fieldSelected = req.query.fields.split(',').join(' ');
    query = query.select(fieldSelected);
  }

  // Limit the number of query results
  if (req.query.limit) {
    const limit = req.query.limit * 1;
    query = query.limit(limit);
  }

  const menu = await query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.reqTime,
    results: menu.length,
    data: { menu },
  });
});

exports.getMenuItem = catchAsync(async (req, res, next) => {
  const menuItem = await Menu.findById(req.params.id);
  if (!menuItem) {
    return next(
      new AppError('Unable to find a menu item with the provided ID', 404),
    );
  }
  res.status(200).json({
    status: 'success',
    data: { menuItem },
  });
});

exports.getMenuStats = catchAsync(async (req, res) => {
  const stats = await Menu.aggregate([
    {
      $group: {
        _id: '$category',
        numMenu: { $sum: 1 },
        // numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.createMenu = catchAsync(async (req, res) => {
  const newMenuItem = await Menu.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { menu: newMenuItem },
  });
});

exports.updateMenu = catchAsync(async (req, res) => {
  const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: menuItem });
});

exports.deleteMenu = catchAsync(async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res
    .status(204) // 204 means no content
    .json({ status: 'success', Menu: null }); // data send back is null}
});
