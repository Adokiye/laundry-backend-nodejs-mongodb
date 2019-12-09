const Card = require('../models/Cards.js');
const User = require("../models/Users.js");
const Order = require("../models/Orders")
let config = require('../../config/database.js');
var SquareConnect = require('square-connect');
var defaultClient = SquareConnect.ApiClient.instance;
// Configure OAuth2 access token for authorization: oauth2
var oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = config.square_up_access_token;
// Create and Save a new card
exports.create = (req, res) => {
    if(!req.body.nonce) {
        return res.status(400).send({
            message: "Nonce is required"
        });
    }else if(!req.body.user_id ){
        return res.status(400).send({
            message: "User Id field can not be empty"
        });
    }
    User.findOne({_id: req.body.user_id }, function(err, docs) {
        //    console.log(docs)
        if (docs) {
            var apiInstance = new SquareConnect.CustomersApi();
            const body = {
                card_nonce: req.body.nonce,
            }
            apiInstance.createCustomerCard(docs.square_up_id, body).then(function(data) {
                const card = new Card({
                    no: data.card.last_4, 
                    month: data.card.exp_month,
                    year: data.card.exp_year,
                    user_id: req.body.user_id,
                    square_up_id: data.card.id,
                    name: data.card.card_brand
                });
                // Save card in the database
                card.save()
                .then(data => {
                    function getRandomInt(min, max) {
                        min = Math.ceil(min);
                        max = Math.floor(max);
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                    const order = new Order({
              //          dropbox_id: req.body.dropbox_id,
                        user_id: req.body.user_id,
                        order_id: "OR"+getRandomInt(1000, 10000),
                //        dropbox_address: req.body.dropbox_address,
                        price: req.body.price||null,
                        stage: "In Process",
                        preferences: req.body.preferences || null,
                        square_up_id: data.square_up_id
                      });
                
                      // Save order in the database
                      order
                        .save()
                        .then(data => {
                          res.send(data);
                        })
                        .catch(err => {
                          res.status(500).send({
                            message:
                              err.message || "Some error occurred while saving the Order."
                          });
                        });
                    res.send(data);
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while saving the Card."
                    });
                });
                console.log('API called successfully. Returned data: ' + data);
              }, function(error) {   
                    console.error(error.response.error);
                for(let i=0;i<JSON.parse(error.response.error.text).errors.length;i++){
                    res.status(500).send({
                        message: JSON.parse(error.response.error.text).errors[i].detail || "Some error occurred while saving the Card."
                    });
                }
           
              });
        } else {
          return res.status(400).send({
            message: "Unauthorized"
          });
        }
    // Create a card
    })
};

// Retrieve and return all cards from the database.
exports.findAll = (req, res) => {
    Card.find({user_id: req.params.userId})
    .then(cards => {
        res.send(cards);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving the cards."
        });
    });
};

// Find a single card with a cardId
exports.findOne = (req, res) => {
    Card.findById(req.params.cardId)
    .then(card => {
        if(!card) {
            return res.status(404).send({
                message: "Card not found with id " + req.params.cardId
            });            
        }
        res.send(card);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
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
        if(!card) {
            return res.status(404).send({
                message: "Card not found with id " + req.params.cardId
            });
        }
        res.send({message: "Card deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
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