const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  mainIngredient: { type: String, required: true },
  itemName: { type: String, required: true },
  mainIngredientAmount: String,
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'spicy', 'sweet'],
    default: 'mild' // Added a default value
  },
  details: String,
  isSpecial: { type: Boolean, default: false },
  itemCategory: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan'],
    required: true
  },
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;