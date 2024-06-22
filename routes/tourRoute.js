const express = require('express')
const {
    getTour,
    getAlltours,
    createTour,
    updateTour,
    deleteTour,
    checkBody,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances,
    uploadTourImages,
    resizeTourImages,
} = require(`./../controllers/tourController.js`)
const { protect, restrictToByRole } = require(`./../controllers/authController.js`)
// const {createReview} = require(`./../controllers/reviewController.js`) 
const reviewRouter = require('./reviewRoute')
// } = require(`${__dirname}/../controllers/tourController.js`)

const router = express.Router()
// PARAM it's a middleware that calls when using a URL with defined param in URL
// router.param('id', checkID)

// MOUNTING ROUTERS
router.use('/:tourID/reviews', reviewRouter)

router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAlltours)

router
    .route('/tour-stats')
    .get(getTourStats)

router
    .route('/monthly-plan/:year')
    .get(
        protect,
        restrictToByRole('admin', 'lead-guide', 'guide'),
        getMonthlyPlan
    )

router
    .route('/tours-within/:distances/center/:latlng/unit/:unit')
    .get(getToursWithin)

router
    .route('/distance/latlng/:latlng/unit/:unit')
    .get(getDistances)

router
    .route('/')
    .get(getAlltours)
    .post(
        protect,
        restrictToByRole('admin', 'lead-guide'),
        createTour
    )

// app.get('/api/v1/tours', getAlltours)
// app.post('/api/v1/tours', createTour)

// url/:x/:y? - it's optional param
router
    .route('/:id')
    .get(getTour)
    .patch(
        protect, 
        restrictToByRole('admin', 'lead-guide'), 
        uploadTourImages,
        resizeTourImages,
        updateTour
    )
    .delete(protect, restrictToByRole('admin', 'lead-guide'), deleteTour)
//restrictToByRole('admin', 'lead-guide)

// router
//     .route('/:tourID/reviews')
//     .post(
//         protect,
//         restrictToByRole('user'),
//         createReview
//     )

module.exports = router