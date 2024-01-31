const mongoose = require('mongoose');
const slugify = require('slugify');

const menuSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A menu item must have a name'],
      unique: true,
      trim: true,
      axlength: [40, 'A food name must have less or equal then 40 characters'],
      minlength: [5, 'A food name must have more or equal then 5 characters'],
    },
    price: {
      type: Number,
      required: [true, 'A menu item must have a price'],
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount should below regular price',
      },
      default: 0,
    },
    description: { type: String, trim: true },
    category: {
      type: String,
      required: [true, 'A menu item must have a category'],
      enum: {
        values: ['Steak', 'Snacks', 'Main', 'Kids', 'Sweet', 'Craft Beer'],
        message:
          'Category is either Steak, Snacks, Main, Sweet, Kids and Craft Beer',
      },
    },
    image: { type: String },
    status: {
      type: String,
      required: [true, 'A menu item must have a status'],
      enum: {
        values: ['Available', 'Sold out'],
        message: 'Status is either Available and Sold out',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 8.5,
      min: [1, 'Rating must be above 1.0'],
      max: [10, 'Rating must be below 10.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    slug: String,
    // reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Review' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate: reviews field
menuSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'menuItem',
  localField: '_id',
});

menuSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
