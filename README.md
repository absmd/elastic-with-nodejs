Elastic Search
Elasticsearch is a powerful and scalable open-source search and analytics engine. It allows you to store, search, and analyze large amounts of data quickly and efficiently, making it ideal for applications like log analysis, data exploration, and real-time search.
 Elasticsearch is part of the Elastic Stack, which also includes Kibana, Logstash, and Beats, and it is widely used for various use cases such as application search, logging and log analysis, monitoring, and more.
Some Key Features
Here are some key features and reasons why Elasticsearch is commonly used:
Scalability and Performance: Elasticsearch is designed to handle massive amounts of data and is highly scalable. It distributes data across multiple nodes, ensuring efficient storage and retrieval, making it suitable for handling big data and high traffic applications.
Powerful Search Capabilities: Elasticsearch offers full-text search, fuzzy search, and advanced search features, enabling users to quickly and accurately search through large volumes of data.
Real-time Data Analysis: Elasticsearch supports real-time data analysis, allowing users to gain insights and make informed decisions based on up-to-date information. It provides aggregations, filters, and analytics capabilities for data exploration and visualization.
Document-oriented and Schema-less: Elasticsearch is document-oriented and schema-less, allowing flexibility in data structure and dynamic mapping of fields. This makes it easy to store, search, and analyze diverse types of data without the need for predefined schemas.
RESTful API and Client Libraries: Elasticsearch offers a RESTful API that allows developers to interact with the system using HTTP requests. It also provides client libraries for various programming languages, simplifying the integration process and enabling developers to work with Elasticsearch using their preferred language.
Overall, Elasticsearch is popular for its speed, scalability, flexibility, and ease of use. It is widely used in various domains such as e-commerce, content management, cybersecurity, data analysis, and log management, among others
Installation

To begin, use cURL, the command line tool for transferring data with URLs, to import the Elasticsearch public GPG key into APT. Note that we are using the arguments -fsSL to silence all progress and possible errors (except for a server failure) and to allow cURL to make a request on a new location if redirected. Pipe the output of the cURL command into the apt-key program, which adds the public GPG key to APT.

In Linux-based operating systems, APT (Advanced Package Tool) is a package management system used to install, update, and manage software packages. GPG (GNU Privacy Guard) is a cryptographic software tool used for secure communication and package verification.
The line suggests that you need to import the Elasticsearch public GPG key into the APT keyring. GPG keys are used to verify the authenticity and integrity of packages during installation. By importing the Elasticsearch GPG key, you ensure that APT can verify the integrity of Elasticsearch packages and prevent the installation of potentially malicious or tampered software.

If you are using window then open using cmd and click run as a administrator
If you are using linux the open terminal using then Ctrl+Alt+T it launch a terminal
If you are using mac then click the Launchpad icon in the Dock, type Terminal in the search field, then click Terminal

Run below commands

curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -



Next, add the Elastic source list to the sources.list.d directory, where APT will look for new sources:

echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list



Next, update your package lists so APT will read the new Elastic source:

sudo apt update

Then install Elasticsearch with this command:

sudo apt install elasticsearch


Configuring Elasticsearch
To configure Elasticsearch, we will edit its main configuration file elasticsearch.yml where most of its configuration options are stored. This file is located in the /etc/elasticsearch directory.
Use your preferred text editor to edit Elasticsearch’s configuration file. Here, we’ll use nano:
sudo nano /etc/elasticsearch/elasticsearch.yml


Start the Elasticsearch service with systemctl.

sudo systemctl start elasticsearch

Next, run the following command to enable Elasticsearch to start up every time your server boots:
sudo systemctl enable elasticsearch


Testing Elasticsearch
curl -X GET 'http://localhost:9200'



For more information please visit below website 
https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-18-04

Implementation In code
Mapping
Mapping in Elasticsearch defines how data is structured and how its fields are indexed and stored. It defines the data types, such as strings, numbers, dates, and complex types like arrays or objects. 

Indexing:
	indexing is the process of storing and organizing the actual documents based on the mapping. 


Make a folder named helper in a app folder in this folder create a file named elastic-mapping.js

exports.ElasticSearchUserCrud = {
   indexMapping: {
       properties: {
           email: {
               type: 'text',
           },
           first_name: {
               type: 'text'
           },
           last_name: {
               type: 'text'
           },
           twoWayAuth: {
               type: 'boolean',
           },
           forceLogout: {
               type: 'boolean',
           },
           deActivated: {
               type: 'boolean',
           }
       },
   },


}


