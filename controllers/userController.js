const multer = require('multer')
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")
const factory = require('./handlerFactory')

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users')
    }, 
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

const filterReq = (obj, ...allowedFields) => {
    const filteredObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) filteredObj[el] = obj[el]
    })

    return filteredObj
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.updateMe = catchAsync( async(req, res, next) => {
    console.log(req.file)
    console.log(req.body)
    // 1)Create Error if user POSTed password data
    if(req.body.password || req.body.passwordConfirm) {
        return next( new AppError("this route is not for password updates, Please use /updateMyPassword", 400))
    }

    // 2)Update user data 
    const filteredBody = filterReq(req.body, 'name', 'email')
    // add filename as a path to find the image afterward
    if(req.file) filteredBody.photo = req.file.filename

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
        message: 'this route is not defined! Please use singnup'
    })
}

exports.getUser = factory.getOne(User)
exports.getAllUsers = factory.getAll(User)
// DO not update password with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)