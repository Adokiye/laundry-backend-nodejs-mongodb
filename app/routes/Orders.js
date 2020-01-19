module.exports = (app) => {
    const orders = require('../controllers/Orders.js');
    let middleware = require('../middleware.js')
    // Create a new Order
    app.post('/orders', middleware.checkToken, orders.create);

    app.post('/orders/adminCharge', middleware.checkToken, orders.adminEditOrder);

    app.post('/orders/adminLockerGenerator', middleware.checkToken, orders.adminLockerGenerator);

    app.post('/orders/adminConfirmPickup', middleware.checkToken, orders.adminConfirmPickup);

    app.post('/orders/adminUpdateSubStage', middleware.checkToken, orders.adminUpdateSubStage);

    app.post('/orders/adminSetCompleted', middleware.checkToken, orders.adminSetCompleted);

    app.post('/orders/adminSetDelivery', middleware.checkToken, orders.adminSetDelivery);

    app.get('/orders/adminGetDeliveries', middleware.checkToken, orders.adminGetDeliveries);

    app.get('/orders/adminGetPending', middleware.checkToken, orders.adminGetPending);

    app.get('/orders/adminGetPickups', middleware.checkToken, orders.adminGetPickups);

    app.get('/orders/adminGetCompleted', middleware.checkToken, orders.adminGetCompleted);

    // Retrieve all Orders
    app.get('/orders/:userId', middleware.checkToken, orders.findAll);

    // Retrieve all Orders
    app.get('/orders', middleware.checkToken, orders.findAllOrders);

    // Retrieve a single Order with orderId
    app.get('/orders/:orderId', middleware.checkToken, orders.findOne);

    // Update a Order with orderId
    app.put('/orders/:orderId', middleware.checkToken, orders.updateStage);



    // Delete a Order with orderId
    app.delete('/orders/:orderId', middleware.checkToken, orders.delete);
}