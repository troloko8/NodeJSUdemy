const mongoose = require('mongoose')
const dotenv = require('dotenv')// for configurate our dev/prod environment variables

// uncaught Exeption error

process.on('uncaughtExeption', err => {
    console.log(err.name, err.message)
    console.log('____ ____ ___UNCAUGHT EXEPTION!')
    process.exit(1)
})

dotenv.config({ path: './config.env' })

const app = require('./app')

const port = process.env.PORT || 3000

const DB = process.env.DATABASE


mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB connection succesfull")
})

const server = app.listen(port, () => {
    console.log("app port " + port)
}) // start up a server

// Handeling unhandled Rejection error

process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('____ ____ ___UNHANDLELING REJECTION!')

    server.close(() => {
        process.exit(1)
    })
})