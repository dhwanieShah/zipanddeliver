const { usersRoutes } = require("../services/users");
const { orderRoutes } = require("../services/orders");


const initialize = (app) => {
  app.use("/api/users", usersRoutes);
  app.use("/api/orders", orderRoutes);


  app.use("/authError", (req, res, next) => {
    return next(new Error("DEFAULT_AUTH"));
  });

  app.get("/ping", (req, res) => {
    res.status(200).send({
      success: true,
      statusCode: 200,
    });
  });
};



module.exports = { initialize };