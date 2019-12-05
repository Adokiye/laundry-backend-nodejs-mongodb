module.exports = (app) => {
    const transaction = require('../controllers/Transactions.js');
    let middleware = require('../middleware.js')
    // Create a new Note
    app.post('/transactions', middleware.checkToken, transaction.create);

    // Retrieve all Notes
    app.get('/transactions/:userId', middleware.checkToken, transaction.findAll);

    // Retrieve a single Note with noteId
    app.get('/transactions/:transactionId', middleware.checkToken, transaction.findOne);

    // Update a Note with noteId
    app.put('/transactions/:transactionId', middleware.checkToken, transaction.update);

    // Delete a Note with noteId
    app.delete('/transactions/:transactionId', middleware.checkToken, transaction.delete);
}