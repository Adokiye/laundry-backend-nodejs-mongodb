module.exports = (app) => {
    const orders = require('../controllers/Orders.js');
    let middleware = require('../middleware.js')
    // Create a new Order
    app.post('/orders', middleware.checkToken, orders.create);

    app.post('/orders/adminCharge', middleware.checkToken, orders.adminEditOrder);

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