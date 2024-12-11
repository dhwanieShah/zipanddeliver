const userDocumentationModel = require('./userDocumentation.model');


/**
 * Check
 */
exports.isCheck = async (query) => {
    return await userDocumentationModel.findOne(query).lean();
}


/**
 * Save
 */
exports.save = async (payload) => {
    return await userDocumentationModel(payload).save();
}

/**
 * Update
 */
exports.update = async (query, payload) => {
    return await userDocumentationModel.findOneAndUpdate(query, payload).lean();
}