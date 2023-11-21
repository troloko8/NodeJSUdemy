const Tour = require('../models/tourModels')
const AppError = require('../utils/AppError')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// exports.checkID = (req, res, next, val) => {
//     console.log(`It's id: ${val}`)

//     // if (val * 1 > tours.length) {
//     //     return res.status(404).json({
//     //         status: 'fail',
//     //         message: 'Invalid ID'
//     //     })
//     // }

//     next()
// }

exports.checkBody = (req, res, next) => {
    console.log("Check: ", req.body)
    if (((req.body.name ?? '') === '') || ((req.body.price ?? 0) === 0)) {
        return res.status(404).json({
            status: 'fail',
            message: 'Did\'t find name or price properties'
        })
    }

    next()
}

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)
    // wider analog const tour = await Tour.findOne({_id: req.params.id})

    if (!tour) {
        return next(new AppError(new Error('No tour found with that ID', 404)))
    }

    res.status(200).json({
        status: 'succes',
        results: tour.length,
        data: {
            tour
        }
    })
})

exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'price,name,ratingAverage,summary,difficulty'
    next()
}


exports.getAlltours = catchAsync(async (req, res, next) => {
    // EXECUTE A QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

    const tours = await features.query

    //SEND RESPONSE
    res.status(200).json({
        status: 'succes',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    })
})

exports.createTour = catchAsync(async (req, res, next) => {
    // try {
    const newTour = await Tour.create(req.body)

    res.status(201).json({ // 201 status of creating smth
        status: 'success',
        data: {
            tour: newTour
        }
    })
    // } catch (error) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: error
    //     })
    // }
})

exports.updateTour = catchAsync(async (req, res, next) => {
    console.log(req.body)
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // for returning updated item,
        runValidators: true
    })

    if (!tour) {
        return next(new AppError(new Error('No tour found with that ID', 404)))
    }
    // Tour.findById(req.params.id).updateOne()

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    console.log(req.params.id)
    const tour = await Tour.findByIdAndDelete(req.params.id)

    // const tours = await Tour.find()

    if (!tour) {
        return next(new AppError(new Error('No tour found with that ID', 404)))
    }

    res
        .status(204)
        .json({ // status of success deeleting smth // means no content
            status: 'success',
            data: null
        })
})

// agregation pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                // _id: null, //one group with all data from DB
                // _id: { $toUpper: '$difficulty' }, // adinition manipulation 
                _id: '$difficulty', // separat all agregation by this filed (will be 3 grops by each sort of difficulty)
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort: {
                avgPrice: -1
            }
        },
        // {
        //     $match: {
        //         _id: { $ne: 'easy' }, // repeating of stage and exluding {$ne} the one of created group
        //     }
        // }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1
    console.log(new Date(`${year}-01-01`))
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numOfToursStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { // erase parametr from final result
                _id: 0
            }
        },
        {
            $sort: { month: 1 }
        },
        {
            $limit: 5
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })

    //test
})