const Transaction = require('../models/Transactions.js');

// Create and Save a new transaction
exports.create = (req, res) => {
    if(!req.body.user_id) {
        return res.status(400).send({
            message: "User Id can not be empty"
        });
    }else if(!req.body.card_id){
        return res.status(400).send({
            message: "CardId field can not be empty"
        });
    }else if(!req.body.order_id){
        return res.status(400).send({
            message: "OrderId field can not be empty"
        });
    }
    // Create a transaction
    const transaction = new Transaction({
        user_id: req.body.user_id, 
        card_id: req.body.card_id,
        order_id: req.body.order_id,
    });

    // Save transaction in the database
    transaction.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while saving the Transaction."
        });
    });
};

// Retrieve and return all cards from the database.
exports.findAll = (req, res) => {
    Transaction.find({user_id: req.params.userId})
    .then(transactions => {
        res.send(transactions);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving the Transactions."
        });
    });
};

// Find a single transaction with a cardId
exports.findOne = (req, res) => {
    Transaction.findById(req.params.transactionId)
    .then(transaction => {
        if(!transaction) {
            return res.status(404).send({
                message: "Transaction not found with id " + req.params.transactionId
            });            
        }
        res.send(transaction);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Transaction not found with id " + req.params.transactionId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving transaction with id " + req.params.transactionId
        });
    });
};

// Delete a transaction with the specified cardId in the request
exports.delete = (req, res) => {
    Transaction.findByIdAndRemove(req.params.transactionId)
    .then(transaction => {
        if(!transaction) {
            return res.status(404).send({
                message: "Transaction not found with id " + req.params.transactionId
            });
        }
        res.send({message: "Transaction deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Transaction not found with id " + req.params.transactionId
            });                
        }
        return res.status(500).send({
            message: "Could not delete Transaction with id " + req.params.transactionId
        });
    });
};
