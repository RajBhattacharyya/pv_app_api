const FoodBooking = require("../models/FoodBooking");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");

exports.createFoodBooking = factory.createOne(FoodBooking);
//exports.getFoodBooking = factory.getOne(FoodBooking);
exports.deleteFoodBooking = factory.deleteOne(FoodBooking);
exports.getAllFoodBookings = factory.getAll(FoodBooking);
exports.updateFoodBooking = factory.updateOne(FoodBooking);

exports.getFoodBookingByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body || req.params;
  if (!userId) {
    return res.status(403).json({ success: false, message: "Login first" });
  }
  const bookingByUser = await FoodBooking.find({ userId })
    .populate({
      path: "eventId",
      select: "eventName endDate",
    })
    .populate({
      path: "eventDayId",
      select: "dayName",
    });

  res.status(200).json({
    status: "success",
    results: bookingByUser.length,
    data: {
      bookingByUser,
    },
  });
});

exports.getFoodBookingByDay = catchAsync(async (req, res, next) => {
  const { eventDayId } = req.body;
  const foodBookingByDay = await FoodBooking.find({ eventDayId });
  res.status(200).json({
    results: foodBookingByDay.length,
    status: "success",
    data: {
      foodBookingByDay,
    },
  });
});

exports.bookingApproval = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const foodBooking = await FoodBooking.findById(id);
  if (foodBooking.isApproved) {
    return next(new AppError("Booking already approved", 400));
  }
  foodBooking.isApproved = true;
  await user.save();
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.body || req.params;
    const booking = await FoodBooking.findById(bookingId)
      .populate({
        path: "userId",
        select: "userName",
      })
      .populate({
        path: "eventId",
        select: "eventName endDate",
      })
      .populate({
        path: "eventDayId",
        select: "dayName",
      });

    if (!booking) {
      return res.status(404).json({
        status: "fail",
        message: "No booking found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};
