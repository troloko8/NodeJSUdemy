const Tour = require('../models/tourModels')
const User = require('../models/userModel.js')
const AppError = require('../utils/AppError')
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

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) get  data for the requested tour(inclusing reviews and guides)
        const tour = await Tour.findOne({slug: req.params.name}).populate({
            path: 'reviews',
            fields: 'review rating user'
        })

    if (!tour) { 
        return next(new AppError('There is no tour with that name', 404))
    }
    // 2) Buld template

    // 3) Render template using data from step 1

    res
        .status(200)
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        })
})

exports.getLoginForm = catchAsync( async (req, res, next) => {
    res
        .status(200)
        .set(
            'Content-Security-Policy',
            "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js 'unsafe-inline' 'unsafe-eval';",
        )
        .render('login', {
            title: `Login into your account`,
        })
        
})

exports.getAccount = (req, res) => {
    res
        .status(200)
        // .set(
        //     'Content-Security-Policy',
        //     "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js 'unsafe-inline' 'unsafe-eval';",
        // )
        .render('account', {
            title: `Login into your account`,
        })
}

exports.updateUserData = catchAsync(async (req, res , next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    )

    res
        .render('account', {
            title: `Login into your account`,
            user: updatedUser
        })
})