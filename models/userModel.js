const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

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
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'lead', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Need to write a password'],
        minLength: 8,
        select: false // that it not come back as response
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
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

userSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre('save', async function (next) {
    // Only run this fuction if passwarod is modified and ecrypt it and delete  passwordConfirm
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    next()
})

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })

    next()
})

userSchema.methods.correctPassword = async function (receivedPassword, passwordDB) {
    return await bcrypt.compare(receivedPassword, passwordDB)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

        return JWTTimestamp < changedTimeStamp
    }
    return false
}

userSchema.methods.createPasswordResetToke = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    // console.log({ resetToken }, this.passwordResetToken)

    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User