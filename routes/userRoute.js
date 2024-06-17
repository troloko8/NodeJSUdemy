const express = require('express')
const multer = require('multer')

const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto
} = require(`../controllers/userController`)
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    protect,
    restrictToByRole,
    logout
} = require(`../controllers/authController`)



const router = express.Router()
const upload = multer({dest: 'public/img/users'})

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.use(protect)

router.patch('/updateMyPassword', updatePassword)
router.patch('/updateMe', upload.single('photo'), updateMe)
router.delete('/deleteMe', deleteMe)
router.get('/me', getMe, getUser)

router.use(restrictToByRole('admin'))

router
    .route('/')
    .get(getAllUsers)
    .post(createUser)

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)


module.exports = router
