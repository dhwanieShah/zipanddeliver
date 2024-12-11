const { getConnection } = require('../../helper/mongodb');
const mongoose = require('mongoose');

const zipAndDeliverDatabase = getConnection('zipAndDeliverDatabase')


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'imerference', // Refers to the User model in Imerference
        required: true,
    },
    product: { type: String, required: true },
    amount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now }
});

// orderSchema.set('strictPopulate', false);
// Dynamically fetch the connection
let orderModel = zipAndDeliverDatabase.model("order", orderSchema);

module.exports = orderModel;