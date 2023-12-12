const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const User = require('./userModel')

//create schema for tour collection
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        // unique: [false, 'Tour with this name is existed'], // means that with the name can be just 1 item
        trim: true,
        maxLength: [40, 'A tour name must have less or equal then 40 characters'],
        minLength: [10, 'A tour name must have more or equal then 10 characters'],
        //External library
        // validate: [validator.isAlpha, ' A tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a grop size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a diffucalty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Dufficulty is eather easy, medium, difficulty'
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'A rating must be above 1.0'],
        max: [5, 'A rating must be above 1.0'],
        set: (value) => Math.round(value * 10)/10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: 'dicountPrice: ({VALUE}) should be less then price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cove image']
    },
    image: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // means that this prop will in res for user just in DB
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // EMBEDED
    // guides: Array 
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true }, // opt param in order to virutals data come togather with response
    toObject: { virtuals: true }
}
)

// tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' });


// Virtual data it's data which will not be save in DB
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// DOCUMENT MIDDLWARE: 

tourSchema.pre('save', function (next) { //runs fefore.save event
    console.log('pre: ', this)

    this.slug = slugify(this.name, { lower: true })
    next()
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    }) // makes a reference to the idies in rhis object

    next()
})

// EMBEDDED  referencing aproach
// tourSchema.pre('save', async function(next) {
//     const guidePromises =  this.guides.map(async id =>  await User.findById(id))

//     this.guides = await Promise.all(guidePromises)

//     console.log()

//     next()
// })


tourSchema.post('save', function (doc, next) { //runs fefore.save event
    this.slug = slugify(this.name, { lower: true })
    next()
})

// Query MIDDLWARE

// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {// means before all comands which starts with "find"
    this.find({ secretTour: { $ne: true } })

    this.dateStart = new Date()
    next()
})

tourSchema.post(/^find/, function (docs, next) {
    console.log("time of executing: ", new Date() - this.dateStart, ' ms')

    next()
})

// AGGREGATION MIDDLWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    next()
})



const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour

// Creates model
// EXAMPLE

// const testTour = new Tour({
//     name: 'The forset hiker 2',
//     price: 501,
//     rating: 4.9
// })

// testTour
//     .save()
//     .then(doc => {
//         console.log(doc)
//     })
//     .catch(err => {
//         console.log("ERROR: ", err)
//     })
