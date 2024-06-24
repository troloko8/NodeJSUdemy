const express = require('express')

const {
    getCheckoutSession,
} = require('../controllers/bookingController')

const { protect, restrictToByRole } = require(`../controllers/authController.js`)

const router = express.Router({mergeParams: true })

router
    // .route('/checkout-session:tourID')
    .get(
        '/checkout-session/:tourID', 
        protect, 
        getCheckoutSession
    )

module.exports = router