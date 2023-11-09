const User = require("../models/user.model");
const elasticClient = require("./elastic-connection").elasticClient;

let userCount = 0;
let limit = 10;
let offset = 10;
let createCount = 0;
let updateCount = 0;
let finalData = null;

async function fetchUsers(offset, limit) {
  console.log("------offset, limit", offset, limit);
  const indexName = "ssousers";
  let users = await User.find({})
    .lean()
    .select("_id email deActivated twoWayAuth forceLogout first_name last_name")
    .skip(offset)
    .limit(limit);
  if (users.length) {
    try {
      userCount = userCount + users.length;
      let body = [];
      users.forEach((doc) => {
        body.push({
          index: {
            _index: indexName,
            _id: doc._id,
          },
        });
        delete doc._id;
        body.push(doc);
      });
      users = [];
      await elasticClient.bulk({
        refresh: true,
        body,
      });
      body = [];
      console.log("------userCount, limit", userCount, limit);
      await fetchUsers(userCount, limit);
    } catch (e) {
      console.log("Exception (Error): ", e);
    }
  } else {
    finalData = {
      totalUsers: userCount,
      totalUpdated: updateCount,
      totalCreated: createCount,
    };
    console.log("finalDatafinalData", finalData);
    return finalData;
  }
}

module.exports = {
  fetchUsers,
};
