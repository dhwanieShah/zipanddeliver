const { getConnection } = require('../../helper/mongodb');
const mongoose = require('mongoose');

const zipAndDeliverDatabase = getConnection('zipAndDeliverDatabase')


const userDocumentation = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'imerference', // Refers to the User model in Imerference
        required: true,
    },
    role: {
        type: String,
        enum: ["merchant", "rider"],
        default: "merchant"
    },
    document_type: {
        type: String,
        enum: ["license", "passport"],
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    image: {
        type: String,
        required: false,
        default: ""
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    is_document_submitted: {
        type: Boolean,
        default: false
    }
});

let userDocumentationTable = zipAndDeliverDatabase.model("user_documentation", userDocumentation);

module.exports = userDocumentationTable;