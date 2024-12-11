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

    /*
    *  Register New User
    */
    register: async (req, res, next) => {
        try {

            let timeZone = req.headers.time_zone && req.headers.time_zone != '' ? req.headers.time_zone : 'Asia/Kolkata';
            momentTZ.tz.setDefault(timeZone);

            let updatePayload = {}


            if (req.body.email) {
                updatePayload.email = req.body.email.toLowerCase();
                updatePayload.email = updatePayload.email.replace(" ", "");
                updatePayload.email = updatePayload.email.trim();
            }

            if (!req.body.country_iso_code) {
                return commonResponse.customResponse(res, "COUNTRY_CODE_REQUIRED", 400, {});
            }

            if (!req.body.role) {
                return commonResponse.customResponse(res, "ROLE_REQUIRED", 400, {});
            }

            if (req.body.country_iso_code && req.body.country_iso_code != '') {
                try {
                    let iosCode = req.body.country_iso_code == 'USA' ? 'US' : req.body.country_iso_code;
                    let countryObject = await ISOCountryCurrency.getAllInfoByISO(iosCode);
                    if (countryObject) {
                        updatePayload.countryObject = countryObject;
                    }
                } catch (err) {
                    console.log("🚀 ~ file: users.js:84 ~ registerUser: ~ err:", err)
                    usersLogsLogger.error("🚀 ~ file: users.js:84 ~ registerUser: ~ err:", err)
                }
            } else {
                let countryObject = await ISOCountryCurrency.getAllInfoByISO("SE");
                if (countryObject) {
                    updatePayload.countryObject = countryObject;
                }
            }

            if (req.body.password && req.body.password != "") {
                updatePayload.password = await commonFunctions.encryptStringCrypt(req.body.password);
            }

            updatePayload.registration_date = moment();
            updatePayload.otp_expiration_time = moment().add(5, 'minute').format();
            updatePayload.otp = commonFunctions.randomSixDigit();

            console.log("🚀 ~ register: ~ updatePayload:", updatePayload)


            let checkUserExist = await UsersService.is_exist(updatePayload.email);
            if (checkUserExist) {

                if (!checkUserExist.username || checkUserExist.username == "") {
                    updatePayload.username = req.body.email
                }

                if (!checkUserExist.name || checkUserExist.name == "") {
                    updatePayload.name = req.body.email
                }

                updatePayload.role = req.body.role

                console.log("🚀 ~ register: ~ updatePayload:", updatePayload)

                let updateUsers = await UsersService.update({ email: req.body.email }, updatePayload);
                if (updateUsers) {
                    console.log("🚀 ~ register: ~ updateUsers:", updateUsers)

                    let checkUserDocumentExist = await userDocumentationServices.isCheck({ user_id: updateUsers._id, is_deleted: false })
                    if (checkUserDocumentExist) {
                        let checkUserDocumentSubmitted = await userDocumentationServices.isCheck({ _id: checkUserDocumentExist._id, is_document_submitted: false })
                        if (checkUserDocumentSubmitted) {
                            //Send OTP in Email
                            return commonResponse.success(res, "USER_UPDATED", 200, updateUsers);
                        } else {
                            return commonResponse.customResponse(res, "USER_ALREADY_EXIST", 400, updateUsers);
                        }
                    } else {
                        let userDocumentationPayload = {
                            userId: updateUsers._id,
                            role: req.body.role,
                            document_type: "",
                            status: "pending",
                            image: "",
                            is_deleted: false
                        }
                        await userDocumentationServices.save(userDocumentationPayload);

                        //Send OTP in Email
                        return commonResponse.success(res, "USER_UPDATED", 200, updateUsers);
                    }
                } else {
                    return commonResponse.customResponse(res, "DEFAULTER", 400, {});
                }
            } else {

                updatePayload.username = req.body.email;
                updatePayload.name = req.body.email;

                console.log("🚀 ~ register: ~ req.body:", updatePayload)

                let temp_user = await tempUserServices.addUpdate({ email: updatePayload.email }, updatePayload);
                if (temp_user) {
                    return commonResponse.success(res, "USER_CREATED", 200, temp_user);
                } else {
                    return commonResponse.customResponse(res, "DEFAULTER", 400, {});
                }
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
        }
    },

    verifyOtp: async (req, res, next) => {
        try {
            console.log("🚀 ~ file: users.controller.js:87 ~ verifyOtp: ~ req.body:", req.body)
            console.log("🚀 ~ file: users.controller.js:88 ~ verifyOtp: ~ req.headers:", req.headers)

            let timeZone = req.headers.time_zone && req.headers.time_zone != '' ? req.headers.time_zone : 'Asia/Kolkata';
            momentTZ.tz.setDefault(timeZone);

            let currentTime = moment().format()

            if (!req.body.email) {
                return commonResponse.customResponse(res, "EMAIL_MISSING", 400, {});
            }

            req.body.email = req.body.email.toLowerCase();
            req.body.email = req.body.email.trim();

            let checkUserQuery = {
                email: req.body.email,
                otp: req.body.otp
            }

            let checkUser = await UsersService.details(checkUserQuery);
            console.log("🚀 ~ file: users.controller.js:113 ~ verifyOtp: ~ checkUser:", checkUser)
            usersLogsLogger.info("🚀 ~ file: users.controller.js:114 ~ verifyOtp: ~ checkUser:", checkUser)

            if (checkUser) {
                // Check otp expiration Time
                if (currentTime.toString() > checkUser.otp_expiration_time) {
                    return commonResponse.customResponse(res, "OTP_EXPIRED", 400, {});
                }

                if (checkUser.is_blocked) {
                    return commonResponse.customResponse(res, "USER_BLOCKED", 400, {});
                }

                if (!checkUser.username || checkUser.username == "") {
                    checkUser.username = req.body.email
                }

                if (!checkUser.name || checkUser.name == "") {
                    checkUser.name = req.body.email
                }

                if (checkUser.is_information_submitted == undefined) {
                    checkUser.is_information_submitted = true
                }


                let userIsoCode = checkUser.countryObject && checkUser.countryObject.iso ? checkUser.countryObject.iso : "SE"
                if (!checkUser.separate_stripe_customer_ids) {
                    checkUser.separate_stripe_customer_ids = []
                }

                let checkUserCustomerCode = checkUser.separate_stripe_customer_ids.find((e) => e.country_code === userIsoCode)

                if (!checkUserCustomerCode || !checkUserCustomerCode.customer_id || checkUserCustomerCode.customer_id == "") {

                    if (checkUserCustomerCode && checkUserCustomerCode.customer_id == '') {
                        // Remove this index
                        checkUser.separate_stripe_customer_ids = checkUser.separate_stripe_customer_ids.filter((e) => e.country_code != userIsoCode)
                    }

                    // Create customer
                    let stripeCustomer = {
                        email: checkUser.email
                    };

                    let stripeCustomerCode = await StripeService.createCustomer(
                        stripeCustomer,
                        userIsoCode
                    );

                    checkUser.separate_stripe_customer_ids.push({
                        'country_code': checkUser.countryObject && checkUser.countryObject.iso ? checkUser.countryObject.iso : "SE",
                        'currency_code': checkUser.countryObject && checkUser.countryObject.currency ? checkUser.countryObject.currency : 'SEK',
                        'customer_id': stripeCustomerCode.id
                    })

                    if (!checkUser.stripe_customer_code || checkUser.stripe_customer_code == '') {
                        checkUser.stripe_customer_code = stripeCustomerCode.id
                    }
                }


                console.log("🚀 ~ file: users.js:393 ~ verifyOtp: ~ checkUser:", checkUser)

                checkUser.is_otp_verified = true

                await tempUserServices.addUpdate({ _id: checkUser._id }, { is_otp_verified: true }, { new: true });

                // Return CustomerId
                let getCustomerId = checkUser.separate_stripe_customer_ids.find((e) => e.country_code === userIsoCode)
                if (getCustomerId) {
                    req.body.stripe_customer_code = getCustomerId.customer_id
                }

                if (
                    req.body.fcm_token &&
                    req.body.fcm_token != "" &&
                    req.body.device_type &&
                    req.body.device_type != ""
                ) {
                    let addDevice = await updateOrAddDevice(checkUser._id, req.body);
                    console.log("🚀 ~ verifyOtp: ~ addDevice:", addDevice)

                    if (addDevice) {
                        try {
                            let loggedin_devices = checkUser.loggedin_devices;
                            loggedin_devices.push(addDevice._id);

                            loggedin_devices = loggedin_devices.map(({ _id }) => _id.toString())
                            loggedin_devices = Array.from(new Set(loggedin_devices))

                            req.body.loggedin_devices = loggedin_devices
                        } catch (err) {
                            console.log("🚀 ~ verifyOtp add device error: ~ err:", err)
                        }
                    }
                }

                let updateUserDetails = await UsersService.update(checkUser._id, checkUser);

                console.log("🚀 ~ file: users.controller.js:233 ~ verifyOtp: ~ updateUserDetails:", updateUserDetails)
                usersLogsLogger.info("🚀 ~ file: users.controller.js:234 ~ verifyOtp: ~ updateUserDetails:", updateUserDetails)

                return commonResponse.success(res, "USER_VERIFIED_SUCCESS", 200, updateUserDetails);
            } else {
                let userDetails = await tempUserServices.details(checkUserQuery)
                console.log("🚀 ~ file: users.controller.js:239 ~ verifyOtp: ~ userDetails:", userDetails)
                usersLogsLogger.info("🚀 ~ file: users.controller.js:240 ~ verifyOtp: ~ userDetails:", userDetails)

                if (userDetails) {

                    if (currentTime.toString() > userDetails.otp_expiration_time) {
                        return commonResponse.customResponse(res, "OTP_EXPIRED", 400, {});
                    }

                    console.log("🚀 ~ file: users.controller.js:253 ~ verifyOtp: ~ userDetails:", userDetails)
                    usersLogsLogger.info("🚀 ~ file: users.controller.js:254 ~ verifyOtp: ~ userDetails:", userDetails)

                    let stripeCustomerCode = await StripeService.createCustomer(
                        {
                            email: userDetails.email
                        },
                        userDetails.countryObject && userDetails.countryObject.iso ? userDetails.countryObject.iso : "SE"
                    );

                    console.log("🚀 ~ file: users.controller.js:264 ~ verifyOtp: ~ stripeCustomerCode:", stripeCustomerCode)
                    usersLogsLogger.info("🚀 ~ file: users.controller.js:265 ~ verifyOtp: ~ stripeCustomerCode:", stripeCustomerCode)

                    userDetails = {
                        ...userDetails,
                        name: req.body.email,
                        username: req.body.email,
                        is_information_submitted: false,
                        is_otp_verified: true,
                        stripe_customer_code: stripeCustomerCode.id,
                        separate_stripe_customer_ids: [{
                            'country_code': userDetails.countryObject && userDetails.countryObject.iso ? userDetails.countryObject.iso : "SE",
                            'currency_code': userDetails.countryObject && userDetails.countryObject.currency ? userDetails.countryObject.currency : 'SEK',
                            'customer_id': stripeCustomerCode.id
                        }]
                    };
                    console.log("🚀 ~ file: users.controller.js:282 ~ verifyOtp: ~ userDetails:", userDetails)
                    usersLogsLogger.info("🚀 ~ file: users.controller.js:283 ~ verifyOtp: ~ userDetails:", userDetails)

                    let updateData = await UsersService.save(userDetails);

                    await tempUserServices.addUpdate({ _id: updateData._id }, { is_otp_verified: true });

                    console.log("🚀 ~ file: users.controller.js:294 ~ verifyOtp: ~ updateData:", updateData)
                    usersLogsLogger.info("🚀 ~ file: users.controller.js:295 ~ verifyOtp: ~ updateData:", updateData)

                    if (
                        userDetails.fcm_token &&
                        userDetails.fcm_token != "" &&
                        userDetails.device_type &&
                        userDetails.device_type != ""
                    ) {

                        let addDevice = await updateOrAddDevice(updateData._id, userDetails);
                        console.log("addDevice", addDevice);
                        console.log("addDevice", "addDevice");
                        try {

                            updateData.loggedin_devices.push(addDevice);
                            updateData.loggedin_devices = updateData.loggedin_devices.map(({ _id }) => _id.toString())
                            updateData.loggedin_devices = Array.from(new Set(updateData.loggedin_devices))

                            updateData.isGuideCompleted = true;
                            updateData.device_type = userDetails.device_type

                            let updateCurrentRegisterUser = await imerferenceUser.findOneAndUpdate(
                                { _id: updateData._id },
                                updateData
                            );
                            console.log("xxxxxx", updateCurrentRegisterUser);
                        } catch (err) {
                            console.log("adddeviceerror", err);
                        }
                    }
                    return commonResponse.success(res, "USER_VERIFIED_SUCCESS", 200, updateData);
                } else {
                    return commonResponse.success(res, "WRONG_OTP", 400, {});
                }
            }
        } catch (error) {
            console.log("🚀 ~ verifyOtp: ~ error:", error)
            usersLogsLogger.error("Error On Otp Verify :- User.controller.js Line:-340 catch ", error)
            return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
        }
    },

    // Login: async (req, res, next) => {
    //     try {

    //         let imerferenceUserCheck = await UsersService.details(req.body.email);
    //         if (imerferenceUserCheck) {

    //         } else {
    //             let checkTempUser = await tempUserServices.details(req.body.email);
    //             if (checkTempUser) {

    //             }
    //         }

    //     } catch (error) {
    //         console.log("🚀 ~ Login:async ~ error:", error)
    //         return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
    //     }
    // },

    checkUsername: async (req, res, next) => {
        try {
            if (!req.body.username) {
                return commonResponse.CustomError(res, "USERNAME_REQUIRED", 400, {});
            }
            let checkUsername = await UsersService.details({ username: new RegExp("^" + req.body.username + "$", "i") })
            if (checkUsername) {
                return commonResponse.CustomError(res, "USERNAME_ALREADY_EXISTS", 400, {});
            } else {
                return commonResponse.success(res, "USERNAME_AVAILABLE", 200, { username: req.body.username });
            }
        } catch (error) {
            console.log("🚀 ~ checkUsername:async ~ error:", error)
            usersLogsLogger.error("Error On checkUsername :- User.controller.js Line:-340 catch ", error)
            return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
        }
    },

    resendOtp: async (req, res, next) => {
        try {
            console.log("🚀 ~ file: users.js:535 ~ registerUser: ~ req.body:", req.body)
            usersLogsLogger.info("🚀 ~ file: users.js:536 ~ registerUser: ~ req.body:", req.body)
            console.log("🚀 ~ file: users.js:537 ~ registerUser: ~ req.headers:", req.headers)
            usersLogsLogger.info("🚀 ~ file: users.js:538 ~ registerUser: ~ req.headers:", req.headers)

            let timeZone = req.headers.time_zone && req.headers.time_zone != '' ? req.headers.time_zone : 'Asia/Kolkata';
            momentTZ.tz.setDefault(timeZone);

            usersLogsLogger.info("UserController-resendOtpPayload", req.body);
            const { email } = req.body;
            let response = { success: false };
            if (email) {
                let checkExists = await tempUserServices.details({ email: email });

                let checkImerferenceUserUser = await tempUserServices.details({ email: email });

                console.log("🚀 ~ file: users.js:549 ~ resendOtp: ~ checkExists:", checkExists)

                let updateObject = {};
                let otp_expiration_time = moment().add(5, 'minute').format()
                let otp = commonFunctions.randomSixDigit();

                if (req.body.email == "testuser@frekis.com" || req.body.email == "b9@atz.se") {
                    otp = "123456"
                    otp_expiration_time = moment().add(10, 'minute').format()
                }

                updateObject.otp = otp;
                updateObject.otp_expiration_time = otp_expiration_time;

                if (checkImerferenceUserUser) {
                    let updatedData = await imerferenceUser.findOneAndUpdate(
                        { _id: checkImerferenceUserUser._id },
                        { $set: updateObject },
                        { new: true }
                    );

                    let emailPayload = {
                        otp: otp,
                        email: req.body.email,
                        otpExpiredTime: moment(otp_expiration_time).format("YYYY-MM-DD HH:mm:ss")
                    }

                    // if (req.headers.brand_name) {
                    //     if (req.headers.brand_name == "Frekis") {
                    //         EmailController.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     } else if (req.headers.brand_name == "Sharekayak") {
                    //         EmailControllerSharekayak.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     } else if (req.headers.brand_name == "OdeServices") {
                    //         EmailControllerOdeRentals.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     }
                    // } else {
                    //     if (req.headers.issharekayak) {
                    //         console.log("TCL: req.headers.issharekayak", req.headers.issharekayak)
                    //         EmailControllerSharekayak.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     } else {
                    //         EmailController.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     }
                    // }
                    return commonResponse.success(res, "RESEND_OTP_SUCCESS", 200, updatedData);
                } else if (checkExists) {

                    let updatedData = await tempRegistration.findOneAndUpdate(
                        { _id: checkExists._id },
                        { $set: updateObject },
                        { new: true }
                    );

                    let emailPayload = {
                        otp: otp,
                        email: req.body.email,
                        otpExpiredTime: moment(otp_expiration_time).format("YYYY-MM-DD HH:mm:ss")
                    }

                    // if (req.headers.brand_name) {
                    //     if (req.headers.brand_name == "Frekis") {
                    //         EmailController.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     } else if (req.headers.brand_name == "Sharekayak") {
                    //         EmailControllerSharekayak.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     } else if (req.headers.brand_name == "OdeServices") {
                    //         EmailControllerOdeRentals.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     }
                    // } else {
                    //     if (req.headers.issharekayak) {
                    //         console.log("TCL: req.headers.issharekayak", req.headers.issharekayak)
                    //         EmailControllerSharekayak.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     } else {
                    //         EmailController.sendPasswordLessOtpMail(updatedData.email, emailPayload);
                    //     }
                    // }
                    return commonResponse.success(res, "RESEND_OTP_SUCCESS", 200, updatedData);
                } else {
                    return commonResponse.CustomError(res, "ENTER_VALID_CREDENTIALS", 400, {});
                }
            } else {
                return commonResponse.CustomError(res, "EMAIL_MISSING", 400, {});
            }
        } catch (error) {
            console.log("🚀 ~ file: users.js:537 ~ resendOtp: ~ error:", error)
            usersLogsLogger.error("🚀 ~ file: users.js:537 ~ resendOtp: ~ error:", error)
            return response.errorResponse(res, error.message, {})
        }
    },

    updateUserDetails: async (req, res, next) => {
        try {
            console.log("🚀 ~ file: users.js:651 ~ registerUser: ~ req.body:", req.body)
            usersLogsLogger.info("🚀 ~ file: users.js:652 ~ registerUser: ~ req.body:", req.body)
            console.log("🚀 ~ file: users.js:653 ~ registerUser: ~ req.headers:", req.headers)
            usersLogsLogger.info("🚀 ~ file: users.js:654 ~ registerUser: ~ req.headers:", req.headers)

            let response = { success: false };


            let updatePayload = {
                is_information_submitted: true
            }

            if (req.body.mobile && req.body.mobile != "") {
                updatePayload.mobile = req.body.mobile
            }

            if (req.body.dialling_code && req.body.dialling_code != "") {
                updatePayload.dialling_code = req.body.dialling_code
            }

            if (req.body.new_username && req.body.new_username != "") {
                updatePayload.username = req.body.new_username
                updatePayload.name = req.body.new_username
                let checkExistUsername = await UsersService.details({ username: new RegExp("^" + req.body.new_username + "$", "i"), _id: { $ne: req.body.user_id } });
                console.log("🚀 ~ updateUserDetails: ~ checkExistUsername line :- 467 :- ", checkExistUsername)
                if (checkExistUsername) {
                    return commonResponse.CustomError(res, "USERNAME_ALREADY_EXISTS", 400, {});
                }
            }

            let updateUser = await UsersService.update({ _id: req.body.user_id }, updatePayload, { new: true }).lean();
            console.log("🚀 ~ file: users.js:667 ~ updateUserDetails: ~ updateUser:", updateUser)
            usersLogsLogger.info("🚀 ~ file: users.js:667 ~ updateUserDetails: ~ updateUser:", updateUser)

            if (updateUser) {
                return commonResponse.success(res, "PROFILE_UPDATED", 200, updateUser);
            } else {
                return commonResponse.CustomError(res, "PROFILE_UPDATE_ERROR", 400, {});
            }
        } catch (error) {
            console.log("🚀 ~ file: users.js:654 ~ updateUserDetails:async ~ error:", error)
            usersLogsLogger.error("🚀 ~ file: users.js:654 ~ updateUserDetails:async ~ error:", error)
            return commonResponse.CustomError(res, "DEFAULT_INTERNAL_SERVER_ERROR", 500, {}, error.message);
        }
    },
};


const updateOrAddDevice = async function (user_id, body) {
    let newDeviceLogin = {
        user_id: user_id,
        app_id: body.app_id,
        fcm_token: body.fcm_token ? body.fcm_token : "",
        device_id: body.device_id,
        device_type: body.device_type,
    };

    console.log("NewDeviceLoginPayload", newDeviceLogin);

    let add_devices = await loggedInDeviceModel.addUpdate({
        user_id: user_id,
        app_id: body.app_id,
        device_type: body.device_type,
    }, { newDeviceLogin })
    return add_devices
};