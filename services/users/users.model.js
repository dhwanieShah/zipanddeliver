const { getConnection } = require('../../helper/mongodb');
const mongoose = require("mongoose");

let Schema = mongoose.Schema

const imerferenceDatabase = getConnection('imerferenceDatabase')

const imerferenceSchema = mongoose.Schema({
    username: { type: String, required: false, default: "" },
    user_image: { type: String, required: false, default: "" },
    user_image_path: { type: String, required: false, default: "" },
    email: { type: String, required: true },
    name: { type: String, required: false },
    password: { type: String, required: false },
    is_otp_verified: { type: Boolean, required: true, default: false },
    otp: { type: String, required: true },
    otp_expiration_time: { type: String, required: true },
    registration_date: { type: String },
    is_blocked: { type: Boolean, required: false, default: false },
    password_otp: { type: String, required: false },
    password_otp_expiration_time: { type: String, required: false },
    password_otp_time: { type: String, required: false },
    secret_api_key: { type: String, required: false },
    user_role_type: {
        type: String,
        enum: ["immerch", "immerference", "zipAndDeliver"],
        default: "immerference",
    },
    is_immerch_password_updated: {
        type: String,
        enum: ["yes", "no"],
        default: "no",
    },
    znd_role: {
        type: String,
        enum: ["merchant", "rider"],
        default: "merchant",
    },
    znd_activation_status: {
        type: String,
        enum: ["pending", "active", "blocked", "rejected"],
        default: "pending",
    },
    immerch_password: { type: String, required: false, default: "" },
    immerch_id: { type: String, required: false, default: "" },
    phone_number: { type: String, required: false, default: "" },
    user_profile_image: { type: String, required: false, default: "" },
    user_profile_video: { type: String, required: false, default: "" },
    user_profile_image_path: { type: String, required: false, default: "" },
    user_profile_video_path: { type: String, required: false, default: "" },
    user_profile_status: { type: String, required: false, default: "" },
    user_profile_image_compressed: { type: String, required: false, default: "" },
    instagram_url: { type: String, required: false, default: "" },
    facebook_url: { type: String, required: false, default: "" },
    linkedin_url: { type: String, required: false, default: "" },
    dropbox_url: { type: String, required: false, default: "" },
    website_url: { type: String, required: false, default: "" },
    qr_code: { type: String, required: false, default: "" },
    profile_email: { type: String, required: false, default: "" },
    dip_link: { type: String, required: false, default: "" },
    fcm_token: { type: String, required: false, default: "" },
    device_type: { type: String, required: false, default: "" },
    user_profile_video_thumb: { type: String, required: false, default: "" },
    music_url: { type: String, required: false, default: "" },
    country_code: { type: String, required: false, default: "" },
    countryObject: Object,
    profile_views: { type: Number, required: false, default: 0 },
    media_views: { type: Number, required: false, default: 0 },
    fcm_dip_link: { type: String, required: false, default: "" },
    immerch_ar_dip_link: { type: String, required: false, default: "" },
    loggedin_devices: [
        {
            type: Schema.Types.ObjectId,
            ref: "user_loggedin_devices",
        },
    ],
    stripe_customer_code: { type: String, default: "" },
    separate_stripe_customer_ids: [
        {
            country_code: String,
            currency_code: String,
            customer_id: String
        }
    ],
    secret_api_key: String,
    mobile: { type: String },
    isRatedAndroidFrekis: { type: Boolean, default: false },
    isRatedAndroidShareKayak: { type: Boolean, default: false },
    isRatedIosFrekis: { type: Boolean, default: false },
    isGuideCompleted: { type: Boolean, default: false },
    isRatedIosShareKayak: { type: Boolean, default: false },
    is_information_submitted: { type: Boolean, default: true },
    dialling_code: { type: String, default: "" },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },
    address: { type: String, default: "" },
});

imerferenceSchema.index({ location: "2dsphere" });

// Dynamically fetch the connection
let imerferenceUser = imerferenceDatabase.model("imerference", imerferenceSchema);

imerferenceUser.getUserbyId = async (query, select) => {
    console.log("GetUserInfo", query);
    let user = await imerferenceUser
        .findOne(query)
        .populate("loggedin_devices")
        .sort("loggedin_devices.created_at")
        .lean();
    return user;
};

module.exports = imerferenceUser;