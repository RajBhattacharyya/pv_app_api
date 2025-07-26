const FoodCart = require("../models/FoodCart");
const catchAsync = require("../utils/catchAsync");
const factory = require('./handlerFactory');
const Meal = require('../models/Meal');
const AppError = require('../utils/appError');

// Reuse existing factory methods where possible
exports.createCart = factory.createOne(FoodCart);
exports.getCart = factory.getOne(FoodCart);
exports.updateCart = factory.updateOne(FoodCart);

/**
 * Create a cart for a user if one doesn't exist.
 * @route POST /createCartForUser
 */
exports.createCartForUser = catchAsync(async (req, res, next) => {
 try {
 const { userId } = req.body;
 const existingCart = await FoodCart.findOne({ user: userId });
 if (existingCart) {
 return res.status(400).json({
 status: 'error',
 message: 'Cart already exists for the user'
 });
 }
 const newCart = new FoodCart({ user: userId });
 await newCart.save();
 return next();
 } catch (error) {
 next(error);
 }
});

/**
 * Add an item to the user's cart.
 * @route POST /addItemToCart
 */
exports.addItemToCart = catchAsync(async (req, res) => {
 try {
 const { userId, mealId, quantity } = req.body;
 const meal = await Meal.findById(mealId);
 if (!meal) {
 return res.status(404).json({ message: 'Meal not found' });
 }

 let cart = await FoodCart.findOne({ user: userId });
 if (!cart) {
 cart = new FoodCart({ user: userId });
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
 } catch (error) {
 console.error(error);
 res.status(500).json({ message: 'Internal Server Error' });
 }
});

/**
 * Increment the quantity of an item in the cart.
 * @route PATCH /incrementItemQuantity
 */
exports.incrementItemQuantity = catchAsync(async (req, res, next) => {
 try {
 const { userId, mealId } = req.body;
 const cart = await FoodCart.findOne({ user: userId });
 if (!cart) {
 return next(new AppError('Cart not found for user.', 404));
 }

 const itemIndex = cart.cartItems.findIndex(item => item.meal.toString() === mealId);
 if (itemIndex === -1) {
 return next(new AppError('Item not found in cart.', 404));
 }

 const meal = await Meal.findById(mealId);
 if (!meal) {
 return next(new AppError('Meal not found.', 404));
 }

 cart.cartItems[itemIndex].quantity += 1;
 cart.totalAmount += meal.price;
 await cart.save();
 return res.status(200).json({ status: 'success', data: cart });
 } catch (error) {
 next(error);
 }
});

/**
 * Decrement the quantity of an item in the cart.
 * @route PATCH /decrementItemQuantity
 */
exports.decrementItemQuantity = catchAsync(async (req, res, next) => {
 try {
 const { userId, mealId } = req.body;
 const cart = await FoodCart.findOne({ user: userId });
 if (!cart) {
 return next(new AppError('Cart not found for user.', 404));
 }

 const itemIndex = cart.cartItems.findIndex(item => item.meal.toString() === mealId);
 if (itemIndex === -1) {
 return next(new AppError('Item not found in cart.', 404));
 }

 const meal = await Meal.findById(mealId);
 if (!meal) {
 return next(new AppError('Meal not found.', 404));
 }

 if (cart.cartItems[itemIndex].quantity <= 0) {
 return next(new AppError('Quantity cannot be less than 0. Use remove instead.', 400));
 }

 cart.cartItems[itemIndex].quantity -= 1;
 cart.totalAmount -= meal.price;
 await cart.save();
 return res.status(200).json({ status: 'success', data: cart });
 } catch (error) {
 next(error);
 }
});

/**
 * Get the cart for a user.
 * @route GET /getCartByUser
 */
exports.getCartByUser = catchAsync(async (req, res, next) => {
 try {
 const { userId } = req.body;
 const cart = await FoodCart.findOne({ user: userId }).populate({
 path: 'cartItems.meal',
 select: 'eventId eventDayId',
 });
 if (!cart) {
 return next(new AppError('Cart not found for user.', 404));
 }
 return res.status(200).json({ status: 'success', data: cart });
 } catch (error) {
 next(error);
 }
});

/**
 * Clear the cart.
 * @route PATCH /clearCart/:id
 */
const clearCart = catchAsync(async (req, res) => {
 try {
 const cart = await FoodCart.findById(req.params.id);
 if (!cart) {
 return res.status(404).json({ message: 'Cart not found' });
 }
 cart.cartItems = [];
 cart.totalAmount = 0;
 await cart.save();
 return res.status(200).json({
 message: 'Cart cleared successfully',
 cart
 });
 } catch (error) {
 console.error(error);
 res.status(500).json({ message: 'Internal Server Error' });
}
});

exports.clearCart = clearCart;