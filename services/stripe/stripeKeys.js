const Stripe = require("./stripe.model");

const getActiveModeKey = async () => {
    const stripe = await Stripe.findOne({ is_active: true, type: 'default' }).lean();
    return stripe.secret_key;
};

const getSeparateAccountKey = async (country_code = "SE") => {
    const separateStripe = await Stripe.findOne({ is_active: true, "countryObject.iso": country_code }).lean();
    if (separateStripe) {
        return separateStripe.secret_key;
    } else {
        const stripeDefault = await Stripe.findOne({ is_active: true, type: 'default' }).lean();
        console.log("stripeDefault : ", stripeDefault)
        return stripeDefault.secret_key
    }
};

const getSeparateAccountDetails = async (country_code = "SE") => {
    const separateStripe = await Stripe.findOne({ is_active: true, "countryObject.iso": country_code }).lean();
    if (separateStripe) {
        return separateStripe;
    } else {
        return await Stripe.findOne({ is_active: true, type: 'default' }).lean();
    }
};

module.exports = { getActiveModeKey, getSeparateAccountKey, getSeparateAccountDetails };