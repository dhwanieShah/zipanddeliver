const UsersService = require("./users.services");
const StripeService = require("../stripe/stripe.services");
const passport = require("passport");
const guard = require("../../helper/guards");
const moment = require("moment");
const momentTZ = require("moment-timezone");
const tempUserServices = require('../tempUser/tempUser.services');
const loggedInDeviceModel = require('../tempUser/loggedInDevices.model');
const ISOCountryCurrency = require("iso-country-currency");
const { commonResponse, commonFunctions, nodemailer } = require("../../helper");
const { usersLogsLogger } = require('../../logger');
const { userDocumentationServices } = require("../userDocumentation");

module.exports = {
    create: async (req, res, next) => {
        try {

        } catch (error) {
            console.log("🚀 ~ create:async ~ error:", error)
            return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
        }
    }
}