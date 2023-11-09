const mongoose = require("mongoose");
module.exports = function () {
  //https://mongoosejs.com/docs/migrating_to_6.html#no-more-deprecation-warning-options
  //(node:18168) UnhandledPromiseRejectionWarning: MongoParseError: options usefindandmodify, usecreateindex are not supported
  mongoose.Promise = global.Promise;
  const db = mongoose.connect(
    "mongodb://dev_sb:dev_sb12345@192.168.20.20:27027/dev_sso?authSource=admin",
    {}
  );
  console.log("Successfully Connected To MongoDB.");
  mongoose.connection.on("error", (err) => {
    console.log(
      "Error: Could not connect to MongoDB. Did you forget to run `mongod`?".red
    );
  });
  return db;
};
