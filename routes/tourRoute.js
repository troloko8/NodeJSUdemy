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
} = require(`./../controllers/tourController.js`)
// } = require(`${__dirname}/../controllers/tourController.js`)

const router = express.Router()
// PARAM it's a middleware that calls when using a URL with defined param in URL
// router.param('id', checkID)

router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAlltours)

router
    .route('/tour-stats')
    .get(getTourStats)

router
    .route('/monthly-plan/:year')
    .get(getMonthlyPlan)

router
    .route('/')
    .get(getAlltours)
    .post(checkBody, createTour)

// app.get('/api/v1/tours', getAlltours)
// app.post('/api/v1/tours', createTour)

// url/:x/:y? - it's optional param
router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)

// app.get('/api/v1/tours/:id', getTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

module.exports = router