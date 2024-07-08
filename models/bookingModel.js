const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.schema.ObjectId,
        ref: 'Tour',
        required: [true, 'booking must belong to a Tour']
    },
    user: {
        type: mongoose.schema.ObjectId,
        ref: 'Tour',
        required: [true, 'booking must belong to a Tour']
    },
    price: {
        type: Number,
        required: [true, 'booking ,ust have a price']
    },
    createdAt: Data,
    default: Date.now(),
    paid: {
        type: Boolean,
        default: true
    }
})

reviewSchema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })
} )

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking
