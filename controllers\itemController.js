const { createOne, getOne, deleteOne, updateOne, getAll } = require('./handlerFactory');
const Item = require('../models/Item');

exports.createItem = createOne(Item);
exports.getItem = getOne(Item);
exports.deleteItem = deleteOne(Item);
exports.updateItem = updateOne(Item);
exports.getAllItems = getAll(Item);