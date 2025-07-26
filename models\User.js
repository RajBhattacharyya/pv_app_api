const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  block: String,
  userName: { type: String, required: true, unique: true },
  flatNo: String,
  password: { type: String, minlength: 8 },
  coins: { type: Number, default: 0 },
  email: { type: String, sparse: true },
  contactNo: { type: String, sparse: true },
  userType: { type: String, enum: ['owner', 'tenant'] },
  name: String,
  userRole: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  onboarded: { type: Boolean, default: false },
  passCheck: { type: Boolean, default: false },
  isPreRegistered: { type: Boolean, default: true },
  intoPayment: { type: Boolean, default: false },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);