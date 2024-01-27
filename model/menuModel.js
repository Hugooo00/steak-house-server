const mongoose = require('mongoose');

const menuSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A menu item must have a name'],
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'A menu item must have a price'],
  },
  description: { type: String, trim: true },
  category: {
    type: String,
    required: [true, 'A menu item must have a category'],
  },
  image: { type: String },
  status: { type: String, required: [true, 'A menu item must have a status'] },
  ratingsAverage: { type: Number, default: 9 },
  ratingsQuantity: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Menu = mongoose.model('menu', menuSchema);

module.exports = Menu;
