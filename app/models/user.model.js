var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var Schema = mongoose.Schema;
const { any } = require("underscore");

var UserSchema = new Schema(
  {
    email: { type: String, unique: true, index: true, lowercase: true },
    password: { type: String },
    // api_key: { type: String, index: true, unique: true }, // unique API_KEY for user indentifier
    token_key: { type: String }, // randomly generated token key for api access
    urlReferrer: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    verificationCode: { type: Number },
    code_count: { type: Number },
    code_createdAt: { type: Date },
    emailverifyCode: { type: Number },
    phoneNumber: { type: String },
    synchronized_date: { type: Date },
    referralToken: { type: String },
    phone: {
      home: { type: String },
      office: { type: String },
      personal: { type: String },
    },
    email_verification: { type: Boolean, default: false },
    phone_number_verification: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    status: {
      type: {
        active: { type: Boolean, default: true },
        suspended: { type: Boolean, default: false },
      },
      default: { active: true, suspended: false },
    }, // account activated or not or blocked
    social_profile: {
      type: {
        facebook: { token: String, email: String },
        twitter: { token: String, email: String },
        linkedin: { token: String, email: String },
        google: { token: String, email: String },
      },
    },
    images: {
      profile_pic: String,
      featurePhotoOne: { 100: String, 700: String },
      featurePhotoTwo: { 100: String, 700: String },
      featurePhotoThree: { 100: String, 700: String },
      featurePhotoFour: { 100: String, 700: String },
      featurePhotoFive: { 100: String, 700: String },
    },
    business_name: { type: String }, // user business Infos business name
    username: { type: String, unique: true },
    // unique_url: { type: String, unique: true, lowercase: true },
    salt: { type: String }, // unique salt for reset password
    optimizedProfilePic: { size30: String, thumbnail: String, large: String },
    cover_pic: { type: String },
    aboutme: { type: String },
    birthday: { type: Date },
    gender: { type: String },
    location: { type: String },
    emailChange: {
      email: { type: String, default: null },
      securityCode: { type: String, default: null },
      expired: { type: Date, default: Date.now },
    },
    usernameChange: {
      username: { type: String, default: null },
      changeDate: { type: Date, default: null },
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
    registerFrom: { ip: { type: String }, UserAgent: { type: String } },
    intermediateToken: { type: String }, // user business Infos business name
    // New fields
    twoWayAuth: { type: Boolean, default: false }, // for user two way authentication
    twoWayAuthCode: { type: Number },
    // alternate_email: { type: String, unique: true, index: true, lowercase: true },
    social_link: { type: String, lowercase: true },
    ssoToken: { type: String }, // user business Infos business name
    fax: { type: String, lowercase: true },
    authCodeCreatedAt: { type: Date },
    // address: { type: String, lowercase: true }, //seller address
    // use below address for signup

    originInfo: [
      {
        origin: {
          type: String,
        },
        status: {
          type: Boolean,
          default: false,
        },
        originCreatedAt: {
          type: Date,
          default: Date.now,
        },
        originId: {
          type: String,
        },
        isTrashed: { type: Boolean, default: false },
      },
    ],
    origin: {
      type: String,
      default: "sso",
    },
    forceLogout: { type: Boolean, default: false },
    deActivated: {
      type: Boolean,
      default: false,
    },
    auth_code_count: {
      type: Number,
    },
    auth_codeCount_createdAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    userLoginActivityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userLoginActivity",
    },
  },
  {
    usePushEach: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

/*
  |--------------------------------------------------------------------------
  | Hide password
  |--------------------------------------------------------------------------
  */
// UserSchema.methods.toJSON = function () {
//  var user = this.toObject();
//  delete user.password;
//  return user;
// };

/*
  |--------------------------------------------------------------------------
  | Password hash create
  |--------------------------------------------------------------------------
  */
UserSchema.pre("save", function (next) {
  var self = this;
  if (!self.isModified("password")) return next();
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(self.password, salt, null, function (err, hash) {
      if (err) return next(err);
      self.password = hash;
      next();
    });
  });
});

// UserSchema.pre('findOneAndUpdate', async function (next) {
//   const currentDate = new Date(new Date().toUTCString());
//   const docToUpdate = await this.model.findOne(this.getQuery());
//   var changeUserDate = new Date(docToUpdate.usernameChange.changeDate);
//   changeUserDate.setMonth( changeUserDate.getMonth() + 3 );
//   if (docToUpdate.username !== this._update.username && changeUserDate < currentDate){
//       this._update.usernameChange = { username: this._update.username, changeDate: currentDate };
//       next();
//     } else {
//       return next();
//     }
// });

/*
|--------------------------------------------------------------------------
| Update meta tags title
 |--------------------------------------------------------------------------
*/

// runs in case doc.updateOne, example const doc = new Model(); await doc.updateOne({ $set: { name: 'test' } });
// UserSchema.pre('updateOne', { document: true, query: false }, function (next) {
//   // console.log('in update one case, this refers to the updating doc');
//   next();
// });

// runs in case Model.updateOne, await Model.updateOne({}, { $set: { name: 'test' } });
// UserSchema.pre('updateOne', async function (next) {
//   if (
//     this._update['$set'].business_info &&
//     this._update['$set'].business_info[0] &&
//     this._update['$set'].business_info[0].businessType
//   ) {
//     const businessTypeObject = await BussinessType.findById(
//       this._update['$set'].business_info[0].businessType
//     );
//     if (businessTypeObject && businessTypeObject.bussinessTypeName) {
//       console.log(
//         'bussinessTypeName: ',
//         businessTypeObject.bussinessTypeName,
//         'businessName: ',
//         this._update['$set'].business_info[0].businessName
//       );
//       const title = generateTitle(
//         businessTypeObject.bussinessTypeName,
//         this._update['$set'].business_info[0].businessName
//       );
//       this.set({ 'metaTags.title': title });
//     }
//   }
//   next();
// });

// UserSchema.pre('findOneAndUpdate', async function (next) {
//   // update title if businessType exists (possibility is updated)...
//   if (
//     this._update.business_info &&
//     this._update.business_info[0] &&
//     this._update.business_info[0].businessType
//   ) {
//     const businessTypeObject = await BussinessType.findById(
//       this._update.business_info[0].businessType
//     );
//     if (businessTypeObject && businessTypeObject.bussinessTypeName) {
//       const title = generateTitle(
//         businessTypeObject.bussinessTypeName,
//         this._update.business_name
//       );
//       this.set({ 'metaTags.title': title });
//     }
//   }

//   next();
// });

// UserSchema.post('save', async function (doc) {
//   if (this.wasNew) {
//     elasticSearch.SingleIndexUser(this._id);

//   }
// });
/*
 |--------------------------------------------------------------------------
 | Compare Password
 |--------------------------------------------------------------------------
*/
UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, callback);
};

var Model = mongoose.model("User", UserSchema);
module.exports = Model;
