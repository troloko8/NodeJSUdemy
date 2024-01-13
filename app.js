const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const AppError = require(`./utils/AppError`)
const errorHandler = require('./controllers/errorController')
const tourRouter = require(`./routes/tourRoute`)
const userRouter = require(`./routes/userRoute`)
const reviewRouter = require(`./routes/reviewRoute`)
const viewRouter = require(`./routes/viewRoutes`)

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Serving static files
// app.use(express.static(`${__dirname}/public`)) // sets up a new root folder for URL row // work for static files
app.use(express.static(path.join(__dirname, 'public'))) // sets up a new root folder for URL row // work for static files

// 1)GLOBAL MIDDLWARES
// Set security HTTP headers
app.use(helmet())
// Development log in
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')) // for more info to terminal
}

// limiter for max request from one IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP please try again in an hour!"
})

app.use('/api', limiter)

// Body parser, reading data from body into req.body 
app.use(express.json({ limit: '10kb' })) // body size limiter
app.use(cookieParser()) // parses cookies from the cookies in brouser

// DATA sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())
// Prevent parametr polution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingAverage',
        'ratingsQuantity',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}))

// Test middlware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

// 3) ROUTES

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
    next(new AppError(
        `Can't find ${req.originalUrl} on this server`,
        404
    ))
})

// 4) ERROR HANDLING MIDDLWARE
app.use(errorHandler)

module.exports = app