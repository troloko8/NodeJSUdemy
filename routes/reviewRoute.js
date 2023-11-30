const express = require('express')

const {
    getAllReviews,
    createReview
} = require('../controllers/reviewController')

const { protect, restrictToByRole } = require(`../controllers/authController.js`)


const router = express.Router()

router
    .route('/')
    .get(getAllReviews)
    .post(protect, restrictToByRole('user'), createReview)


module.exports = router