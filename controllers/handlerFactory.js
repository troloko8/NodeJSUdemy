const AppError = require("../utils/AppError")
const APIFeatures = require("../utils/apiFeatures")
const catchAsync = require("../utils/catchAsync")

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    console.log(req.params.id)
    const modelDoc = await Model.findByIdAndDelete(req.params.id)

    // const tours = await Tour.find()

    if (!modelDoc) {
        return next(new AppError(new Error('No document found with that ID', 404)))
    }

    res
        .status(204)
        .json({ // status of success deeleting smth // means no content
            status: 'success',
            data: null
        })
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    console.log(req.body)
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // for returning updated item,
        runValidators: true
    })

    if (!doc) {
        return next(new AppError(new Error('No document found with that ID', 404)))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)

    res.status(201).json({ // 201 status of creating smth
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id)
    if (popOptions) query.populate(popOptions)
    const doc = await query

    // wider analog const tour = await Tour.findOne({_id: req.params.id})
    if (!doc) {
        return next(new AppError(new Error('No document found with that ID', 404)))
    }

    res.status(200).json({
        status: 'succes',
        results: doc.length,
        data: {
            data: doc
        }
    })
})

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // to allow for nested GET revies on tour(hack)
    let filter = {}
    if (req.params.tourID) filter = { tour: req.params.tourID }

    // EXECUTE A QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

    const doc = await features.query
    // const doc = await features.query.explain()// for indexes

    //SEND RESPONSE
    res.status(200).json({
        status: 'succes',
        requestedAt: req.requestTime,
        results: doc.length,
        data: {
            data: doc
        }
    })
})