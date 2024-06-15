const express = require('express')

const {
    getAllReviews,
    createReview,
    deleteReview,
    updateReview,
    setTourUserIds,
    getReview
} = require('../controllers/reviewController')

const { protect, restrictToByRole } = require(`../controllers/authController.js`)

const router = express.Router({mergeParams: true })

router.use(protect)

router
    .route('/')
    .get(getAllReviews)
    .post(
        restrictToByRole('user'), 
        setTourUserIds,
        createReview
    )

router
    .route('/:id')
    .get(getReview)
    .get(getAllReviews)
    .patch(restrictToByRole('user', 'admin'), updateReview)
    .delete(restrictToByRole('user', 'admin'), deleteReview)

module.exports = router