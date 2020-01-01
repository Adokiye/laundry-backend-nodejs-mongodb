const User = require('../models/Users.js');
const bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
let config = require('../../config/database.js');
let middleware = require('../middleware');
var SquareConnect = require('square-connect');
var defaultClient = SquareConnect.ApiClient.instance;
// Configure OAuth2 access token for authorization: oauth2
var oauth2 = defaultClient.authentications['oauth2'];

oauth2.accessToken = config.square_up_access_token;

// Create and Save a new user
exports.create = (req, res) => {
    let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    //console.log(req)
    if(!req.body.first_name) {
        return res.status(400).send({
            message: "First Name field can not be empty"
        });
    }else if(!req.body.last_name){
        return res.status(400).send({
            message: "Last Name field can not be empty"
        });
    }else if(!req.body.address){
        return res.status(400).send({
            message: "Address field can not be empty"
        });
    }else if(!req.body.zipcode 
 //       || !Number.isInteger(req.body.zipcode)
        ){
        return res.status(400).send({
            message: "Zipcode field can not be empty and must be a number"
        });
    }else if(!req.body.mobile_number
   //      || !Number.isInteger(req.body.mobile_number)
         ){
        return res.status(400).send({
            message: "Mobile Number field can not be empty and must be a number"
        });
    }else if(!req.body.password || req.body.password.length < 8){
        return res.status(400).send({
            message: "Password field can not be empty and must be equal to or greater than 8 characters"
        });
    }else if(!req.body.email || (regg.test(req.body.email) === false)){
        return res.status(400).send({
            message: "Email field can not be empty and must be a valid email address"
        });
    }
    User.find({email : req.body.email}, function (err, docs) {
        if (docs.length){
            return res.status(409).send({
                message: "Email exists already"
            });
        }else{
            let square_up_data = ''
            var apiInstance = new SquareConnect.CustomersApi();
        //    var body = new SquareConnect.CreateCustomerRequest({
        //         given_name: req.body.first_name,
        //         family_name: req.body.last_name,
        //         email_address: req.body.email,
        //         phone_number: req.body.mobile_number,
        //     }); // CreateCustomerRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
             
            const body = {
                given_name: req.body.first_name,
                family_name: req.body.last_name,
                email_address: req.body.email,
          //      phone_number: req.body.mobile_number,
            }
            console.log(body)
            apiInstance.createCustomer(body).then(function(data) {
                console.log('API called successfully. Returned data: ' + data);
                square_up_data = data;
                            // Create a user
                            let role;
                            if(req.body.email === "gw-superadmin@gmail.com"){
                                role = 'super-admin'
                            }else{
                                role = req.body.role || ''
                            }
            const user = new User({
                email: req.body.email, 
                password: req.body.password,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                address: req.body.address,
                mobile_number: req.body.mobile_number,
                zipcode: req.body.zipcode,
                square_up_id: square_up_data.customer.id,
                role: role
                });
                // Save user in the database
                user.save()
                .then(data => {
                let token = jwt.sign({email: req.body.email},
                        config.secret,
                );
                res.send({
                    data: data,
                    token: token
                  });
                }).catch(err => {
                res.status(500).send({
                message: err.message || "Some error occurred while saving the User."
                });
                });
              }, function(error) {
                console.error(error);
              }); 
//                 try {
//     const respone = await payments_api.createPayment(request_body);
//     const json = JSON.stringify(respone);
//     res.render('process-payment', {
//       'title': 'Payment Successful',
//       'result': json
//     });
//   } catch (error) {
//     res.render('process-payment', {
//       'title': 'Payment Failure',
//       'result': error.response.text
//     });
//   }

        }
    });
};

// Login
exports.login_admin = (req, res) => {
    let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!req.body.password || req.body.password < 8 || !req.body.email || (regg.test(req.body.email) === false)){
            return res.status(400).send({
                message: "Invalid Credentials"
            });
    }
    console.log(req.body)
    User.findOne({email : req.body.email}, function (err, docs) {
     //    console.log(docs)
        if (docs){  
            docs.comparePassword(req.body.password, function(err, isMatch) {
                if (err) throw err;
                if(isMatch){
                    if(docs.role === 'admin' || docs.role === 'super-admin'){
                                                 let token = jwt.sign({email: req.body.email},
                config.secret,
                { expiresIn: '24h' // expires in 24 hours
                }
              );
              // return the JWT token for the future API calls
              res.json({
                success: true,
                message: 'Authentication successful!!!!',
                token: token,
                data: docs
              });   
                    }

                }else{
                    return res.status(400).send({
                        message: "Invalid Credentials"
                    });
                }
            });
        }else{
            return res.status(400).send({
                message: "Invalid Credentials"
            });
        }
    });
    };

// Login
exports.login = (req, res) => {
let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
if(!req.body.password || req.body.password < 8 || !req.body.email || (regg.test(req.body.email) === false)){
        return res.status(400).send({
            message: "Invalid Credentials"
        });
}
console.log(req.body)
User.findOne({email : req.body.email}, function (err, docs) {
 //    console.log(docs)
    if (docs){  
        docs.comparePassword(req.body.password, function(err, isMatch) {
            if (err) throw err;
            if(isMatch){
                      let token = jwt.sign({email: req.body.email},
            config.secret,
            { expiresIn: '24h' // expires in 24 hours
            }
          );
          // return the JWT token for the future API calls
          res.json({
            success: true,
            message: 'Authentication successful!',
            token: token,
            data: docs
          });  
            }else{
                return res.status(400).send({
                    message: "Invalid Credentials"
                });
            }
        });
    }else{
        return res.status(400).send({
            message: "Invalid Credentials"
        });
    }
});
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
    User.find()
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving the users."
        });
    });
};

exports.findAllAdmins = (req, res) => {
    User.find({role: 'admin'})
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving the admins."
        });
    });
};



// Find a single user with a userId
exports.findOne = (req, res) => {
    User.findById(req.params.userId)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
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
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
        res.send({message: "User deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });                
        }
        return res.status(500).send({
            message: "Could not delete User with id " + req.params.userId
        });
    });
};