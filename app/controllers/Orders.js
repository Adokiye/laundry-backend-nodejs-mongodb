const Order = require("../models/Orders.js");
const User = require("../models/Users.js");
const Card = require("../models/Cards.js");
const notificationsController = require("../controllers/Notifications");
const crypto = require("crypto");
let config = require("../../config/database.js");
var SquareConnect = require("square-connect");
var defaultClient = SquareConnect.ApiClient.instance;
// Configure OAuth2 access token for authorization: oauth2
var oauth2 = defaultClient.authentications["oauth2"];
var nodemailer = require("nodemailer");
oauth2.accessToken = config.square_up_access_token;
// Create and Save a new order
exports.adminEditOrder = (req, res) => {
  let notificationData = {
    body: {
      title: '',
      description: '',
      user_id: ''
    }
  };
//  console.log(req)
  console.log(req.body);
   if (!req.body.order_id) {
    return res.status(400).send({
      message: "Order Id field can not be empty"
    });
  } else {
    Order.findById(req.body.order_id).then(order => {
      if (!order) {
        return res.status(404).send({
          message: "Order not found with id " + req.params.order_id
        });
      } else {
        User.findOne({ _id: order.user_id }, function(err, docs) {
          //    console.log(docs)
          if (docs) {
            Object.keys(req.body).forEach(function(key, index) {
              // key: the name of the object key
              // index: the ordinal position of the key within the object
              if (Object.keys(req.body).length == 2) {
                if (key == "price") {
                  const idempotency_key = crypto
                    .randomBytes(23)
                    .toString("hex");
                  var apiInstance = new SquareConnect.PaymentsApi();
                  const request_body = {
                    source_id: order.square_up_id && order.square_up_id,
                    amount_money: {
                      amount: req.body.price, // $1.00 charge
                      currency: "USD"
                    },
                    idempotency_key: idempotency_key.substring(1, 10),
                    customer_id: docs.square_up_id && docs.square_up_id
                  };
                  console.log(request_body);
                  apiInstance.createPayment(request_body).then(
                    function(data) {
                      console.log(
                        "API called successfully. Returned data: " + data
                      );
                      Order.findByIdAndUpdate(
                        req.body.order_id,
                        {
                          price: req.body.price
                        },
                        { new: true }
                      )
                        .then(order => {
                          if (!order) {
                            return res.status(404).send({
                              message:
                                "Order not found with id " + req.params.order_id
                            });
                          }
                          notificationData.body.title = "Order Charged";
                          //   notificationData.body.admin = true;
                          notificationData.body.description = `Order Charge, order Id is  ${req.body.price}`;
                          notificationData.body.user_id = docs._id;
                          notificationsController.create(notificationData, res);
                          var transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                              user: "washnbox@gmail.com",
                              pass: "funmi123"
                            }
                          });
                          const mailOptions = {
                            from: "washnbox@gmail.com", // sender address
                            to: docs.email, // list of receivers
                            subject: "Greenworld Laundry App Charge", // Subject line
                            html: `<b>Your card has been charged, the price of your laundry is ${req.body.price} </b>` // plain text body
                          };
                          transporter.sendMail(mailOptions, function(
                            err,
                            info
                          ) {
                            if (err) console.log(err);
                            else console.log(info);
                          });
                          res.send(order);
                        })
                        .catch(err => {
                          if (err.kind === "ObjectId") {
                            return res.status(404).send({
                              message:
                                "Order not found with id " + req.params.order_id
                            });
                          }
                          return res.status(500).send({
                            message:
                              "Error updating order with id " +
                              req.params.order_id
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
                            JSON.parse(error.response.error.text).errors[i]
                              .detail ||
                            "Some error occurred while saving the Card."
                        });
                      }
                    }
                  );
                } else {
                  if (index != 0) {
                    Order.findByIdAndUpdate(
                      req.body.order_id,
                      {
                        [key]: req.body[key]
                      },
                      { new: true }
                    )
                      .then(order => {
                        if (!order) {
                          return res.status(404).send({
                            message:
                              "Order not found with id " + req.params.order_id
                          });
                        }
                        if (key == "locker_id") {
                          var transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                              user: "washnbox@gmail.com",
                              pass: "funmi123"
                            }
                          });
                          notificationData.body.title = "Locker ID generated";
                          //   notificationData.body.admin = true;
                          notificationData.body.description = `Your locker id is ${req.body.locker_id}`;
                          notificationData.body.user_id = docs._id;
                          notificationsController.create(notificationData, res);
                          const mailOptions = {
                            from: "washnbox@gmail.com", // sender address
                            to: docs.email, // list of receivers
                            subject:
                              "Greenworld Laundry App Locker ID generated", // Subject line
                            html: `<b>Your locker id is ${req.body.locker_id} </b>` // plain text body
                          };
                          transporter.sendMail(mailOptions, function(
                            err,
                            info
                          ) {
                            if (err) console.log(err);
                            else console.log(info);
                          });
                        }
                        if (key == "pickup") {
                          notificationData.body.title = "Pickup Confirmation";
                          notificationData.body.admin = true;
                          notificationData.body.description = `Pickup for Order ID  ${req.body.order_id} is confirmed`;
                          notificationData.body.user_id = docs._id;
                          notificationsController.create(notificationData, res);
                        }
                        res.send(order);
                      })
                      .catch(err => {
                        if (err.kind === "ObjectId") {
                          return res.status(404).send({
                            message:
                              "Order not found with id " + req.params.order_id
                          });
                        }
                        return res.status(500).send({
                          message:
                            "Error updating order with id " +
                            req.params.order_id
                        });
                      });
                  }
                }
              } else {
                if (index != 0) {
                  Order.findByIdAndUpdate(
                    req.body.order_id,
                    {
                      [key]: req.body[key]
                    },
                    { new: true }
                  )
                    .then(order => {
                      if (!order) {
                        return res.status(404).send({
                          message:
                            "Order not found with id " + req.params.order_id
                        });
                      }
                      res.send(order);
                    })
                    .catch(err => {
                      if (err.kind === "ObjectId") {
                        return res.status(404).send({
                          message:
                            "Order not found with id " + req.params.order_id
                        });
                      }
                      return res.status(500).send({
                        message:
                          "Error updating order with id " + req.params.order_id
                      });
                    });
                }
              }
            });
            // res.send(order);
          } else {
            return res.status(400).send({
              message: "Unauthorized"
            });
          }
        }).catch(err => {
          if (err.kind === "ObjectId") {
            return res.status(404).send({
              message: "Order not found with id " + req.params.order_id
            });
          }
          return res.status(500).send({
            message: "Error retrieving order with id " + req.params.order_id
          });
        });
      }
    });
  }
};
exports.adminGetPending = (req, res) => {
  //  console.log(req.body);
  Order.findAll({ stage: "pending" })
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
exports.adminGetCompleted = (req, res) => {
  //  console.log(req.body);
  Order.findAll({ stage: "completed" })
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
exports.adminGetPickups = (req, res) => {
  //  console.log(req.body);
  Order.findAll({ pickup: false })
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
exports.adminGetDeliveries = (req, res) => {
  //  console.log(req.body);
  Order.findAll({ delivery: false, stage: "active" })
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
exports.adminSetDelivery = (req, res) => {
  console.log(req.body);
  if (!req.body.orderId) {
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
            Order.findByIdAndUpdate(
              req.body.orderId,
              {
                delivery: true,
                sub_stage: "Dropped Off"
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
exports.adminSetCompleted = (req, res) => {
  console.log(req.body);
  if (!req.body.orderId) {
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
            Order.findByIdAndUpdate(
              req.body.orderId,
              {
                stage: "completed"
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
exports.adminUpdateSubStage = (req, res) => {
  console.log(req.body);
  if (!req.body.orderId) {
    return res.status(400).send({
      message: "Order Id field can not be empty"
    });
  } else if (!req.body.subStage) {
    return res.status(400).send({
      message: "Substage field can not be empty"
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
            Order.findByIdAndUpdate(
              req.body.orderId,
              {
                sub_stage: req.body.subStage
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
exports.adminConfirmPickup = (req, res) => {
  console.log(req.body);
  if (!req.body.orderId) {
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
            Order.findByIdAndUpdate(
              req.body.orderId,
              {
                pickup: true,
                sub_stage: "Picked Up"
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
exports.adminLockerGenerator = (req, res) => {
  function order_id_generator(){
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "OR/" + idempotency_key.substring(1, 7);
  };
  locker_id_generator = () => {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "LO/" + idempotency_key.substring(1, 7);
  };
  function dropbox_id_generator(){
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "DR/" + idempotency_key.substring(1, 7);
  };
  function locker_code_generator(){
    var code = getRandomInt(0, 9999);
    if (code < 1000) {
      return ("0000" + code).slice(-4);
    } else {
      return code.toString();
    }
  };
  console.log(req.body);
  if (!req.body.orderId) {
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
            Order.findByIdAndUpdate(
              req.body.orderId,
              {
                locker_id: locker_id_generator,
                locker_code: locker_code_generator,
                stage: "active"
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
  function order_id_generator(){
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "OR/" + idempotency_key.substring(1, 7);
  };
  function locker_id_generator() {
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "LO/" + idempotency_key.substring(1, 7);
  };
  function dropbox_id_generator(){
    const idempotency_key = crypto.randomBytes(23).toString("hex");
    return "DR/" + idempotency_key.substring(1, 7);
  };
  function locker_code_generator(){
    var code = getRandomInt(0, 9999);
    if (code < 1000) {
      return ("0000" + code).slice(-4);
    } else {
      return code.toString();
    }
  };
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
  User.findOne({ _id: req.body.user_id }, function(err, docs_user) {
    //    console.log(docs)
    if (docs_user) {
      // Create a order
      Card.findOne({ _id: req.body.card_id }, function(err, docs) {
        //    console.log(docs)
        if (docs) {
          const order = new Order({
            dropbox_id: req.body.dropbox_id || null,
            user_id: req.body.user_id,
            user_name: docs_user.first_name + " " + docs_user.last_name,
            user_no: docs_user.mobile_number,
            order_id: order_id_generator(),
            dropbox_address: req.body.dropbox_address || null,
            dropoff_date: req.body.dropoff_date,
            pickup_date: req.body.pickup_date,
            price: req.body.price || null,
            stage: "pending",
            preferences: req.body.preference || null,
            square_up_id: docs.square_up_id,
            dropoff_time: req.body.dropoff_time,
            pickup_time: req.body.pickup_time
          });
          console.log(order);
          // Save order in the database
          order
            .save()
            .then(data => {
              console.log(data + "success");
              let notificationData = {
                body: {
                  title: '',
                  admin: '',
                  description: '',
                  user_id: ''
                }
              }; 
                           var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "washnbox@gmail.com",
                  pass: "funmi123"
                }
              });
              const mailOptions = {
                from: "washnbox@gmail.com", // sender address
                to: docs_user.email, // list of receivers
                subject: "Greenworld Laundry App Order Created", // Subject line
                html: `<b>Your Order has been created, the id is ${data.order_id} </b>` // plain text body
              };
              transporter.sendMail(mailOptions, function(err, info) {
                if (err) console.log("djdjd" + err);
                else console.log("info"+info);
              });
              notificationData.body.title = "Order Created";
              notificationData.body.admin = true;
              notificationData.body.description = `Order Created, order Id is ${data.order_id}`;
              notificationData.body.user_id = req.body.user_id;
              notificationsController.create(notificationData, res);

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
        // Create a card
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
  Order.find({ user_id: req.params.userId }).sort('-updatedAt')
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
  console.log(req)
  Order.find().sort('-updatedAt')
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
  console.log(req)
  Order.findById(req.params.orderId)
  .then(order => {
    if (!order) {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }else{
     let email = order.user_email;
       Order.findByIdAndRemove(req.params.orderId)
    .then(order => {
      if (!order) {
        return res.status(404).send({
          message: "Order not found with id " + req.params.orderId
        });
      }
      var transporter = nodemailer.createTransport( {
        service: "gmail",
          user: "gorgeceo@gmail.com",
          pass: "Adk20100"
        }
      );
      let notificationData = {
        body: {
          title: '',
          description: '',
          user_id: ''
        }
      };
      notificationData.body.title = "Order Cancelled";
      //   notificationData.body.admin = true;
      notificationData.body.description = `Your Order was cancelled, you'll be contacted as soon as possible`;
      notificationData.body.user_id = order.user_id;
      notificationsController.create(notificationData, res);
      const mailOptions = {
        from: "gorgeceo@gmail.com", // sender address
        to: "seyipaul2019@gmail.com", // list of receivers
        subject:
          "Greenworld Laundry App Order Cancelled", // Subject line
        html: `<b>Your Order was cancelled, you'll be contacted as soon as possible</b>` // plain text body
      };
      transporter.sendMail(mailOptions, function(
        err,
        info
      ) {
        if (err) console.log(err);
        else console.log(info);
      });
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
    }
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
