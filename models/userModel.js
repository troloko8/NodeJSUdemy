const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Need to write a name user'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Neet to write an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide valid email']
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Need to write a password'],
        minLength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm your password'],
        validate: {
            // THIS JUST WORK ON SAVE / CREATE!!!
            validator: function (el) {
                return el === this.password
            },
            message: "Password are not the same "
        }
    }
})

userSchema.pre('save', async function (next) {
    // Only run this fuction if passwarod is modified and ecrypt it and delete  passwordConfirm
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User