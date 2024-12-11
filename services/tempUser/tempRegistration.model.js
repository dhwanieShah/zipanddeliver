const { getConnection } = require('../../helper/mongodb');
const mongoose = require("mongoose");
const imerferenceDatabase = getConnection('imerferenceDatabase')

const tempRegistration = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    user_image: { type: String, required: false, default: "" },
    user_image_path: { type: String, required: false, default: "" },
    email: { type: String, required: true },
    name: { type: String, required: false },
    password: { type: String, required: false },
    fcm_token: { type: String, required: false },
    app_id: { type: String, required: false },
    device_id: { type: String, required: false },
    device_type: { type: String, required: false },
    mobile: { type: String },
    is_otp_verified: { type: Boolean, required: true, default: false },
    otp: { type: String, required: true },
    otp_expiration_time: { type: String, required: true },
    registration_date: { type: String },
    countryObject: Object,
    is_verified: { type: String, default: false },
    dialling_code: { type: String, default: "" }
});

let tempRegistrationModel = imerferenceDatabase.model("temp_registration", tempRegistration);

tempRegistrationModel.isExist = async (email) => {
    return await tempRegistrationModel.findOne({ email: email }).lean();
};

tempRegistrationModel.details = async (query) => {
    return await tempRegistrationModel.findOne(query).lean();
};

tempRegistrationModel.addUpdate = async (query, reqBody) => {
    return await tempRegistrationModel.findOneAndUpdate(
        filter,
        { $set: reqBody },
        { new: true, upsert: true }
    );
};


module.exports = tempRegistrationModel;