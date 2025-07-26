const FoodCart = require("../models/FoodCart");
const catchAsync = require("../utils/catchAsync");
const factory = require('./handlerFactory');
const Meal = require('../models/Meal');
const AppError = require('../utils/appError');

// Reuse factory methods where applicable
exports.createCart = factory.createOne(FoodCart);
exports.getCart = factory.getOne(FoodCart);
exports.updateCart = factory.updateOne(FoodCart);

/**
 * Create a cart for a user if one doesn't exist.
 * @route POST
 */
exports.createCartForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const existingCart = await FoodCart.findOne({ userId });
  if (existingCart) {
    return res.status(400).json({
      status: 'error',
      message: 'Cart already exists for the user',
    });
  }
  const newCart = new FoodCart({ user: userId });
  await newCart.save();
  return next();
});

/**
 * Add an item to the user's cart.
 * @route PATCH
 */
exports.addItemToCart = catchAsync(async (req, res) => {
  const { userId, mealId, quantity } = req.body;
  const meal = await Meal.findById(mealId);
  if (!meal) {
    return res.status(404).json({ message: 'Meal not found' });
  }

  let cart = await FoodCart.findOne({ userId });
  if (!cart) {
    cart = new FoodCart({ userId });
    await cart.save();
  }

  const existingItemIndex = cart.cartItems.findIndex(item => item.meal.toString() === mealId);
  if (existingItemIndex !== -1) {
    cart.cartItems[existingItemIndex].quantity += quantity;
  } else {
    cart.cartItems.push({ meal: mealId, quantity });
  }
  cart.totalAmount += meal.price * quantity;
  await cart.save();
  return res.status(200).json(cart);
});

/**
 * Increment the quantity of an item in the cart.
 * @route PATCH
 */
exports.incrementItemQuantity = catchAsync(async (req, res, next) => {
  const { userId, mealId } = req.body;
  const cart = await FoodCart.findOne({ userId });
  if (!cart) {
    return next(new AppError('Cart not found for user.', 404));
  }

  const item = cart.cartItems.find(item => item.meal.toString() === mealId);
  if (!item) {
    return next(new AppError('Item not found in cart.', 404));
  }

  const meal = await Meal.findById(mealId);
  if (!meal) {
    return next(new AppError('Meal not found.', 404));
  }

  item.quantity += 1;
  cart.totalAmount += meal.price;
  await cart.save();
  return res.status(200).json({ status: 'success', data: cart });
});

/**
 * Decrement the quantity of an item in the cart.
 * @route PATCH
 */
exports.decrementItemQuantity = catchAsync(async (req, res, next) => {
  const { userId, mealId } = req.body;
  const cart = await FoodCart.findOne({ userId });
  if (!cart) {
    return next(new AppError('Cart not found for user.', 404));
  }

  const item = cart.cartItems.find(item => item.meal.toString() === mealId);
  if (!item) {
    return next(new AppError('Item not found in cart.', 404));
  }

  const meal = await Meal.findById(mealId);
  if (!meal) {
    return next(new AppError('Meal not found.', 404));
  }

  if (item.quantity <= 0) {
    return next(new AppError('Quantity cannot be less than 0. Use remove instead.', 400));
  }

  item.quantity -= 1;
  cart.totalAmount -= meal.price;
  await cart.save();
  return res.status(200).json({ status: 'success', data: cart });
});

/**
 * Get the cart by user ID.
 * @route GET
 */
exports.getCartByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const cart = await FoodCart.findOne({ userId }).populate({
    path: 'cartItems.meal',
    select: 'eventId eventDayId',
  });
  if (!cart) {
    return next(new AppError('Cart not found for user.', 404));
  }
  return res.status(200).json({ status: 'success', data: cart });
});

/**
 * Clear the cart.
 * @route PATCH
 * @param {string} id - Cart ID
 */
const clearCart = (Model) => catchAsync(async (req, res, next) => {
  const cart = await Model.findById(req.params.id);
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }
  cart.cartItems = [];
  cart.totalAmount = 0;
  await cart.save();
  return res.status(200).json({
    message: 'Cart cleared successfully',
    cart,
  });
});

exports.clearCart = clearCart(FoodCart);