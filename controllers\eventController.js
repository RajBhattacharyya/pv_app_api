const { createOne, getOne, deleteOne, getAll, updateOne } = require('./handlerFactory');
const Event = require('../models/Event');

exports.createEvent = createOne(Event);
exports.getEvent = getOne(Event);
exports.deleteEvent = deleteOne(Event);
exports.getAllEvents = getAll(Event);
exports.updateEvent = updateOne(Event);