const Dropbox = require('../models/Dropboxes.js');

// Create and Save a new dropbox
exports.create = (req, res) => {
    if(!req.body.dropbox_id) {
        return res.status(400).send({
            message: "Dropbox Id can not be empty"
        });
    }else if(!req.body.address){
        return res.status(400).send({
            message: "Address field can not be empty"
        });
    }else if(!req.body.lat || !Number.isInteger(req.body.lat)){
        return res.status(400).send({
            message: "Latitude field can not be empty and must be a number"
        });
    }else if(!req.body.long || !Number.isInteger(req.body.long)){
        return res.status(400).send({
            message: "Longitude field can not be empty and must be a number"
        });
    }
    // Create a dropbox
    const dropbox = new Dropbox({
        dropbox_id: req.body.dropbox_id, 
        address: req.body.address,
        lat: req.body.lat,
        long: req.body.long,
    });

    // Save dropbox in the database
    dropbox.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while saving the Dropbox."
        });
    });
};

// Retrieve and return all cards from the database.
exports.findAll = (req, res) => {
    Dropbox.find()
    .then(dropboxes => {
        res.send(dropboxes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving the Dropboxes."
        });
    });
};

// Find a single dropbox with a cardId
exports.findOne = (req, res) => {
    Dropbox.findById(req.params.dropboxId)
    .then(dropbox => {
        if(!dropbox) {
            return res.status(404).send({
                message: "Dropbox not found with id " + req.params.dropboxId
            });            
        }
        res.send(dropbox);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Dropbox not found with id " + req.params.dropboxId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving dropbox with id " + req.params.dropboxId
        });
    });
};

// Delete a dropbox with the specified cardId in the request
exports.delete = (req, res) => {
    Dropbox.findByIdAndRemove(req.params.dropboxId)
    .then(dropbox => {
        if(!dropbox) {
            return res.status(404).send({
                message: "Dropbox not found with id " + req.params.dropboxId
            });
        }
        res.send({message: "Dropbox deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Dropbox not found with id " + req.params.dropboxId
            });                
        }
        return res.status(500).send({
            message: "Could not delete Dropbox with id " + req.params.dropboxId
        });
    });
};
