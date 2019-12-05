const Card = require('../models/Cards.js');

// Create and Save a new card
exports.create = (req, res) => {
    if(!req.body.no || !Number.isInteger(req.body.no)) {
        return res.status(400).send({
            message: "Card Number can not be empty and must be a number"
        });
    }else if(!req.body.month || !Number.isInteger(req.body.month)){
        return res.status(400).send({
            message: "Month field can not be empty and must be a number"
        });
    }else if(!req.body.year || !Number.isInteger(req.body.year)){
        return res.status(400).send({
            message: "Year field can not be empty and must be a number"
        });
    }else if(!req.body.cvv || !Number.isInteger(req.body.cvv)){
        return res.status(400).send({
            message: "Cvv field can not be empty and must be a number"
        });
    }else if(!req.body.user_id){
        return res.status(400).send({
            message: "User id field can not be empty"
        });
    }
    // Create a card
    const card = new Card({
        no: req.body.no, 
        month: req.body.month,
        year: req.body.year,
        cvv: req.body.cvv,
        user_id: req.body.user_id
    });

    // Save card in the database
    card.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while saving the Card."
        });
    });
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