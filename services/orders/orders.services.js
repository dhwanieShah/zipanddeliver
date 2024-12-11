const orderModel = require('./orders.model');
const userModel = require('../users/users.model');

// Create a new order
exports.createOrder = async (reqBody) => {
    try {
        console.log("🚀 ~ exports.createOrder= ~ reqBody:", reqBody)
        return await orderModel(reqBody).save();
    } catch (error) {
        console.log("🚀 ~ exports.createOrder= ~ error:", error)
    }
}

// Order Details
exports.getOrder = async (query) => {
    try {
        return await orderModel.findOne(query).populate({
            path: "userId",
            model: userModel,
            select: 'countryObject username name email',
        }).lean();
    } catch (error) {
        console.log("🚀 ~ exports.getOrder= ~ error:", error)
    }
}