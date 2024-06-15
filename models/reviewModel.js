const mongoose = require('mongoose')
const Tour = require('./tourModels')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        maxLength: [500, "A review have not be more then 500 characters"],
        minLength: [10, "A review have not be less then 10 characters"],
        required: [true, 'A review must have some text'],
    },
    rating: {
        type: Number,
        min: [1, 'A rating must be above 1.0'],
        max: [5, 'A rating must be above 1.0']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true }, // opt param in order to virutals data come togather with response
    toObject: { virtuals: true }
}
)

// Prevent make duplicated reviews from same user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    //     // select: '-__v'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
        // select: '-__v -passwordChangedAt'
    })

    next()
})

reviewSchema.statics.calcAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingAverage: 4.5
        })
    }
}

reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne()
})

reviewSchema.post(/^findOneAnd/, async function (next) {
    await this.r.constructor.calcAverageRating(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review