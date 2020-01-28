const Card = require("../models/Cards.js");
const User = require("../models/Users.js");
const Order = require("../models/Orders");
const crypto = require("crypto");
const notificationsController = require("../controllers/Notifications");
let config = require("../../config/database.js");
var stripe = require("stripe")(config.stripe_key);
// Create and Save a new card
exports.setDefault = (req, res) => {
  console.log(req.body);
  if (!req.body.cardId) {
    return res.status(400).send({
      message: "Card Id field can not be empty"
    });
  } else if (!req.body.userId) {
    return res.status(400).send({
      message: "User Id field can not be empty"
    });
  } else {
    var condition = {
      user_id: req.params.userId,
      default: true
    };
    Card.findOneAndUpdate({ condition }, { default: false }, function(
      err,
      doc
    ) {
      if (err) return res.send(500, { error: err });
      Card.findByIdAndUpdate(
        req.body.cardId,
        {
          default: true
        },
        { new: true }
      )
        .then(card => {
          if (!card) {
            return res.status(404).send({
              message: "Card not found with id " + req.params.cardId
            });
          }
          res.send(card);
        })
        .catch(err => {
          if (err.kind === "ObjectId") {
            return res.status(404).send({
              message: "Card not found with id " + req.params.cardId
            });
          }
          return res.status(500).send({
            message: "Error updating card with id " + req.params.cardId
          });
        });
    });
  }
};
exports.create = (req, res) => {
  function order_id_generator() {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "OR/" + idempotency_key.substring(1, 7);
  }
  if (!req.body.token) {
    return res.status(400).send({
      message: "Token is required"
    });
  } else if (!req.body.user_id) {
    return res.status(400).send({
      message: "User Id field can not be empty"
    });
  } 
  User.findOne({ _id: req.body.user_id }, function(err, docs) {
        console.log(docs)
    if (docs) {
      stripe.customers.createSource(
        docs.stripe_id,
        {
          source: req.body.token
        },
        function(err, card) {
          if (err) {
            console.log(err)
            res.status(err.statusCode).send({
              message:
                err.message || "Some error occurred while saving the User."
            });
          }
          var stripe_id = card.id;
          const card_new = new Card({
            no: card.last4,
            month: card.exp_month,
            year: card.exp_year,
            user_id: req.body.user_id,
            stripe_id: stripe_id,
            name: card.brand
          });
          // Save card in the database
          card_new
            .save()
            .then(data => {
              const order = new Order({
                dropbox_id: req.body.dropbox_id,
                user_id: req.body.user_id,
                order_id: order_id_generator(),
                user_name: docs.first_name + " " + docs.last_name,
                user_no: docs.mobile_number,
                dropbox_address: req.body.dropbox_address || null,
                preferences: req.body.preferences || null,
                stripe_id: stripe_id,
                dropoff_time: req.body.dropoff_time,
                pickup_time: req.body.pickup_time,
                dropoff_date: req.body.dropoff_date,
                pickup_date: req.body.pickup_date,
                user_email: docs.email,
              });

              // Save order in the database
              order
                .save()
                .then(dataOrder => {
                  let notificationData = {};
                  notificationData.body.title = "Order Created";
                  notificationData.body.description = `Order Created, order Id is ${dataOrder.order_id}`;
                  notificationData.body.user_id = req.body.user_id;
                  notificationData.body.admin = true;
                  notificationsController.create(notificationData, res);
                  res.send(dataOrder);
                })
                .catch(err => {
                  res.status(500).send({
                    message:
                      err.message ||
                      "Some error occurred while saving the Order."
                  });
                });
              res.send(data);
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while saving the Card."
              });
            });
        }
      );
    } else {
      return res.status(400).send({
        message: "Unauthorized"
      });
    }
    // Create a card
  });
};

// Retrieve and return all cards from the database.
exports.findAll = (req, res) => {
  Card.find({ user_id: req.params.userId })
    .then(cards => {
      res.send(cards);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the cards."
      });
    });
};

// Find a single card with a cardId
exports.findOne = (req, res) => {
  Card.findById(req.params.cardId)
    .then(card => {
      if (!card) {
        return res.status(404).send({
          message: "Card not found with id " + req.params.cardId
        });
      }
      res.send(card);
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Card not found with id " + req.params.cardId
        });
      }
      return res.status(500).send({
        message: "Error retrieving card with id " + req.params.cardId
      });
    });
};

// Delete a card with the specified cardId in the request
exports.delete = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(card => {
      if (!card) {
        return res.status(404).send({
          message: "Card not found with id " + req.params.cardId
        });
      }
      res.send({ message: "Card deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Card not found with id " + req.params.cardId
        });
      }
      return res.status(500).send({
        message: "Could not delete Card with id " + req.params.cardId
      });
    });
};
/*
// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Find note and update it with the request body
    Note.findByIdAndUpdate(req.params.noteId, {
        title: req.body.title || "Untitled Note",
        content: req.body.content
    }, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.noteId
        });
    });
};

*/
