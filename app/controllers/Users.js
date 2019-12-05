const User = require('../models/Users.js');
const bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
let config = require('../../config/database.js');
let middleware = require('../middleware');
// Create and Save a new user
exports.create = (req, res) => {
    let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
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
    }else if(!req.body.zipcode || !Number.isInteger(req.body.zipcode)){
        return res.status(400).send({
            message: "Zipcode field can not be empty and must be a number"
        });
    }else if(!req.body.mobile_number || !Number.isInteger(req.body.mobile_number)){
        return res.status(400).send({
            message: "Mobile Number field can not be empty and must be a number"
        });
    }else if(!req.body.password || req.body.password < 8){
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
            // Create a user
            const user = new User({
            dropbox_id: req.body.dropbox_id, 
            user_id: req.body.user_id,
            order_id: req.body.order_id,
            dropbox_address: req.body.dropbox_address,
            price: req.body.price,
            stage: 'In Process',
            preferences: req.body.preferences || null
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
User.find({email : req.body.email, password: req.body.password}, function (err, docs) {
    if (docs.length){
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
exports.updateStage = (req, res) => {
    if(!req.body.stage) {
        return res.status(400).send({
            message: "Stage field can not be empty"
        });
    }else if(!req.body.userId){
        return res.status(400).send({
            message: "OrderId field can not be empty"
        });
    }
    User.findByIdAndUpdate(req.params.userId, {
        stage: req.body.stage,
    }, {new: true})
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
            message: "Error updating user with id " + req.params.userId
        });
    });
};