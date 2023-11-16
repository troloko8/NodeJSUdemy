const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')


exports.signup = catchAsync((async (req, res, next) => {
    // const newUser = await User.create(req.body)
    // Because anyone can send {role: admin} param in previous case
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    console.log("HeRE")
    console.log("Id: ", newUser._id, process.env.JWT_SECRET, process.send.JWT_EXPIRES_IN)

    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

    console.log(token)
    res.status(201).json({
        status: 'succes',
        token,
        data: {
            user: newUser
        }
    })
}))