const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'booking must belong to a Tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'booking must belong to a Tour']
    },
    price: {
        type: Number,
        required: [true, 'booking ,ust have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
})

bookingSchema.pre(/^find/, function(next, some) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })

    next()
} )

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking
