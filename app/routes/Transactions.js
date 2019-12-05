module.exports = (app) => {
    const transaction = require('../controllers/Transactions.js');
    let middleware = require('../middleware.js')
    // Create a new Transaction
    app.post('/transactions', middleware.checkToken, transaction.create);

    // Retrieve all Transactions
    app.get('/transactions/:userId', middleware.checkToken, transaction.findAll);

    // Retrieve a single Transaction with transactionId
    app.get('/transactions/:transactionId', middleware.checkToken, transaction.findOne);

    // Delete a Transaction with transactionId
    app.delete('/transactions/:transactionId', middleware.checkToken, transaction.delete);
}