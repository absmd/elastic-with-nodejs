const { Client } = require("@elastic/elasticsearch");
const elasticConnectUrl = `http://192.168.0.1:9200`;
exports.elasticClient = new Client({
  node: elasticConnectUrl,
});
