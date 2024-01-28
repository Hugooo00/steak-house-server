const Menu = require('../model/menuModel');

// Top3 Popular Steak filtering middleWare
exports.aliasTopSteak = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage,-price';
  req.query.fields = 'name,price,ratingsAverage,description,image,category';
  req.query.category = 'Steak';
  next();
};

exports.getAllMenu = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { menuItem },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMenuStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const newMenuItem = await Menu.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { tour: newMenuItem },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invaild data sent',
    });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: menuItem });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res
      .status(204) // 204 means no content
      .json({ status: 'success', Menu: null }); // data send back is null}
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
