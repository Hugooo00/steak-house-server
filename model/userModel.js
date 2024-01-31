const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    unique: true,
  },
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
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password confirmation does not match the password!',
    },
  },
  photo: String,
  role: { type: String, enum: ['admin', 'user', 'staff'], default: 'user' },
  passwordChangeAt: { type: Date, default: Date.now },
  passwordResetToken: String,
  passwordResetExpires: Date,
  activeState: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Encrypt password before saving the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Reset passwordChangedAt field after password changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

// When activeState field of user is false, don't show this user
userSchema.pre(/^find/, function (next) {
  this.find({ activeState: { $ne: false } });
  next();
});

// Method: Compares the input password with the user's stored password.
userSchema.methods.comparePassword = async function (
  inputPassword,
  userPassword,
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

// Method: Check if user changed password after token was issued
userSchema.methods.checkPasswordChangeAfterToken = function (JWTIssuedAt) {
  if (this.passwordChangeAt) {
    const changedPasswordAt = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );
    console.log(changedPasswordAt, JWTIssuedAt);

    return JWTIssuedAt < changedPasswordAt;
  }
  return false;
};

// Generate random encrypted reset token
userSchema.methods.generatePasswordResetToken = function () {
  // Generate Random Reset Token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Encrypted the Reset Token(Later will save it to database)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
