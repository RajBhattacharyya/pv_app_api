const FoodBooking = require("../models/FoodBooking");
const mongoose = require('mongoose');
const Meal = require("../models/Meal");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");

exports.createFoodBooking = factory.createOne(FoodBooking);
exports.deleteFoodBooking = factory.deleteOne(FoodBooking);
exports.getAllFoodBookings = factory.getAll(FoodBooking);
exports.updateFoodBooking = factory.updateOne(FoodBooking);

exports.getFoodBookingByUser = catchAsync(async (req, res, next) => {
    const userId = req.body?.userId || req.params?.userId;
    if (!userId) {
        return res.status(403).json({ success: false, message: "Login first" });
    }
    const bookingByUser = await FoodBooking.find({ userId })
        .populate("eventId", "eventName endDate")
        .populate("eventDayId", "dayName");

    res.status(200).json({
        status: "success",
        results: bookingByUser.length,
        data: { bookingByUser },
    });
});

exports.getFoodBookingByDay = catchAsync(async (req, res, next) => {
    const { eventDayId } = req.body;
    if (!eventDayId) {
        return res.status(400).json({ success: false, message: "eventDayId is required" });
    }
    const foodBookingByDay = await FoodBooking.find({ eventDayId })
        .populate({
            path: "userId",
            select: "userName name flatNo block"
        })
        .populate({
            path: "cartItems.meal",
            select: "mealName mealCategory"
        });

    res.status(200).json({
        results: foodBookingByDay.length,
        status: "success",
        data: { foodBookingByDay },
    });
});

exports.getBooking = catchAsync(async (req, res, next) => {
    const bookingId = req.body?.bookingId || req.params?.bookingId;
    if (!bookingId) {
        return res.status(400).json({ success: false, message: "Booking ID is required" });
    }

    const booking = await FoodBooking.findById(bookingId)
        .populate("userId", "userName name")
        .populate("eventId", "eventName endDate")
        .populate("eventDayId", "dayName date")
        .populate({ path: "cartItems.meal", select: "mealName price" });

    if (!booking) {
        return res.status(404).json({ status: "fail", message: "No booking found with that ID" });
    }

    res.status(200).json({ status: "success", data: booking });
});

exports.getEventDayBookingDetails = catchAsync(async (req, res, next) => {
    const { eventDayId } = req.params;
    if (!eventDayId) {
        return res.status(400).json({ success: false, message: "eventDayId is required" });
    }

    const eventDayObjectId = new mongoose.Types.ObjectId(eventDayId);

    const bookingAggregation = await FoodBooking.aggregate([
        { $match: { eventDayId: eventDayObjectId, currentState: "approved" } },
        { $unwind: { path: '$cartItems', preserveNullAndEmptyArrays: false } },
        {
            $lookup: {
                from: 'meals',
                localField: 'cartItems.meal',
                foreignField: '_id',
                as: 'mealDetails'
            }
        },
        { $unwind: { path: '$mealDetails', preserveNullAndEmptyArrays: false } },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' },
                mealBreakdown: {
                    $push: {
                        mealId: '$cartItems.meal',
                        mealName: '$mealDetails.mealName',
                        mealType: '$mealDetails.mealType',
                        mealCategory: '$mealDetails.mealCategory',
                        quantity: '$cartItems.quantity',
                        mealPrice: '$mealDetails.price'
                    }
                }
            }
        }
    ]);

    if (bookingAggregation.length === 0) {
        const bookingCount = await FoodBooking.countDocuments({ eventDayId: eventDayObjectId });
        const sampleBooking = await FoodBooking.findOne({ eventDayId: eventDayObjectId }).lean();

        if (sampleBooking) {
            const mealIds = sampleBooking.cartItems.map(item => item.meal);
            await Meal.find({ _id: { $in: mealIds } });
        }
    }

    const result = bookingAggregation[0] || {
        totalBookings: 0,
        totalAmount: 0,
        mealBreakdown: []
    };

    const mealCategories = {
        veg: result.mealBreakdown.filter(m => m.mealCategory === 'veg').reduce((sum, m) => sum + m.quantity, 0),
        nonVeg: result.mealBreakdown.filter(m => m.mealCategory === 'non-veg').reduce((sum, m) => sum + m.quantity, 0),
        vegan: result.mealBreakdown.filter(m => m.mealCategory === 'vegan').reduce((sum, m) => sum + m.quantity, 0),
    };

    const mealCountById = result.mealBreakdown.reduce((acc, meal) => {
        acc[meal.mealId.toString()] = (acc[meal.mealId.toString()] || 0) + meal.quantity;
        return acc;
    }, {});

    const response = {
        totalBookings: result.totalBookings,
        totalAmount: result.totalAmount,
        mealCountById,
        mealCategories,
        detailedMealBreakdown: result.mealBreakdown
    };

    res.status(200).json(response);
});