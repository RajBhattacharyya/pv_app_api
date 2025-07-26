const EventDay = require("../models/EventDay");
const factory = require("./handlerFactory");
const catchAsync = require('../utils/catchAsync');

exports.createEventDay = factory.createOne(EventDay);
exports.getEventDay = factory.getOne(EventDay);
exports.deleteEventDay = factory.deleteOne(EventDay);
exports.getAllEventDays = factory.getAll(EventDay);
exports.updateEventDay = factory.updateOne(EventDay);

exports.getDayByEvent = catchAsync(async (req, res, next) => {
  const eventId = req.body?.eventId ?? req.params?.eventId;
  if (!eventId) {
    return res.status(400).json({ success: false, message: "EventID is required." });
  }
  const eventDays = await EventDay.find({ eventId }).exec();
  res.status(200).json({
    success: true,
    data: eventDays
  });
});