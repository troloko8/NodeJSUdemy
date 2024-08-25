const express = require('express')
const { 
    getOverview, 
    getTour,
    getLoginForm,
    getAccount,
    updateUserData,
    getMyTours,
    alerts
} = require('../controllers/viewsController')
const { 
    isLoggedIn, protect 
} = require('../controllers/authController')
const { createBookingCheckout } = require('../controllers/bookingController.js')

const router = express.Router()

router.use(alerts)

// router.use(isLoggedIn)

router.get(
    '/', 
    // createBookingCheckout, 
    isLoggedIn, 
    getOverview
)

router.get('/tour/:name', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/me', protect, getAccount)
router.get('/my-tours', protect, getMyTours)

router.post('/submit-user-data', protect, updateUserData)

module.exports = router
