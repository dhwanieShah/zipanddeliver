const router = require("express").Router();
const controller = require("./users.controller");
const { guard } = require('../../helper');
const multerSetting = require("../../helper/multer").userImageUpload;

/*
 *  Register New User
 */
router.post(
    "/register",
    controller.register
);

/*
 *  Verify user
 */
router.post(
    "/verify",
    controller.verifyOtp
);


module.exports = router;