const User = require("../models/Users.js");
const bodyParser = require("body-parser");
let jwt = require("jsonwebtoken");
let config = require("../../config/database.js");
let middleware = require("../middleware");
var SquareConnect = require("square-connect");
var defaultClient = SquareConnect.ApiClient.instance;
// Configure OAuth2 access token for authorization: oauth2
var oauth2 = defaultClient.authentications["oauth2"];
var nodemailer = require("nodemailer");
oauth2.accessToken = config.square_up_access_token;
var stripe = require('stripe')(config.stripe_key);

exports.updateDeviceToken = (req, res) => {
  console.log(req.body);
  if (!req.body.device_token) {
    return res.status(400).send({
      message: "Device token field can not be empty"
    });
  } else if (!req.body.user_id) {
    return res.status(400).send({
      message: "User Id field can not be empty"
    });
  } else {
    User.findById(req.body.user_id).then(user => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.user_id
        });
      } else {
        User.findOne({ _id: order.user_id }, function(err, docs) {
          //    console.log(docs)
          if (docs) {
            User.findByIdAndUpdate(
              req.body.user_d,
              {
                device_token: req.body.device_token,
                device_type: req.body.device_type || null,
                device_language: req.body.device_language || null
              },
              { new: true }
            )
              .then(user => {
                if (!user) {
                  return res.status(404).send({
                    message: "User not found "
                  });
                }
                res.send(user);
              })
              .catch(err => {
                if (err.kind === "ObjectId") {
                  return res.status(404).send({
                    message: "User not found with id "
                  });
                }
                return res.status(500).send({
                  message: "Error updating user with id "
                });
              });
          } else {
            return res.status(400).send({
              message: "Unauthorized"
            });
          }
        }).catch(err => {
          if (err.kind === "ObjectId") {
            return res.status(404).send({
              message: "User not found with id " + req.params.orderId
            });
          }
          return res.status(500).send({
            message: "Error retrieving user with id " + req.params.orderId
          });
        });
      }
    });
  }
};

// Create and Save a new user
exports.create = (req, res) => {
  let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  //console.log(req)
  if (!req.body.first_name) {
    return res.status(400).send({
      message: "First Name field can not be empty"
    });
  } else if (!req.body.last_name) {
    return res.status(400).send({
      message: "Last Name field can not be empty"
    });
  } else if (!req.body.address) {
    return res.status(400).send({
      message: "Address field can not be empty"
    });
  } else if (
    !req.body.zipcode
    //       || !Number.isInteger(req.body.zipcode)
  ) {
    return res.status(400).send({
      message: "Zipcode field can not be empty and must be a number"
    });
  } else if (
    !req.body.mobile_number
    //      || !Number.isInteger(req.body.mobile_number)
  ) {
    return res.status(400).send({
      message: "Mobile Number field can not be empty and must be a number"
    });
  } else if (!req.body.password || req.body.password.length < 8) {
    return res.status(400).send({
      message:
        "Password field can not be empty and must be equal to or greater than 8 characters"
    });
  } else if (!req.body.email || regg.test(req.body.email) === false) {
    return res.status(400).send({
      message: "Email field can not be empty and must be a valid email address"
    });
  }
  User.find({ email: req.body.email }, function(err, docs) {
    if (docs.length) {
      return res.status(409).send({
        message: "Email exists already"
      });
    } else {   
         const body = {
          email: req.body.email,
          name: req.body.first_name+" "+req.body.last_name,
          address: {
            line1: req.body.address
          },
          phone: req.body.mobile_number,
      };
      console.log(JSON.stringify(body))
      stripe.customers.create(
        body,
        function(err, customer) { 
           if(err){
             console.log(err)
            res.status(err.statusCode).send({
              message:
                err.message || "Some error occurred while saving the User."
            });
            }
           var stripe_id = customer.id;
                     let role;
          if (req.body.email === "gw-superadmin@gmail.com") {
            role = "super-admin";
          } else {
            role = req.body.role || "user";
          }
          const user = new User({
            email: req.body.email,
            password: req.body.password,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            address: req.body.address,
            mobile_number: req.body.mobile_number,
            zipcode: req.body.zipcode,
            stripe_id: stripe_id,
            role: role,
            device_token: req.body.device_token
          });
          // Save user in the database
          user
            .save()
            .then(data => {
              let token = jwt.sign({ email: req.body.email }, config.secret);
              var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "washnbox@gmail.com",
                  pass: "femi123$"
                }
              });
              const mailOptions = {
                from: "washnbox@gmail.com", // sender address
                to: user.email, // list of receivers
                subject: "Greenworld Laundry App Account Created", // Subject line
                html: `<b>${user.first_name}, Your Account has been created successfully </b>` // plain text body
              };
              transporter.sendMail(mailOptions, function(err, info) {
                if (err) console.log(err);
                else console.log(info);
              });
              res.send({
                data: data,
                token: token
              });
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while saving the User."
              });
            });

        }
      );

        }
    })
  
};

