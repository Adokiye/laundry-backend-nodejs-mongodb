const mongoose = require('mongoose');

const TransactionsSchema = mongoose.Schema({
    user_id: {type: String, required: true},
    card_id: {type: String, required: true},
    order_id: {type: String, required: true},
}, {
    timestamps: true
});
module.exports = mongoose.model('Transactions', TransactionsSchema);
