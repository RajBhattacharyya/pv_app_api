const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/**
 * Delete a document by ID.
 * @param {Model} Model - Mongoose model.
 */
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({ status: "success", data: null });
  });

/**
 * Update a document by ID.
 * @param {Model} Model - Mongoose model.
 */
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedDoc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({ status: "success", data: { data: updatedDoc } });
  });

/**
 * Create a new document.
 * @param {Model} Model - Mongoose model.
 */
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: "success", data: { data: doc } });
  });

/**
 * Get a document by ID.
 * @param {Model} Model - Mongoose model.
 */
exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({ status: "success", data: { data: doc } });
  });

/**
 * Get all documents with pagination and filtering.
 * @param {Model} Model - Mongoose model.
 */
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find();

    // Apply filters if provided
    if (req.query.filter) {
      query = query.find(JSON.parse(req.query.filter));
    }

    // Apply sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort.split(",").join(" "));
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const docs = await query;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: { data: docs },
    });
  });