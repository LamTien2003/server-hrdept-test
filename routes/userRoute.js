const express = require('express');
const filesMiddleware = require('../middleware/filesMiddleware');
const userController = require('../controller/userController');

// find all users
const router = express.Router();

// router.patch(
//     '/changeMe',
//     filesMiddleware.uploadMultipleFields([
//         { name: 'photo', maxCount: 1 },
//         { name: 'coverImage', maxCount: 1 },
//     ]),

//     filesMiddleware.resizePhoto('users'),
//     userController.changeMe,
// );
router.get('/downloadExcel', userController.exportExcel);
router.patch(
    '/:userId',
    filesMiddleware.uploadSinglePhoto('image'),
    filesMiddleware.resizePhoto('users'),
    userController.editUser,
);
router.post(
    '/',
    filesMiddleware.uploadSinglePhoto('image'),
    filesMiddleware.resizePhoto('users'),
    userController.addUser,
);
router.get('/', userController.getAllUser);

module.exports = router;
