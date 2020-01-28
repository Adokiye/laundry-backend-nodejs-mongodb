const Notification = require('../models/Notifications.js');
const User = require("../models/Users.js");
var admin = require("firebase-admin");
var serviceAccount = require("../../config/key.json");
// Create and Save a new notification
exports.create = (req, res) => {
    if(!req.body.description) {
        return res.status(400).send({
            message: "Notification Description can not be empty"
        });
    } else if(!req.body.title) {
        return res.status(400).send({
            message: "Notification Title can not be empty"
        });
    }else if(!req.body.user_id ){
        return res.status(400).send({
            message: "User field can not be empty"
        });
    }
    // Create a notification
    const notification = new Notification({
        description: req.body.description, 
        title: req.body.title,
        user_id: req.body.user_id,
        order_id: req.body.order_id || null,
        admin: req.body.admin || false
    });

    // Save notification in the database
    notification.save()
    .then(data => {
        if (!admin.apps.length) {
            admin.initializeApp(
                {
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://greenworld-laundry.firebaseio.com"
              }
              );
        }

          var topic = 'admin';
        //   if(req.body.admin){
            var message = {};
            if(req.body.admin){
                message = {
                    notification: {
                      title: data.title,
                      body: data.description
                  },
                topic: 'admin'
              };
              console.log(JSON.stringify(message))
          
              // Send a message to devices subscribed to the provided topic.
              admin.messaging().send(message)
                .then((response) => {
                  // Response is a message ID string.
                  res.send(notification);
                  console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    res.send(notification);
                  console.log('Error sending message:', error);
                });
            }else{
                User.findOne({ _id: notification.user_id }, function(err, docs) {
                       console.log(docs)
                    if (docs && docs.device_token) {
                       message = {
                    token: docs.device_token,
                    notification: {
                      title: data.title,
                      body: data.description
                  },
              };   
                  console.log(JSON.stringify(message))
          
          // Send a message to devices subscribed to the provided topic.
          admin.messaging().send(message)
            .then((response) => {
              // Response is a message ID string.
              res.send(notification);
              console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                res.send(notification);
              console.log('Error sending message:', error);
            });
                    } else {
                    //   return res.status(400).send({
                    //     message: "Unauthorized"
                    //   });
                    res.send(notification);
                    }
            });    
        }

          
    //    res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while saving the Notification."
        });
    });
};

// Retrieve and return all notifications from the database.
exports.findAll = (req, res) => {
    Notification.find({user_id: req.params.userId})
    .sort('-updatedAt')
    .then(notifications => {
        res.send(notifications);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving the notifications."
        });
    });
};
// Retrieve and return all orders from the database.
exports.findAllNotifications = (req, res) => {
    Notification.find()
      .sort('-updatedAt').then(notifications => {
        res.send(notifications);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving the notifications."
        });
      });
  };

// Find a single notification with a notificationId
exports.findOne = (req, res) => {
    Notification.findById(req.params.notificationId)
    .then(notification => {
        if(!notification) {
            return res.status(404).send({
                message: "Notification not found with id " + req.params.notificationId
            });            
        }
        res.send(notification);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Notification not found with id " + req.params.notificationId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving notification with id " + req.params.notificationId
        });
    });
};

// Delete a notification with the specified notificationId in the request
exports.delete = (req, res) => {
    Notification.findByIdAndRemove(req.params.notificationId)
    .then(notification => {
        if(!notification) {
            return res.status(404).send({
                message: "Notification not found with id " + req.params.notificationId
            });
        }
        res.send({message: "Notification deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Notification not found with id " + req.params.notificationId
            });                
        }
        return res.status(500).send({
            message: "Could not delete Notification with id " + req.params.notificationId
        });
    });
};
exports.update = (req, res) => {
    // Find notification and update it with the request body
    if(!req.body.notificationId) {
        return res.status(400).send({
            message: "NotificationId field can not be empty"
        });
    }
    Notification.findByIdAndUpdate(req.params.notificationId, {
        status: true,
    }, {new: true})
    .then(notification => {
        if(!notification) {
            return res.status(404).send({
                message: "Notification not found with id " + req.params.notificationId
            });
        }
        res.send(notification);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Notification not found with id " + req.params.notificationId
            });                
        }
        return res.status(500).send({
            message: "Error updating notification with id " + req.params.notificationId
        });
    });
};