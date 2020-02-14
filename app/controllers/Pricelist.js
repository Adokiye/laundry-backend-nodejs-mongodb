const Pricelist = require('../models/Pricelist.js');
const crypto = require("crypto");
// Create and Save a new Pricelist
exports.create = (req, res) => {
    if(!req.body.name) {
        return res.status(400).send({
            message: "Name field cannot be empty"
        });            
    
    } else if(!req.body.price) {
        return res.status(400).send({
            message: "Price field cannot be empty"
        });            
    
    }else{
    // Create a Pricelist
    const Pricelist = new Pricelist({
        name: req.body.name, 
        price: req.body.price,
    });
console.log(req)
    // Save Pricelist in the database
    Pricelist.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while saving the Pricelist."
        });
    });        
    }

};

// Retrieve and return all cards from the database.
exports.findAll = (req, res) => {
    Pricelist.find().sort('-updatedAt')
    .then(pricelist => {
        res.send(pricelist);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving the Pricelist."
        });
    });
};

// Find a single Pricelist with a cardId
exports.findOne = (req, res) => {
    Pricelist.findById(req.params.pricelistId)
    .then(pricelist => {
        if(!pricelist) {
            return res.status(404).send({
                message: "Pricelist not found with id " + req.params.pricelistId
            });            
        }
        res.send(pricelist);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Pricelist not found with id " + req.params.pricelistId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving Pricelist with id " + req.params.pricelistId
        });
    });
};

// Delete a Pricelist with the specified cardId in the request
exports.delete = (req, res) => {
    Pricelist.findByIdAndRemove(req.params.pricelistId)
    .then(pricelist => {
        if(!pricelist) {
            return res.status(404).send({
                message: "Pricelist not found with id " + req.params.pricelistId
            });
        }
        res.send({message: "Pricelist deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Pricelist not found with id " + req.params.pricelistId
            });                
        }
        return res.status(500).send({
            message: "Could not delete Pricelist with id " + req.params.pricelistId
        });
    });
};
