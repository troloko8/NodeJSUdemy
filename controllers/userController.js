const User = require("../models/userModel")
const APIFeatures = require("../utils/apiFeatures")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")

const filterReq = (obj, ...allowedFields) => {
    const filteredObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) filteredObj[el] = obj[el]
    })

    return filteredObj
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        status: 'succes',
        requestedAt: req.requestTime,
        results: users.length,
        data: {
            users
        }
    })
})

exports.updateMe = catchAsync( async(req, res, next) => {
    // 1)Create Error if user POSTed password data
    if(req.body.password || req.body.passwordConfirm) {
        return next( new AppError("this route is not for password updates, Please use /updateMyPassword", 400))
    }

    // 2)Update user data 
    const filteredBody = filterReq(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody, 
        {
            new: true, runValidators: true
        })

    res.status(200).json({
        status: 'succes',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync( async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false})

    res
        .status(204)
        .json({
            status: 'succes',
            data: null
        })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'this route is not yet defined'
    })
}

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'this route is not yet defined'
    })
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'this route is not yet defined'
    })
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'this route is not yet defined'
    })
}