exports.ElasticSearchUserLogsCrud = {
   indexMapping: {
       properties: {
           userEmail: {
               type: 'keyword',
           },
           originInfo: {
               "type": "nested",
           },
           totalThresholdCount: {
               type: "float"
           },
           userId: {
               type: 'object',
               properties: {
                   forceLogout: {
                       type: 'boolean'
                   },
                   deActivated: {
                       type: 'boolean'
                   },
                   twoWayAuth: {
                       type: "boolean"
                   }
               },
           },
       },
   },
}



First we make elastic connection in locally we use url  localhost:9200 

In a  helper folder make a file named elastic-connection.js

First install a package of @elastic/elasticsearch using a command 
 npm install elasticsearch
 npm install @elastic/elasticsearch

Data Save In ElasticSearch



const {
   Client
} = require('@elastic/elasticsearch');
const elasticConnectUrl = `http://localhost:9200`
exports.elasticClient = new Client({
   node: elasticConnectUrl
});


Now we check the status of the connection if the status is true meaning that elastic is connected successfully other elastic is not connected.

make a file in helper folder named elastic-helper.js and import a file elastic-connection from helper folder 

const elasticClient = require("./elastic-connection").elasticClient


exports.Ping = async function (req, res) {
   try {
       const status = await elasticClient.ping(); // Success Testing
       if (status) {
           console.log('Elastic search is running');
       } else {
           console.log('Elastic search instance is down');
       }
       return status;
   } catch (e) {
       console.log('ping error: ', e);
       return false;
   }
}


exports.indicesList = async function (req, res) {
   try {
       await elasticClient.cat.indices({
           h: ['index']
       });
   } catch (e) {
       console.log('indices list error: ', e);
   }
}
exports.deleteIndices = async function (req, res) {
   try {
       await elasticClient.indices.delete({
           index: '_all'
       });
   } catch (e) {
       console.log('all indices delete error: ', e);
   }
}


module.exports = exports;


There are three function in this file Ping() function tell us about elastic is running or not 
Another function named indicesList()  tells us about how many indexes show in a list.
Third one is deleteIndoces() function used to delete all indices . 

In a helper folder make a new file named bulkUserInsertion.js In this file we make a function named fetchUsers() from db and used query to save data in elastic.

bulkUserInsertion.js

const User = require('../models/user.model');
const elasticClient = require("./elastic-connection").elasticClient
  
 let userCount = 0;
 let limit = 1000;
 let offset = 0;
 let createCount = 0;
 let updateCount = 0;
 let finalData = null;


async function fetchUsers(offset, limit) {
     const indexName = "ssousers"
     let users = await User.find({}).lean().select('_id email deActivated twoWayAuth forceLogout first_name last_name').skip(offset).limit(limit)
     if (users.length) {
         try {
             userCount = userCount + users.length;
             let body = [];
             users.forEach((doc) => {
                 body.push({
                     index: {
                         _index: indexName,
                         _id: doc._id
                     }
                 });
                 delete doc._id;
                 body.push(doc);
             });
             users = [];
             await elasticClient.bulk({
                 refresh: true,
                 body
             });
             body = [];
             await fetchUsers(userCount, limit);
         } catch (e) {
             console.log('Exception (Error): ', e);
         }
     } else {
         finalData = {
             totalUsers: userCount,
             totalUpdated: updateCount,
             totalCreated: createCount,
         };
         console.log("finalDatafinalData", finalData)
         return finalData;
     }
 }
  module.exports = {
     fetchUsers
 };


Make a folder named elastic and make a file named userElastic.controller.js
In this file  import all files of helper folder. 

userElastic.controller.js

const elasticHelper = require("../../helper/elastic-helper")
const userElasticMapping = require("../../helper/elasticMapping")
const elasticClient = require("../../helper/elastic-connection").elasticClient
const bulkInsertion = require("../../helper/bulkUserInsertion")


const indexName = "ssousers"


exports.userInit = async function (req, res) {
   // check elasticsearch service working....
   const status = await elasticHelper.Ping()


   if (status) {
      await userInitialize()
   }
   return "done"
};


exports.updateSingleUser = async function (userData, userId) {
   const _doc = userData
   if (_doc) {
           try {
               const first_name = _doc.first_name
               const last_name = _doc.last_name
               const forceLogout = _doc.forceLogout
               const deActivated = _doc.deActivated
               const twoWayAuth = _doc.twoWayAuth
           const result = await elasticClient.update({
               index: indexName,
               type: "_doc",
               id: userId.toString(),
               body: {
                   doc: {
                       first_name,
                       last_name,
                       forceLogout,
                       deActivated,
                       twoWayAuth
                   }
               },
           });
           return result.result == 'created' || result.result == 'updated';
       } catch (e) {
           console.log(e);
           return e.toString();
       }
       } else {
           return false;
       }
}
exports.deleteOne = async function (userId) {
   try {
       await elasticClient.delete({
           id: userId,
           type: '_doc',
           index: indexName,
           refresh: true,
       });


       return true;
   } catch (e) {
       return false;
   }
}


