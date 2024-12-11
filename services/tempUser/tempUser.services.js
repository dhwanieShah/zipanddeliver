const { commonResponse } = require("../../helper");
const tempUserModel = require('./tempRegistration.model');

/*
*  Check Email Exist
*/
exports.is_exist = async (reqBody) => {
    return await tempUserModel.findOne({ email: reqBody.email }).lean();
};


/*
*  Get By Id
*/
exports.get = async (id) => {
    return await tempUserModel.findOne({ _id: id }).lean();

};

/*
*  Get Details
*/
exports.details = async (query) => {
    return await tempUserModel.findOne(query).lean();

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
    return await tempUserModel.findOneAndUpdate(query, { $set: reqBody }, { new: true, }).lean();
};

/*
*  Add and update users
*/
exports.addUpdate = async (query, reqBody) => {
    try {
        return await tempUserModel.findOneAndUpdate(
            query,
            { $set: reqBody },
            { new: true, upsert: true }
        );
    } catch (error) {
        console.log("🚀 ~ exports.addUpdate= ~ error:", error)
    }

};


/*
*  Delete User
*/
exports.delete = async (id) => {
    return await tempUserModel.removeOne({ _id: id }, { new: true }).lean();
};