const elasticHelper = require("../helper/elastic-helper");
const userElasticMapping = require("../helper/elastic-mapping");
const elasticClient = require("../helper/elastic-connection").elasticClient;
const bulkInsertion = require("../helper/bulkUserInsertion");

const indexName = "ssousers";

exports.userInit = async function (req, res) {
  // check elasticsearch service working....
  const status = await elasticHelper.Ping();

  if (status) {
    await userInitialize();
  }
  return "done";
};

async function createIndex() {
  try {
    await elasticClient.indices.create({
      index: indexName,
      body: {
        mappings: userElasticMapping.ElasticSearchUserCrud.indexMapping,
      },
    });
    return true;
  } catch (e) {
    console.log("Index Created (Error): ", e);
    return false;
  }
}
async function insertBulk() {
  let limit = 100;
  let offset = 0;
  let finalData = null;
  try {
    await bulkInsertion.fetchUsers(offset, limit);
    return finalData;
  } catch (e) {
    console.log("Exception (Database): ", e);
  }
}
async function count() {
  try {
    const count = await elasticClient.cat.count({
      index: indexName,
    });
    return count;
  } catch (e) {
    return 0;
  }
}

async function deleteIndex() {
  try {
    const result = await elasticClient.indices.delete({
      index: indexName,
    });
    return result.acknowledged;
  } catch (e) {
    console.log("Index Deleted (Error): ", e);
    return false;
  }
}

async function userInitialize() {
  await deleteIndex();
  await createIndex();
  await insertBulk();
  await count();
}

exports.updateSingleUser = async function (userData, userId) {
  const _doc = userData;
  if (_doc) {
    try {
      const first_name = _doc.first_name;
      const last_name = _doc.last_name;
      const forceLogout = _doc.forceLogout;
      const deActivated = _doc.deActivated;
      const twoWayAuth = _doc.twoWayAuth;
      const result = await elasticClient.update({
        index: indexName,
        type: "_doc",
        id: _doc._id.toString(),
        body: {
          doc: {
            first_name,
            last_name,
            forceLogout,
            deActivated,
            twoWayAuth,
          },
        },
      });
      //    if (_doc.userLoginActivityId && (_doc.userLoginActivityId.id != undefined || _doc.userLoginActivityId.id != null)) {
      //        await userLogsElastic.updateUserLogsObjectValues(_doc, _doc.userLoginActivityId.id)
      //    }
      return result.result == "created" || result.result == "updated";
    } catch (e) {
      console.log(e);
      return e.toString();
    }
  } else {
    return false;
  }
};
exports.insertSingleIndexUser = async function (user, userId) {
  let _doc = user;
  if (_doc) {
    try {
      // delete _doc._id;
      (first_name = _doc.first_name),
        (last_name = _doc.last_name),
        (forceLogout = _doc.forceLogout),
        (deActivated = _doc.deActivated),
        (twoWayAuth = _doc.twoWayAuth);
      email = _doc.email;
      const result = await elasticClient.index({
        index: indexName,
        id: user._id,
        type: "_doc",
        body: {
          first_name,
          last_name,
          forceLogout,
          deActivated,
          twoWayAuth,
          email,
        },
      });
      return result.result == "created" || result.result == "updated";
    } catch (e) {
      return e.toString();
    }
  } else {
    console.log("errr");
    return false;
  }
};
exports.deleteSingleUser = async function (userData, userId) {
  const _doc = userData;
  if (_doc) {
    try {
      const result = await elasticClient.delete({
        index: indexName,
        type: "_doc",
        id: _doc._id.toString(),
      });

      return result.result == "created" || result.result == "updated";
    } catch (e) {
      console.log(e);
      return e.toString();
    }
  } else {
    return false;
  }
};
