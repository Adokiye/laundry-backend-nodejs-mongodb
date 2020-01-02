const Order = require("../models/Orders.js");
const User = require("../models/Users.js");
const crypto = require("crypto");
var SquareConnect = require("square-connect");
var defaultClient = SquareConnect.ApiClient.instance;
// Configure OAuth2 access token for authorization: oauth2
var oauth2 = defaultClient.authentications["oauth2"];
oauth2.accessToken = config.square_up_access_token;
// Create and Save a new order
exports.adminEditOrder = (req, res) => {
  console.log(req.body);
  if (!req.body.price) {
    return res.status(400).send({
      message: "Price field can not be empty"
    });
  } else if (!req.body.orderId) {
    return res.status(400).send({
      message: "Order Id field can not be empty"
    });
  } else {
    Order.findById(req.body.orderId).then(order => {
      if (!order) {
        return res.status(404).send({
          message: "Order not found with id " + req.params.orderId
        });
      } else {
        User.findOne({ _id: order.user_id }, function(err, docs) {
          //    console.log(docs)
          if (docs) {
            // res.send(order);
            const idempotency_key = crypto.randomBytes(23).toString("hex");
            var apiInstance = new SquareConnect.PaymentsApi();
            const request_body = {
              source_id: order.square_up_id && order.square_up_id,
              amount_money: {
                amount: req.body.price, // $1.00 charge
                currency: "USD"
              },
              idempotency_key: idempotency_key,
              customer_id: docs.square_up_id && docs.square_up_id
            };
            apiInstance.createPayment(request_body).then(
              function(data) {
                console.log("API called successfully. Returned data: " + data);
                Order.findByIdAndUpdate(
                  req.body.orderId,
                  {
                    stage: req.body.stage,
                    price: req.body.price,
                    description: req.body.description
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
                      message:
                        "Error updating order with id " + req.params.orderId
                    });
                  });
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
        }).catch(err => {
          if (err.kind === "ObjectId") {
            return res.status(404).send({
              message: "Order not found with id " + req.params.orderId
            });
          }
          return res.status(500).send({
            message: "Error retrieving order with id " + req.params.orderId
          });
        });
      }
    });
  }
};
exports.create = (req, res) => {
  console.log(req.body);
  // if (!req.body.order_id) {
  //   return res.status(400).send({
  //     message: "OrderId field can not be empty"
  //   });
  // } else if (!req.body.dropbox_id) {
  //   return res.status(400).send({
  //     message: "DropboxId field can not be empty"
  //   });
  // } else if (!req.body.dropbox_address) {
  //   return res.status(400).send({
  //     message: "Dropbox Address field can not be empty"
  //   });
  if (!req.body.dropoff_date) {
    return res.status(400).send({
      message: "Dropoff Date field can not be empty"
    });
  } else if (!req.body.pickup_date) {
    return res.status(400).send({
      message: "Pickup Date field can not be empty"
    });
  } else if (!req.body.dropoff_time) {
    return res.status(400).send({
      message: "Dropoff Time field can not be empty"
    });
  } else if (!req.body.pickup_time) {
    return res.status(400).send({
      message: "Pickup Time field can not be empty"
    });
  } else if (!req.body.user_id) {
    return res.status(400).send({
      message: "UserId field can not be empty"
    });
  }
  User.findOne({ _id: req.body.user_id }, function(err, docs) {
    //    console.log(docs)
    if (docs) {
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      // Create a order
      const order = new Order({
        dropbox_id: req.body.dropbox_id || null,
        user_id: req.body.user_id,
        user_name: docs.first_name + " " + docs.last_name,
        user_no: docs.mobile_number,
        order_id: req.body.order_id || "ORN/A" + getRandomInt(1000, 10000),
        dropbox_address: req.body.dropbox_address || null,
        dropoff_date: req.body.dropoff_date,
        pickup_date: req.body.pickup_date,
        price: req.body.price || null,
        stage: "In Process",
        preferences: req.body.preference || null,
        square_up_id: req.body.card_id,
        dropoff_time: req.body.dropoff_time,
        pickup_time: req.body.pickup_time
      });
      console.log(order);
      // Save order in the database
      order
        .save()
        .then(data => {
          console.log(data + "success");
          res.send(data);
        })
        .catch(err => {
          console.log(err);
          res.status(500).send({
            message: "Some error occurred while creating the Order.",
            data: err
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
        message:
          err.message || "Some error occurred while retrieving the orders."
      });
    });
};

// Retrieve and return all orders from the database.
exports.findAllOrders = (req, res) => {
  Order.find()
    .then(orders => {
      res.send(orders);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving the orders."
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
