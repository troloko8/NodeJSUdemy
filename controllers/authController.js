const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const sendEmail = require('../utils/email')

function signToken(id) {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN })
}

function createSendToken(user, statusCode, res) {
    const token = signToken(user._id)

    //this cookies can be just stored, recieve and send back to server
    res.cookie('jwt', token, {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)),
        secure: process.env.NODE_ENV !== 'development', // will only be send just if connection is HTTPS
        httpOnly: true // make that cookies can't be modified or accesed in any way
    })

    //romove paasword from output
    user.password = undefined

    res.status(statusCode).json({
        status: 'succes',
        token,
        data: {
            user
        }
    })
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

    createSendToken(newUser, 201, res)
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

    createSendToken(user, 200, res)
}))

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true // make that cookies can't be modified or accesed in any way
    })

    res
        .status(200)
        .json({
            status: 'success'
        })
}

exports.protect = catchAsync((async (req, res, next) => {
    const auth = req.headers.authorization
    let token

    if (auth && auth.startsWith('Bearer')) {
        token = auth.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
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


exports.restrictToByRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log("HERE")
            return next(new AppError("You don't have permission to do this action", 403)) // 403 means forbidden
        }

        next()
    }
}

exports.isLoggedIn = (async (req, res, next) => {
    if (req?.cookies?.jwt) {
        try {
            // 1) verify token
            const decodedToken = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            // 2) Check of the user exists
            const freshUser = await User.findById(decodedToken.id)
            if (!freshUser) {
                return next()
            }
            
            // 3) Check if user changed password after the token was issued
            if (freshUser.changedPasswordAfter(decodedToken.iat)) { // timestamp when was created this toke
                return next()
            }
            
            //THERE IS LOGGIN USER
            res.locals.user = freshUser // variable for pug views

            return next()   
        } catch (error) {
            return next()   
        }
    }

    next()
})

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) get user based on Posted email
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new AppError("There is no user with this email adress"), 404)
    }
    // 2) gen random token

    const resetToken = user.createPasswordResetToke()
    user.save({ validateBeforeSave: false }) // disable all validtion in this Schema

    // 3) send email with this token
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL} \nIf you didn't forget your password please ignore this email`

    try {
        await sendEmail({
            email: user.email,
            subgect: "This link will be active dusting 19 minutes",
            message,
        })
    } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined

        await user.save({ validateBeforeSave: false })

        return next(new AppError("There was an error sending the email. Try again later", 500))
    }


    res.status(200).json({
        status: 'succes',
        message: "Token send to email"
    })

})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get an user based on a token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')


    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
        // passwordResetExpires: { $gt: new Date() }
    })

    // 2) If token has not expired and there is user, set the new password
    if (!user) {
        next(new AppError("Token is invalid or has expired", 400))
    }

    // 3) Update changedPasswordAt property for the current user
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()

    // 4) Log the user in send JWT

    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User
        .findOne({ _id: req.user.id })
        .select('+password')
    // const user = req.user // from pretect 
    const { curPassword, password, passwordConfirm } = req.body

    // 2) Check if POSTed user password is correct
    if (!(await user.correctPassword(curPassword, user.password))) {
        next(new AppError("Your current password is wrong", 401))
    } else if (curPassword === password) {
        next(new AppError("A new password should not be as previous one", 400))
    }

    // 3) if so update password
    user.password = password
    user.passwordConfirm = passwordConfirm

    await user.save()

    // 4) Log user in and send JWT token
    createSendToken(user, 200, res)
})