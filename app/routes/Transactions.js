module.exports = (app) => {
    const transaction = require('../controllers/Transactions.js');

    // Create a new Note
    app.post('/transactions', transaction.create);

    // Retrieve all Notes
    app.get('/transactions/:userId', transaction.findAll);

    // Retrieve a single Note with noteId
    app.get('/transactions/:transactionId', transaction.findOne);

    // Update a Note with noteId
    app.put('/transactions/:transactionId', transaction.update);

    // Delete a Note with noteId
    app.delete('/transactions/:transactionId', transaction.delete);
}