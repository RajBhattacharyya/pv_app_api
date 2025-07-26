const mongoose = require('mongoose');

const eventDaySchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  dayName: String,
  date: { type: Date, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('EventDay', eventDaySchema);