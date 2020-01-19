const Card = require("../models/Cards.js");
const User = require("../models/Users.js");
const Order = require("../models/Orders");
const notificationsController = require("../controllers/Notifications");
let config = require("../../config/database.js");
var SquareConnect = require("square-connect");

var defaultClient = SquareConnect.ApiClient.instance;
// Configure OAuth2 access token for authorization: oauth2
var oauth2 = defaultClient.authentications["oauth2"];
oauth2.accessToken = config.square_up_access_token;
// Create and Save a new card
exports.create = (req, res) => {
  order_id_generator = () => {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "OR/"+idempotency_key.substring(1, 7);
};
locker_id_generator = () => {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "LO/"+idempotency_key.substring(1, 7);
};
dropbox_id_generator = () => {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "DR/"+idempotency_key.substring(1, 7);
};
locker_code_generator = () => {
  var code =  getRandomInt(0, 9999);
  if(code < 1000){
      return  ('0000'+code).slice(-4);
  }else{
      return code.toString();
  }
};
  if (!req.body.nonce) {
    return res.status(400).send({
      message: "Nonce is required"
    });
  } else if (!req.body.user_id) {
    return res.status(400).send({
      message: "User Id field can not be empty"
    });
  }
  User.findOne({ _id: req.body.user_id }, function(err, docs) {
    //    console.log(docs)
    if (docs) {
      var apiInstance = new SquareConnect.CustomersApi();
      const body = {
        card_nonce: req.body.nonce
      };
      apiInstance.createCustomerCard(docs.square_up_id, body).then(
        function(data) {
          let sqid = data.card.id;
          const card = new Card({
            no: data.card.last_4,
            month: data.card.exp_month,
            year: data.card.exp_year,
            user_id: req.body.user_id,
            square_up_id: data.card.id,
            name: data.card.card_brand
          });
          // Save card in the database
          card
            .save()
            .then(data => {
              const order = new Order({
                dropbox_id: req.body.dropbox_id || null,
                user_id: req.body.user_id,
                order_id: order_id_generator,
                user_name: docs.first_name + " " + docs.last_name,
                user_no: docs.mobile_number,
                dropbox_address: req.body.dropbox_address || null,
                price: req.body.price || null,
                stage: "pending",
                preferences: req.body.preferences || null,
                square_up_id: sqid,
                dropoff_time: req.body.dropoff_time,
                pickup_time: req.body.pickup_time,
                dropoff_date: req.body.dropoff_date,
                pickup_date: req.body.pickup_date
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
          console.log("API called successfully. Returned data: " + data);
        },
        function(error) {
          console.error(error.response.error);
          for (
            let i = 0;
            i < JSON.parse(error.response.error.text).errors.length;
            i++
          ) {
            res.status(500).send({
              message:
                JSON.parse(error.response.error.text).errors[i].detail ||
                "Some error occurred while saving the Card."
            });
          }
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
