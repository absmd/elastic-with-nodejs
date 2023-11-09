const express = require("express");
const router = express.Router();

const api_auth_controller = require("../controller/auth.controller");

// router.route("/login").post(api_auth_controller.doLogin);

router.route("/signup").post(api_auth_controller.doSignup);

router
  .route("/Insert-bulk-user-elastic")
  .get(api_auth_controller.addBulkUserDataInElastic);

router
  .route("/update-user-name-elastic")
  .post(api_auth_controller.addBulkUserNameInElastic);

router
  .route("/search-user-elastic")
  .get(api_auth_controller.searchUserInElastic);

router
  .route("/delete-user-elastice")
  .post(api_auth_controller.deleteUserElastic);

module.exports = router;
