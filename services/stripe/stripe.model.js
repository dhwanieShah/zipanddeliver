const { getConnection } = require('../../helper/mongodb');
const mongoose = require("mongoose");
const stripeDatabase = getConnection('imerferenceDatabase')

var stripeSchema = mongoose.Schema(
    {
        account_type: { type: String },
        secret_key: { type: String },
        publishable_key: { type: String },
        connect_key: { type: String },
        subscription_webhook_key: { type: String },
        lease_subscription_webhook_key: { type: String },
        countryObject: Object,
        type: {
            type: String,
            enum: ['default', 'separate'], default: 'separate'
        },
        is_active: { type: Boolean, default: false },
    },
    { timestamps: true }
);

let stripeModel = stripeDatabase.model("stripe", stripeSchema);


module.exports = stripeModel;