exports.insertSingleIndexUser = async function (user, userId) {
   let _doc = user
   if (_doc) {
           try {
           // delete _doc._id;
                first_name = _doc.first_name,
                    last_name = _doc.last_name,
                    forceLogout = _doc.forceLogout,
                    deActivated = _doc.deActivated,
                    twoWayAuth = _doc.twoWayAuth
                    email = _doc.email
           const result = await elasticClient.index({
               index: indexName,
               id: userId,
               type: '_doc',
               body: {
                   first_name,
                   last_name,
                   forceLogout,
                   deActivated,
                   twoWayAuth,
                   email
               },
           });
           return result.result == 'created' || result.result == 'updated';
       } catch (e) {
           return e.toString();
       }
       } else {
           console.log("errr")
           return false;
       }
}


async function insertBulk() {
   let limit = 1000;
   let offset = 0;
   let finalData = null;
   try {
       await bulkInsertion.fetchUsers(offset, limit)
       return finalData;
   } catch (e) {
       console.log('Exception (Database): ', e);
   }
}


async function count() {
   try {
       const count = await elasticClient.cat.count({
           index: indexName
       });
       return count;
   } catch (e) {
       return 0;
   }
}


async function createIndex() {
   try {
       await elasticClient.indices.create({
           index: indexName,
           body: {
               mappings: userElasticMapping.ElasticSearchUserCrud.indexMapping
           },
       });
       return true;
   } catch (e) {
       console.log('Index Created (Error): ', e);
       return false;
   }
}


async function deleteIndex() {
   try {
       const result = await elasticClient.indices.delete({
           index: indexName,
       });
       return result.acknowledged;
   } catch (e) {
       console.log('Index Deleted (Error): ', e);
       return false;
   }
}


async function userInitialize() {
    await deleteIndex();
    await createIndex();
    await insertBulk();
    await count();
}


module.exports = exports;









When we init() function. This function first delete index if exists using deleteIndex() and then create a index according to a mapping using a createIndex() . then insert a data using insertBulk() function. Then we count how many users add using count() . 


For run a script  

we Make a folder named api and make a file in that folder named auth.controller.js
In this file import elastic controller file and user userInit() function

auth.controller.js

const elasticSearch = require("../elastic/userElastic.controller")
exports.addBulkUserDataInElastic = async function (req, res) {
 const data = await elasticSearch.userInit()
 if (data == "done") {
   return res.status(responseCode.CODE_SUCCESS).json({
     message: "data add successfully",
     data: data,
     code: 200
   });
 } else {
   return res.status(responseCode.CODE_SUCCESS).json({
     message: "somethimg went wrong",
     code: 400
   });
 }
}


Make a folder named route and make a file named  index.js for routing and import auth controller file 

const api_auth_controller = require("../controller/api/auth.controller");
const express = require("express");
const router = express.Router();




router
 .route("/addBulkUserDataInElastic")
 .get(api_auth_controller.addBulkUserDataInElastic)
module.exports = router;



Now we call a script to save data in elastic search and use your port number instead of 3010.

http://localhost:3010/addBulkUserDataInElastic

Use any chrome extension to see the data in elastic search like (ElasticSearch Tools, Multi ElasticSearch Head)

Data look like this 






Now get data from elastic search for searching and filter users.



