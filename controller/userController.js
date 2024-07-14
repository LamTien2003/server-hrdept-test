const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const APIFeatures = require('../utils/apiFeatures');
const excelJS = require('exceljs');

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

    // Set up the response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.xlsx');
    return sendResponseToClient(res, 200, {
        data: newUser,
    });
});

exports.exportExcel = catchAsync(async (req, res, next) => {
    const usersQuery = new APIFeatures(User.find(), req.query)
        .search(['email', 'phoneNumber', 'firstName', 'lastName'], 'searchText')
        .filter()
        .paginate();
    const users = await usersQuery.query;

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Define columns in the worksheet
    worksheet.columns = [
        { header: 'First Name', key: 'firstName', width: 20 },
        { header: 'Last Name', key: 'lastName', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone number', key: 'phoneNumber', width: 20 },
        { header: 'Role', key: 'role', width: 10 },
    ];

    users.forEach((user) => {
        const data = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
        };
        worksheet.addRow(data);
    });
    // Set up the response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.xlsx');
    await workbook.xlsx.write(res);
});
