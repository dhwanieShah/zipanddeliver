const { getConnection } = require('../../helper/mongodb');
const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const imerferenceDatabase = getConnection('imerferenceDatabase');

var schema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "imerference"
        },
        app_id: { type: String },
        fcm_token: { type: String },
        device_id: { type: String },
        device_type: { type: String }
    },
    { timestamps: { createdAt: "created_at" } }
);

let loggedInDeviceModel = imerferenceDatabase.model("user_loggedin_devices", schema);

loggedInDeviceModel.addUpdate = async (query, reqBody) => {
    return await loggedInDeviceModel.findOneAndUpdate(
        filter,
        { $set: reqBody },
        { new: true, upsert: true }
    );
};

module.exports = loggedInDeviceModel;