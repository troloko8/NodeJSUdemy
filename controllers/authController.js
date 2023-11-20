const { promisify } = require('util')
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')

function signToken(id) {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN })
}


exports.signup = catchAsync((async (req, res, next) => {
    // const newUser = await User.create(req.body)
    // Because anyone can send {role: admin} param in previous case
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    })

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'succes',
        token,
        data: {
            user: newUser
        }
    })
}))


exports.login = catchAsync((async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new AppError('Provide email and password', 404))
    }

    const user = await User
        .findOne({ email: email })
        .select('+password') // to select prop which was set up as unselected in MODEL

    const correct = await user?.correctPassword(password, user.password) ?? false

    if (!user || !correct) {
        return next(new AppError('Incorrect email or password', 401)) //401 meeans unauthorize
    }

    const token = signToken(user._id)


    res.status(404).json({
        status: 'succes',
        token
    })
}))

exports.protect = catchAsync((async (req, res, next) => {
    const auth = req.headers.authorization
    let token

    if (auth && auth.startsWith('Bearer')) {
        token = auth.split(' ')[1]
    }

    if (!token) {
        return next(new AppError('You are not logged pls log in to get access'), 401)
    }

    // 2) verification token
    const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // 3) Check of the user exists
    const freshUser = await User.findById(decodedToken.id)

    if (!freshUser) {
        return next(new AppError(
            'The user belonging this token does no longer exist',
            401)
        )
    }

    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decodedToken.iat)) { // timestamp when was created this toke
        return (next(new AppError("User Recently changed password, please log in again", 401)))
    }

    //GRANT ACCES TO PROTECTED ROUTE
    req.user = freshUser
    next()
}))


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(!roles.includes(req.user.role))
        if (!roles.includes(req.user.role)) {
            return next( new AppError("You don't have permission to do this action", 403)) // 403 means forbidden
        }

        next()
    }
}