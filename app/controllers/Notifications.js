const Notification = require('../models/Notifications.js');
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
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://greenworld-laundry.firebaseio.com"
          });
          var topic = 'admin';

          var message = {
                notification: {
                  title: data.description,
                  body: data.description
              },
            topic: topic
          };
          
          // Send a message to devices subscribed to the provided topic.
          admin.messaging().send(message)
            .then((response) => {
              // Response is a message ID string.
              console.log('Successfully sent message:', response);
            })
            .catch((error) => {
              console.log('Error sending message:', error);
            });
          
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