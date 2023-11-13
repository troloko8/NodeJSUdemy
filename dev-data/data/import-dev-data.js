const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')
const Tour = require('../../models/tourModels')


dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB connection succesfull")
})

// READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

// IMPORT DATA INTO DB

const importData = async () => {
    try {
        await Tour.create(tours)
        console.log('Tours uploaded')
    } catch (error) {
        console.log(error)
    }
}

// DELETE ALL DATA FROM COLLECTION


const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('Tours deleted')
    } catch (error) {
        console.log(error)
    }
}

console.log(process.argv)

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}

process.exit()