const Order = require("../models/Orders.js");
const User = require("../models/Users.js");
// Create and Save a new order
exports.create = (req, res) => {
  if (!req.body.order_id) {
    return res.status(400).send({
      message: "OrderId field can not be empty"
    });
  } else if (!req.body.dropbox_id) {
    return res.status(400).send({
      message: "DropboxId field can not be empty"
    });
  } else if (!req.body.dropbox_address) {
    return res.status(400).send({
      message: "Dropbox Address field can not be empty"
    });
  } else if (
    !req.body.price
    //  || !Number.isInteger(req.body.price)
  ) {
    return res.status(400).send({
      message: "Price field can not be empty and must be a number"
    });
  } else if (!req.body.user_id) {
    return res.status(400).send({
      message: "UserId field can not be empty"
    });
  }
  User.findOne({_id: req.body.user_id }, function(err, docs) {
    //    console.log(docs)
    if (docs) {
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
      // Create a order
      const order = new Order({
        dropbox_id: req.body.dropbox_id||null,
        user_id: req.body.user_id,
        order_id: req.body.order_id||getRandomInt(1000,10000),
        dropbox_address: req.body.dropbox_address||null,
        price: req.body.price||null,
        stage: "In Process",
        preferences: req.body.preferences || null,
        square_up_id: req.body.card_id
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
              err.message || "Some error occurred while creating the Order."
          });
        });
    } else {
      return res.status(400).send({
        message: "Unauthorized"
      });
    }
  });
};

// Retrieve and return all orders from the database.
exports.findAll = (req, res) => {
  Order.find({ user_id: req.params.userId })
    .then(orders => {
      res.send(orders);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving the orders."
      });
    });
};

// Find a single order with a orderId
exports.findOne = (req, res) => {
  Order.findById(req.params.orderId)
    .then(order => {
      if (!order) {
        return res.status(404).send({
          message: "Order not found with id " + req.params.orderId
        });
      }
      res.send(order);
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Order not found with id " + req.params.orderId
        });
      }
      return res.status(500).send({
        message: "Error retrieving order with id " + req.params.orderId
      });
    });
};

// Delete a order with the specified orderId in the request
exports.delete = (req, res) => {
  Order.findByIdAndRemove(req.params.orderId)
    .then(order => {
      if (!order) {
        return res.status(404).send({
          message: "Order not found with id " + req.params.orderId
        });
      }
      res.send({ message: "Order deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Order not found with id " + req.params.orderId
        });
      }
      return res.status(500).send({
        message: "Could not delete Order with id " + req.params.orderId
      });
    });
};
exports.updateStage = (req, res) => {
  if (!req.body.stage) {
    return res.status(400).send({
      message: "Stage field can not be empty"
    });
  } else if (!req.body.orderId) {
    return res.status(400).send({
      message: "Order_id field can not be empty"
    });
  }
  Order.findByIdAndUpdate(
    req.params.orderId,
    {
      stage: req.body.stage
    },
    { new: true }
  )
    .then(order => {
      if (!order) {
        return res.status(404).send({
          message: "Order not found with id " + req.params.orderId
        });
      }
      res.send(order);
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Order not found with id " + req.params.orderId
        });
      }
      return res.status(500).send({
        message: "Error updating order with id " + req.params.orderId
      });
    });
};
