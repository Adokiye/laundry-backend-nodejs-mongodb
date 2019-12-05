module.exports = (app) => {
    const orders = require('../controllers/Orders.js');
    let middleware = require('../middleware.js')
    // Create a new Note
    app.post('/orders', middleware.checkToken, orders.create);

    // Retrieve all Notes
    app.get('/orders/:userId', middleware.checkToken, orders.findAll);

    // Retrieve a single Note with noteId
    app.get('/orders/:orderId', middleware.checkToken, orders.findOne);

    // Update a Note with noteId
    app.put('/orders/:orderId', middleware.checkToken, orders.update);

    // Delete a Note with noteId
    app.delete('/orders/:orderId', middleware.checkToken, orders.delete);
}