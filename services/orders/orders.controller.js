const orderServices = require('./orders.services');
const { commonResponse, commonFunctions, nodemailer } = require("../../helper");

module.exports = {

    create: async (req, res) => {
        try {
            let create = await orderServices.createOrder(req.body);
            if (create) {
                return commonResponse.success(res, "DEFAULT", 200, create);
            } else {
                return commonResponse.customResponse(res, "DEFAULTER", 400, {});
            }
        } catch (error) {
            console.log("🚀 ~ create order : ~ error :-", error)
            return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
        }
    },

    details: async (req, res) => {
        try {
            let create = await orderServices.getOrder({ _id: req.params.id });
            if (create) {
                return commonResponse.success(res, "DEFAULT", 200, create);
            } else {
                return commonResponse.customResponse(res, "DEFAULTER", 400, {});
            }
        } catch (error) {
            console.log("🚀 ~ create order : ~ error :-", error)
            return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
        }
    }
}