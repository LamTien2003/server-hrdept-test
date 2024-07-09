const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const APIFeatures = require('../utils/apiFeatures');

const { sendResponseToClient } = require('../utils/utils');

exports.getAllUser = catchAsync(async (req, res, next) => {
    const usersQuery = new APIFeatures(User.find(), req.query)
        .search(['email', 'phoneNumber', 'firstName', 'lastName'], 'searchText')
        .filter()
        .paginate();
    const users = await usersQuery.query;

    const totalItems = await new APIFeatures(User.find(), req.query)
        .search(['email', 'phoneNumber', 'firstName', 'lastName'], 'searchText')
        .filter()
        .query.count('totalItems');

    return sendResponseToClient(res, 200, {
        data: users,
        totalItems,
    });
});

exports.addUser = catchAsync(async (req, res, next) => {
    const payload = {
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
    };

    if (req?.file?.filename) {
        payload.image = req.file.filename;
    }

    const newUser = await User.create(payload);
    return sendResponseToClient(res, 200, {
        data: newUser,
    });
});
exports.editUser = catchAsync(async (req, res, next) => {
    const payload = {
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
    };

    if (req?.file?.filename) {
        payload.image = req.file.filename;
    }

    const newUser = await User.findByIdAndUpdate(req.params.userId, payload);
    return sendResponseToClient(res, 200, {
        data: newUser,
    });
});
