const Stripe = require('stripe')
const Tour = require('../models/tourModels')
const Booking = require('../models/bookingModel.js')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const stripe = Stripe((process.env.STRIPE_SECRET_KEY))
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID)

    // 2) Create checkout session
    const product = await stripe.products.create({
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
    })

    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tour.price * 100, // * 100 is correct
        currency: 'usd',
    })

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        mode: 'payment',
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
    })
    // DEPRECATED
    // stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     success_url: `${req.protocol}://${req.get('host')}/`,
    //     cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
    //     customer_email: `${req.user.email}`,
    //     client_refference_id: req.params.tourId,
        // line_items: [
        //     {
        //         name: `${tour.name} Tour`,
        //         description: tour.summary,
        //         images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        //         price: tour.price * 100,
        //         // amount: tour.price * 100,
        //         currency: 'usd',
        //         quantity: 1
        //         // images: [`https://www.natours.dev/img/tours/tour-3-cover.jpg`]
        //     }
        // ]
    // })

    // 3) Create session as a response
    res
        .status(200)
        .json({
            status: 'success',
            session
        })
})

exports.createBookingCheckout = catchAsync( async (req, res, next) => {
    //FIXME THIS is TEMPORARY because it's unsecure everyone can make a booking
    const { tour, user, price } = req.query

    if (!tour && !user && !price) return next()

    await Booking.create({tour, user, price})
    // create new req with new url for view controller
    res.redirect(req.originalUrl.split('?')[0])

    next()
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)