exports.showSsoUsers = async function (req, res) {
 const user = req.session.user || ''
 if (user.email != config.adminEmail) {
   return res.redirect('/');
 }
 var query_text = req.query.q || "";
 query_text = query_text.trim();
 var queryText = escapeRegExp(query_text);


 function escapeRegExp(text) {
   return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 }
 var query = ""
 var allUsers = ""
 var searchResponse = ""
 var usersCount= ""
 var page = parseInt(req.query.page) || 1;
 var limit = req.query.limit ? parseInt(req.query.limit) : 10;
 var skip = (page > 1 ? (page - 1) * limit : 0);
 // search data from elastic
 if (query_text && query_text.length) {
   console.log("in condition")
   var query = {
     "size": limit,
     "from": skip,
     query: {
       "match_phrase_prefix": {
         "email": {
           "query": query_text,
         }
       }
     }


   };
   searchResponse = await elasticClient.search({
     index: 'ssousers',
     body: query
   });
 } else {
   searchResponse = await elasticClient.search({
     index: 'ssousers',
     body: {
        "size": limit,
        "from": skip,
       query: {
         match_all: {} // Match all documents
       }
     }
   })
 }
 // console.log("out of condition=====", searchResponse?.body)
 // if (searchResponse && searchResponse.hits != undefined) {
   const hits = searchResponse?.body?.hits?.hits;
   allUsers = hits.map((hit) => hit._source);
   console.log("alllllllllllllll", allUsers)
   usersCount = searchResponse?.body?.hits?.total.value
 // }
 if (allUsers.length == 0) {
   if (query_text && query_text.length) {
     var querydb = {
       $or: [{
           username: {
             $regex: queryText,
             $options: "i",
           },
         },
         {
           email: {
             $regex: queryText,
             $options: "i",
           },
         },
       ],
     };
   }
   page = parseInt(req.query.page) || 1;
   limit = req.query.limit ? parseInt(req.query.limit) : 10;
   skip = (page ? page - 1 : 0) * limit;
   allUsers = await User.find(querydb).limit(limit).skip(skip).lean().exec();
   usersCount = await User.find(querydb).count();


 }


 let pageUrl = req.url || ''
 if (pageUrl) {
   pageUrl = pageUrl.split('/')
   pageUrl = pageUrl[1]
 }
 var userData = await User.findOne({
   email: user.email
 })
};






Note : 

In this api if get found from elastic search. If no users found from elastic search then we get users from mongodb. 



These users data are coming from elastic search. When user search through email or text then search data also come from elastic search . 



When admin deactivate any user then this field update in db and also in elastic search . 

For this i use below code 

const elasticSearch = require("./elastic/userElastic.controller")




const user = req.body.userEmail;
   const userSession = req.session.user;
   const userStatus = req.body.userStatus;
   var dateTimeStamp = Date.now();
   if (userStatus === "deActive") {
     const userObjs = await User.findOneAndUpdate(
       {
         email: user,
       },
       {
         $set: {
           forceLogout: true,
           "originInfo.0.status": false,
           deActivated: true,
         },
       },{
         new:true
       }
     ).populate({
       path: 'userLoginActivityId',
       select: 'id',
       model: 'userLoginActivity'
     }).select('-_id')
     const user_obj = await User.findOne({
       email: user,
     }).select('_id')
     console.log(userObjs, user_obj.id)
     elasticSearch.updateSingleUser(userObjs, user_obj.id)
     let messageData = generateToken(userObjs, "user_logout");


updateSingleUser() is used to update data in elasticsearch

Write upadteSingleUser() in userElastic.controller.js




exports.updateSingleUser = async function (userData, userId) {
   const _doc = userData
   if (_doc) {
           try {
               const first_name = _doc.first_name
               const last_name = _doc.last_name
               const forceLogout = _doc.forceLogout
               const deActivated = _doc.deActivated
               const twoWayAuth = _doc.twoWayAuth
           const result = await elasticClient.update({
               index: indexName,
               type: "_doc",
               id: userId.toString(),
               body: {
                   doc: {
                       first_name,
                       last_name,
                       forceLogout,
                       deActivated,
                       twoWayAuth
                   }
               },
           });
           return result.result == 'created' || result.result == 'updated';
       } catch (e) {
           console.log(e);
           return e.toString();
       }
       } else {
           return false;
       }
}

 
Now we write a function in this file for new user. When new account is created and after verifying email that account is  save in elasticSearch.

exports.insertSingleIndexUser = async function (user, userId) {
   let _doc = user
   if (_doc) {
           try {
           // delete _doc._id;
                first_name = _doc.first_name,
                    last_name = _doc.last_name,
                    forceLogout = _doc.forceLogout,
                    deActivated = _doc.deActivated,
                    twoWayAuth = _doc.twoWayAuth
                    email = _doc.email
           const result = await elasticClient.index({
               index: indexName,
               id: userId,
               type: '_doc',
               body: {
                   first_name,
                   last_name,
                   forceLogout,
                   deActivated,
                   twoWayAuth,
                   email
               },
           });
           return result.result == 'created' || result.result == 'updated';
       } catch (e) {
           return e.toString();
       }
       } else {
           console.log("errr")
           return false;
       }
}


How Does ElasticSearch Work?



Get user in elasticsearch extension using query

	Query syntax like 

{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "email": "muhammadrizwaneng@gmail.com"
          }
        }
      ]
    }
  },
  "size": 1
}

