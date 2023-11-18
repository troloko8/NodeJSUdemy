const User = require("../models/userModel")
const APIFeatures = require("../utils/apiFeatures")
const catchAsync = require("../utils/catchAsync")

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