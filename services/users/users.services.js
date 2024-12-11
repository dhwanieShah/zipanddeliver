const { commonResponse } = require("../../helper");
const UsersModel = require("./users.model");


/*
*  Check Email Exist
*/
exports.is_exist = async (email) => {
    return await UsersModel.findOne({ email: email }).lean();
};


/*
*  Get By Id
*/
exports.get = async (id) => {
    return await UsersModel.findOne({ _id: id }).lean();

};

/*
*  Get Details
*/
exports.details = async (query) => {
    return await UsersModel.findOne(query).lean();

};

/*
*  Add New User
*/
exports.save = async (reqBody) => {
    return await new UsersModel(reqBody).save();
};

/*
*  Update User
*/
exports.update = async (query, reqBody) => {
    return await UsersModel.findOneAndUpdate(query, { $set: reqBody }, { new: true, }).lean();
};


/*
*  Delete User
*/
exports.delete = async (id) => {
    return await UsersModel.removeOne({ _id: id }, { new: true }).lean();
};