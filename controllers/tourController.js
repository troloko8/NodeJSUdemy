const Tour = require('../models/tourModels')
const AppError = require('../utils/AppError.js')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

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


exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'price,name,ratingAverage,summary,difficulty'
    next()
}


exports.getAlltours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, { path: 'reviews' })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)

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
})

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    if (!lat || !lng) {
        return next(new AppError("Please provide latitude and longitude in latlng format", 400))
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    })

    res.status(200).json({
        status: 'success',
        length: tours.length,
        data: {
            data: tours
        }
    })
})