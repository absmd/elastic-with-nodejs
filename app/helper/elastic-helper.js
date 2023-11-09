const elasticClient = require("./elastic-connection").elasticClient;
exports.Ping = async function (req, res) {
  try {
    const status = await elasticClient.ping(); // Success Testing
    if (status) {
      console.log("Elastic search is running");
    } else {
      console.log("Elastic search instance is down");
    }
    return status;
  } catch (e) {
    console.log("ping error: ", e);
    return false;
  }
};

exports.indicesList = async function (req, res) {
  try {
    await elasticClient.cat.indices({
      h: ["index"],
    });
  } catch (e) {
    console.log("indices list error: ", e);
  }
};
