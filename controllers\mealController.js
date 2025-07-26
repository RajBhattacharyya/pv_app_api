const Meal = require('../models/Meal');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.createMeal = factory.createOne(Meal);
exports.getMeal = factory.getOne(Meal);
exports.updateMeal = factory.updateOne(Meal);
exports.deleteMeal = factory.deleteOne(Meal);

exports.getAllMeals = factory.getAll(Meal);

exports.getMealByDay = catchAsync(async (req, res, next) => {
  const eventDayId = req.body?.eventDayId || req.params?.eventDayId;
  if (!eventDayId) {
    return res.status(400).json({ success: false, message: "eventDayId is required." });
  }
  try {
    const meals = await Meal.find({ eventDayId }).populate('items');
    res.status(200).json({ success: true, data: meals });
  } catch (error) {
    next(error);
  }
});

exports.getMealWithItems = catchAsync(async (req, res, next) => {
  const { mealId } = req.params;
  try {
    const meal = await Meal.findById(mealId).populate('items');
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.status(200).json(meal);
  } catch (error) {
    next(error);
  }
});