// Login Admin
exports.login_admin = (req, res) => {
  let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (
    !req.body.password ||
    req.body.password < 8 ||
    !req.body.email ||
    regg.test(req.body.email) === false
  ) {
    return res.status(400).send({
      message: "Invalid Credentials"
    });
  }
  console.log(req.body);
  User.findOne({ email: req.body.email }, function(err, docs) {
    //    console.log(docs)
    if (docs) {
      docs.comparePassword(req.body.password, function(err, isMatch) {
        if (err){
          return res.status(400).send({
            message: "Invalid Credentials"
          });
        };
        if (isMatch) {
          if (docs.role === "admin" || docs.role === "super-admin") {
            let token = jwt.sign({ email: req.body.email }, config.secret, {
              expiresIn: "24h" // expires in 24 hours
            });
            // return the JWT token for the future API calls
            if(req.body.device_token){
              User.findOneAndUpdate({email: req.body.email}, {device_token: req.body.device_token}, function(err, docs){
                console.log(err)
              });
            }
            res.json({
              success: true,
              message: "Authentication successful!!!!",
              token: token,
              data: docs
            });
          }
        } else {
          return res.status(400).send({
            message: "Invalid Credentials"
          });
        }
      });
    } else {
      return res.status(400).send({
        message: "Invalid Credentials"
      });
    }
  });
};

// Login
exports.login = (req, res) => {
  let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (
    !req.body.password ||
    req.body.password < 8 ||
    !req.body.email ||
    regg.test(req.body.email) === false
  ) {
    return res.status(400).send({
      message: "Invalid Credentials"
    });
  }
  console.log(req.body);
  User.findOne({ email: req.body.email }, function(err, docs) {
    //    console.log(docs)
    if (docs) {
      docs.comparePassword(req.body.password, function(err, isMatch) {
        if (err){
          return res.status(400).send({
            message: "Invalid Credentials"
          });
        };
        if (isMatch) {
          let token = jwt.sign({ email: req.body.email }, config.secret, {
            expiresIn: "24h" // expires in 24 hours
          });
          if(req.body.device_token){
            User.findOneAndUpdate({email: req.body.email}, {device_token: req.body.device_token}, function(err, docs){
              console.log(err)
            });
           }
          // return the JWT token for the future API calls
          res.json({
            success: true,
            message: "Authentication successful!",
            token: token,
            data: docs
          });
        } else {
          return res.status(400).send({
            message: "Invalid Credentials"
          });
        }
      });
    } else {
      return res.status(400).send({
        message: "Invalid Credentials"
      });
    }
  });
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
  User.find().sort('-updatedAt')
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the users."
      });
    });
};

exports.findAllAdmins = (req, res) => {
  User.find({ role: "admin" }).sort('-updatedAt')
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the admins."
      });
    });
};

// Find a single user with a userId
exports.findOne = (req, res) => {
  User.findById(req.params.userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId
        });
      }
      res.send(user);
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId
        });
      }
      return res.status(500).send({
        message: "Error retrieving user with id " + req.params.userId
      });
    });
};

// Delete a user with the specified userId in the request
exports.delete = (req, res) => {
  User.findByIdAndRemove(req.params.userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId
        });
      }
      res.send({ message: "User deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId
        });
      }
      return res.status(500).send({
        message: "Could not delete User with id " + req.params.userId
      });
    });
};
