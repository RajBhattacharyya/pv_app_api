const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Generates a JWT token for a user.
 * @param {string} id - User ID.
 * @returns {string} JWT token.
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Creates and sends a token to the client.
 * @param {object} user - User document.
 * @param {number} statusCode - HTTP status code.
 * @param {object} res - Express response object.
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

/**
 * Registers a new user.
 */
exports.register = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  // Check for required fields
  if (!userName || !password) {
    return next(new AppError('Please provide username and password', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ userName });
  if (existingUser) {
    if (existingUser.passCheck) {
      return next(new AppError('User already registered. Please log in.', 403));
    } else {
      existingUser.password = password;
      existingUser.passCheck = true;
      await existingUser.save();
      createSendToken(existingUser, 200, res);
      return;
    }
  }

  // Create new user
  const user = new User({ userName, password, passCheck: true });
  await user.save();
  createSendToken(user, 201, res);
});

/**
 * Logs in a user.
 */
exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  // Check for required fields
  if (!userName || !password) {
    return next(new AppError('Please provide username and password', 400));
  }

  // Find user and verify password
  const user = await User.findOne({ userName }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect username or password', 401));
  }

  createSendToken(user, 200, res);
});

/**
 * Handles user onboarding.
 */
exports.onboarding = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const user = await User.findById(id);

  // Check if user is already onboarded
  if (user.onboarded) {
    return next(new AppError('User already onboarded', 400));
  }

  user.onboarded = true;
  await user.save();
  user.password = undefined;
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Protects routes with JWT authentication.
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Extract token from headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token presence
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to access.', 401));
  }

  // Verify token and find user
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  // Check if user exists
  if (!currentUser) {
    return next(new AppError('The user no longer exists.', 401));
  }

  req.user = currentUser;
  next();
});