const router = require("express").Router();
const orderController = require('./orders.controller');

/*
 *  create New Order
 */
router.post(
    "/create",
    orderController.create
);

/*
 * Order Details
 */
router.get(
    "/details/:id",
    orderController.details
);

module.exports = router;