const responseMessage = require("../config/responseMessages");
const responseCode = require("../config/responseCode");
const User = require("../models/user.model");

const elasticClient = require("../helper/elastic-connection").elasticClient;

const elasticSearch = require("../controller/userElastic.controller");

exports.doSignup = async function (req, res) {
  const { email, password, confirm_password, referralToken, urlReferrer } =
    req.body;
  const is_valid_email = email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@'[\]#$%^&*"%()+_=,./\\:;<>?{}|~]{8,100}$/;
  var callFrom = req.body.callFrom;
  if (email == "" || email == undefined || !is_valid_email) {
    return res.status(responseCode.CODE_SUCCESS).json({
      success: false,
      code: responseCode.CODE_ON_INVALID_EMAIL,
      message: responseMessage.ERROR_MESSAGE_ENTER_VALID_EMAIL,
    });
  } else if (!password || !confirm_password) {
    return res.status(responseCode.CODE_SUCCESS).json({
      success: false,
      code: responseCode.CODE_PASSWORD_EMPTY,
      message: responseMessage.ERROR_PASSWORD_EMPTY,
    });
  } else if (password.length < 8 || confirm_password < 8) {
    return res.status(responseCode.CODE_SUCCESS).json({
      success: false,
      code: responseCode.CODE_PASSWORD_LENGTH,
      message: responseMessage.ERROR_PASSWORD_LENGTH,
    });
  } else if (!passwordRegex.test(password)) {
    return res.status(responseCode.CODE_SUCCESS).json({
      success: false,
      code: responseCode.CODE_ON_INVALID_PASSWORD,
      message: responseMessage.ERROR_MESSAGE_ENTER_VALID_PASSWORD,
    });
  } else if (password != confirm_password) {
    return res.status(responseCode.CODE_SUCCESS).json({
      success: false,
      code: responseCode.CODE_ON_PASSWORD_NOT_MATCH,
      message: responseMessage.ERROR_MESSAGE_ENTER_PASSWORD_NOT_MATCH,
    });
  } else {
    var user = await User.findOne({
      email: email,
    });

    if (user != null && user != "") {
      if (user && user.email_verification == false) {
        let ssoEmail = await setEmailToken.generateTokenForSso(user);
        return res.status(responseCode.CODE_SUCCESS).json({
          code: responseCode.CODE_USER_EMAIL_NOT_CONFIRMED_BUT_EXISTS,
          message: responseMessage.ERROR_USER_EMAIL_NOT_CONFIRMED_BUT_EXISTS,
          ssoEmail: ssoEmail,
        });
      }
    }

    if (user) {
      return res.status(responseCode.CODE_SUCCESS).json({
        code: responseCode.CODE_USER_EMAIL_ALREADY_EXISTS,
        message: responseMessage.ERROR_USER_EMAIL_ALREADY_EXISTS,
      });
    }

    let usernameNew = "";
    const secret = email;
    // Set user data
    var ipAddress = "";
    var newUser = new User();
    newUser.registerFrom = {
      ip: ipAddress,
      UserAgent: req.get("User-Agent"),
    };

    usernameNew = email.split("@");
    var username = usernameNew[0]
      .toLowerCase()
      .replace(/[ &\/\\#,+\-_()$~%.'":;*?<>{}\[\]]/g, "-");
    var val = Math.floor(1000 + Math.random() * 9000);
    username = username + "_" + val;
    newUser.email = email;
    newUser.password = password;
    newUser.email_verification = true;
    newUser.username = username;
    newUser.referralToken = referralToken;
    newUser.urlReferrer = urlReferrer;

    // Attempt to save the user
    const userObj = await newUser.save();
    await elasticSearch.insertSingleIndexUser(userObj, "");
    return res.status(200).json({
      message: "user add successfully",
      user: userObj,
      code: 200,
    });
  }
};

exports.addBulkUserDataInElastic = async function (req, res) {
  const data = await elasticSearch.userInit();
  if (data == "done") {
    return res.status(200).json({
      message: "data add successfully",
      data: data,
      code: 200,
    });
  } else {
    return res.status(200).json({
      message: "somethimg went wrong",
      code: 400,
    });
  }
};
exports.addBulkUserNameInElastic = async function (req, res) {
  try {
    const userId = req.body.id;
    const newUsername = req.body.username;

    // Find the user by their ID and update the username
    const user = await User.findByIdAndUpdate(
      userId,
      { first_name: newUsername },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    elasticSearch.updateSingleUser(user, "");
    return res.json({ message: "Username updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchUserInElastic = async function (req, res) {
  try {
    const email = req.query.email;

    query_data = JSON.stringify(req.query);
    query_data = JSON.parse(query_data);
    console.log("query_data>>>>", query_data.query_text);
    var query_text = query_data.query_text || "";
    query_text = query_text.trim();
    var queryText = escapeRegExp(query_text);
    function escapeRegExp(text) {
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    var query_text = queryText;
    var query = "";
    var allUsers = "";
    var searchResponse = "";
    var usersCount = "";
    var page = query_data.page;
    var limit = query_data.limit;
    var skip = query_data.skip;
    // search data from elastic
    console.log("query_text>>>>", query_text);
    if (query_text && query_text.length > 1) {
      console.log("in condition???");
      var query = {
        size: limit,
        from: skip,
        query: {
          bool: {
            must: [
              {
                match_phrase_prefix: {
                  email: {
                    query: query_text,
                  },
                },
              },
            ],
          },
        },
        sort: [
          {
            twoWayAuth: {
              order: "desc", // or "desc"
            },
          },
        ],
      };

      searchResponse = await elasticClient.search({
        index: "ssousers",
        body: query,
      });
    } else {
      console.log("in condition>>>>");
      searchResponse = await elasticClient.search({
        index: "ssousers",
        body: {
          size: limit,
          from: skip,
          query: {
            match_all: {}, // Match all documents
          },
        },
      });
    }

    if (searchResponse && searchResponse.body.hits.hits != undefined) {
      const hits = searchResponse?.body?.hits?.hits;
      allUsers = hits.map((hit) => hit._source);
      usersCount = searchResponse?.body?.hits?.total.value;
    }

    if (allUsers.length == 0) {
      if (query_text && query_text.length) {
        var querydb = {
          email: {
            $regex: queryText,
            $options: "i",
          },
        };
      }

      page = page;
      limit = limit;
      skip = skip;
      allUsers = await User.find(querydb).limit(limit).skip(skip).lean().exec();
      usersCount = await User.find(querydb).count();
    }

    if (!searchResponse) {
      return res.status(404).json({ message: email });
    }

    // elasticSearch.updateSingleUser(user, "");
    const allRecord = {
      page: page,
      skip: skip,
      allUsers: allUsers,
      usersCount: usersCount,
    };
    return res.status(responseCode.CODE_SUCCESS).json({
      data: allRecord,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteUserElastic = async function (req, res) {
  try {
    const userId = req.body.id;
    console.log("userid>>", userId);
    // Find the user by their ID and update the username
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await elasticSearch.deleteSingleUser(user, "");
    await user.deleteOne();
    return res.json({ message: "user", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = exports;
//module.exports = exports; //Object.assign({}, { signup, doLogin, login, verifySsoToken, doSignup, forgotPassword }); CODE_ERROR_500
