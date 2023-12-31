const Tour = require('../models/tourModels')
const catchAsync = require('../utils/catchAsync')


exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) get tour data from collection
    const tours = await Tour.find()

    // 2) Build template

    // 3) Render this template using tours data from  1)

    res
        .status(200)
        .render('overview', {
            title: 'All tours',
            tours
        })
})

exports.getTour = catchAsync(async (req, res) => {
    // 1) get  data for the requested tour(inclusing reviews and guides)
        const tour = await Tour.findOne({slug: req.params.name}).populate({
            path: 'reviews',
            fields: 'review rating user'
        })
        
    // 2) Buld template

    // 3) Render template using data from step 1

    res
        .status(200)
        .render('tour', {
            title: `${tour.name}`,
            tour
        })
})