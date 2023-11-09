const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const router = require("./app/router");
const elasticHelper = require("./app/helper/elastic-helper");
// const mongoose = require("./app/config/mongoose");
// Create an Express application

const { MongoClient } = require("mongodb");

// Middleware for parsing JSON
const app = express();
app.use(bodyParser.json());
// const db = mongoose();
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
// Connect to MongoDB
// const url = "mongodb://localhost:27017/sso";
// const url =
//   "mongodb://dev_sb:dev_sb12345@192.168.20.20:27027/dev_sso?authSource=admin";
// const client = new MongoClient(url);
// client
//   .connect()
//   .then(() => {
//     console.log("Connected to MongoDB");
//     // Your code for interacting with MongoDB
//   })
//   .catch((err) => {
//     console.error("Error connecting to MongoDB:", err);
//   });
// Define routes
app.use("/", router);
app.get("/", async (req, res) => {
  console.log(await elasticHelper.Ping());
  res.send(`Welcome to API.`);
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
