const express = require('express')

const {
    getCheckoutSession, getAllBookings, createBooking, getBooking, updateBooking, deleteBooking,
} = require('../controllers/bookingController')

const { protect, restrictToByRole } = require(`../controllers/authController.js`)

const router = express.Router({mergeParams: true })

router.use(protect)

router
    // .route('/checkout-session:tourID')
    .get(
        '/checkout-session/:tourID', 
        getCheckoutSession
    )

router.use(restrictToByRole('admin', 'lead-guide'))

router.route('/')
        .get(getAllBookings)
        .post(createBooking)

router.route('/:id')
    .get(getBooking)
    .patch(updateBooking)
    .delete(deleteBooking)

module.exports = router