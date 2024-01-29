const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please tell us your name!'] },
  email: {
    type: String,
    required: [true, 'Please tell us your emali!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a vailid email!'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
  },
  photo: String,
  role: { type: String, enum: ['admin', 'user', 'staff'], default: 'user' },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
