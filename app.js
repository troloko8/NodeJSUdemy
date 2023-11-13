const express = require('express')
const morgan = require('morgan')

const AppError = require(`./utils/AppError`)
const errorHandler = require('./controllers/errorController')
const tourRouter = require(`${__dirname}/routes/tourRoute`)
const userRouter = require(`${__dirname}/routes/tourRoute`)

const app = express()

// 1)MIDDLWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')) // for more info to terminal
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`)) // sets up a new root folder for URL row // work for static files

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