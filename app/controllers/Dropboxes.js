const Dropbox = require('../models/Dropboxes.js');

// Create and Save a new dropbox
exports.create = (req, res) => { if(!req.body.address){
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
        return res.status(400).send({
            message: "Address field can not be empty"
        });
    }
    // Create a dropbox
    const dropbox = new Dropbox({
        dropbox_id: dropbox_id_generator, 
        address: req.body.address,
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
