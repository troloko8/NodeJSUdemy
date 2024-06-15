const express = require('express')
const morgan = require('morgan')

const AppError = require(`./utils/AppError`)
const errorHandler = require('./controllers/errorController')
const tourRouter = require(`./routes/tourRoute.js`)
const userRouter = require(`./routes/userRoute`)

const app = express()

// 1)MIDDLWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')) // for more info to terminal
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`)) // sets up a new root folder for URL row // work for static files

app.use('/api', limiter)

// Body parser, reading data from body into req.body 
app.use(express.json({ limit: '10kb' })) // body size limiter
app.use(express.urlencoded({extended: true, limit: '10kb'})) // decoded data from form inputs
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

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

// 3) ROUTES
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    next(new AppError(
        `Can't find ${req.originalUrl} on this server`,
        404
    ))
})

// 4) ERROR HANDLING MIDDLWARE
app.use(errorHandler)

module.exports = app