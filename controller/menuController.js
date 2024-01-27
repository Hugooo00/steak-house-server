// const fs = require('fs');
const Menu = require('../model/menuModel');

// const menu = JSON.parse(fs.readFileSync(`${__dirname}/../data/menu.json`));

// exports.checkID = (req, res, next, val) => {
//   const queryId = req.params.id * 1;
//   if (queryId > Menu.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invaild ID',
//     });
//   }
//   next();
// };

exports.getAllMenu = async (req, res) => {
  try {
    const menu = await Menu.find();
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
