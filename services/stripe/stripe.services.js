const stipeSecretKey = require("./stripeKeys");
const { logger } = require("./../../logger");

let stripe = "";
stipeSecretKey.getActiveModeKey().then((data) => {
    console.log("TTTXXXXXX", data);
    stripe = require("stripe")(data);
});

let createCustomer = async (customerInfo, country_code = '') => {
    try {
        if (country_code != '') {
            let secretKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            if (secretKey) {
                stripe = require("stripe")(secretKey);
            }
        }
        const customer = await stripe.customers.create(customerInfo);
        console.log("TCL: createCustomer -> customer", customer);
        console.log(customer.id);
        return customer;
    } catch (error) {
        logger.error("Error inside createCustomer =", error);
        throw new Error(error);
    }
};

let createSeparateStripeCustomer = async (customerInfo, stripeSecretKey, country_code = '') => {
    try {
        stripe = require("stripe")(stripeSecretKey);
        const customer = await stripe.customers.create(customerInfo);
        return customer;
    } catch (error) {
        logger.error("Error inside createSeparateStripeCustomer =", error);
        throw new Error(error);
    }
};

let getCustomer = async (customerCode, country_code = '') => {
    try {
        if (country_code != '') {
            let secretKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            if (secretKey) {
                stripe = require("stripe")(secretKey);
            }
        }
        let customerInfo = stripe.customers.retrieve(customerCode);
        return customerInfo;
    } catch (error) {
        logger.error("Error inside getCustomer =", error);
        throw new Error(error);
    }
};

let updateCustomer = async (customerCode, UpdatedData, country_code = '') => {
    try {
        if (country_code != '') {
            let secretKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            if (secretKey) {
                stripe = require("stripe")(secretKey);
            }
        }
        return await stripe.customers.update(customerCode, UpdatedData);
    } catch (error) {
        logger.error("Error inside updateCustomer =", error);
        throw new Error(error);
    }
};

let standardAccountConnection = async (stripe_user_id, country_code = '') => {
    try {
        if (country_code != '') {
            let secretKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            if (secretKey) {
                stripe = require("stripe")(secretKey);
            }
        }
        if (country_code && country_code != '') {
            let getSecreteKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            console.log("TTTXXXXXX", getSecreteKey);
            stripe = require("stripe")(getSecreteKey);
        }

        const response = await stripe.oauth.token({
            grant_type: "authorization_code",
            code: stripe_user_id,
        });

        return response;
    } catch (error) {
        console.log("Error inside standardAccountConnection =", error);
        logger.error("Error inside standardAccountConnection =", error);
        throw new Error(error);
    }
};

let generateToken = async (stripeConnectId, customerId, cardId, country_code = '') => {
    logger.info(
        "Inside generateToken method =",
        stripeConnectId,
        customerId,
        cardId
    );
    try {
        if (country_code != '') {
            let secretKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            if (secretKey) {
                stripe = require("stripe")(secretKey);
            }
        }
        const token = await stripe.tokens.create(
            {
                customer: customerId,
                card: cardId,
            },
            {
                stripeAccount: stripeConnectId,
            }
        );
        logger.info("Leaving generateToken method =", token);
        return token;
    } catch (error) {
        logger.error("Error inside generateToken =", error);
        throw new Error(error);
    }
};

let packageCharge = async (stripeConnectId, TransactionData, country_code = '') => {
    logger.info(
        "Inside packageCharge method =",
        stripeConnectId,
        TransactionData
    );
    let token = await generateToken(
        stripeConnectId,
        TransactionData.customer,
        TransactionData.cardId,
        country_code
    );
    logger.info("GeneratedToken =", token);
    TransactionData.source = token.id;
    //TransactionData.currency = "INR";

    delete TransactionData.customer;
    delete TransactionData.cardId;

    let stripeCharge = {};
    try {

        if (country_code != '') {
            let secretKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            if (secretKey) {
                stripe = require("stripe")(secretKey);
            }
        }

        let stripeConnectIdObj = {
            stripeAccount: stripeConnectId,
        };
        logger.info("stripeConnectId =", stripeConnectIdObj);
        logger.info("TransactionData =", TransactionData);
        stripeCharge = await stripe.charges.create(
            TransactionData,
            stripeConnectIdObj
        );
        logger.info("stripeCharge =", stripeCharge);
        logger.info("Leaving packageCharge method");
        return stripeCharge;
    } catch (error) {
        logger.error("Error inside packageCharge method = ", error);
        throw new Error(error);
    }
};

let subscriptionCharge = async (TransactionData, country_code = '') => {
    let stripeCharge = {};
    try {
        if (country_code != '') {
            let secretKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            if (secretKey) {
                stripe = require("stripe")(secretKey);
            }
        }
        stripeCharge = await stripe.charges.create(TransactionData);
        return stripeCharge;
    } catch (error) {
        throw new Error(error);
    }
};

let retrieveAccountInfo = async (accountId, country_code = '') => {
    try {
        if (country_code != '') {
            let secretKey = await stipeSecretKey.getSeparateAccountKey(country_code);
            if (secretKey) {
                stripe = require("stripe")(secretKey);
            }
        }
        let accountInfo = await stripe.accounts.retrieve(accountId);
        console.log("StripeAccountInfo", accountInfo);
        return accountInfo;
    } catch (error) {
        logger.error("Error inside retrieveAccountInfo = ", error);
        throw new Error(error);
    }
};

module.exports = {
    createCustomer,
    createSeparateStripeCustomer,
    standardAccountConnection,
    getCustomer,
    updateCustomer,
    packageCharge,
    subscriptionCharge,
    retrieveAccountInfo,
};
