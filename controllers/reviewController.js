const Review = require('../models/reviewModel')
const AppError = require('../utils/AppError')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

exports.getAllReviews = catchAsync( async (req, res, next) => {
    const features = new APIFeatures(Review.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

        const reviews = await features.query

        res.status(200).json({
            status: 'succes',
            requestedAt: req.requestTime,
            results: reviews.length,
            data: {
                reviews
            }
        })
})

exports.createReview = catchAsync( async (req, res, next) => {
    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourID
    if(!req.body.user) req.body.user = req.user.id
    console.log(req.user.id)
    console.log(req.user)
    const newReview = await Review.create(req.body)

    res.status(201).json({
        status: 'succuss',
        data: {
            review: newReview
        }
    })
})