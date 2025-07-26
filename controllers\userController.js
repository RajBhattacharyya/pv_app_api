const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const updateIntoPayment = async (req, res, next, intoPayment) => {
  const { userId } = req.body;
  const user = await User.findByIdAndUpdate(userId, { intoPayment }, { new: true });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  user.password = undefined;
  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

exports.intoPaymentTrue = catchAsync(async (req, res, next) => {
  await updateIntoPayment(req, res, next, true);
});

exports.intoPaymentFalse = catchAsync(async (req, res, next) => {
  await updateIntoPayment(req, res, next, false);
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select('-password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.getUserByUserName = catchAsync(async (req, res, next) => {
  const { userName } = req.body;
  const user = await User.findOne({ userName }).select('-password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});