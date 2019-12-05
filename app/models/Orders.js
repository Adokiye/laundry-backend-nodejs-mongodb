const mongoose = require('mongoose');

const OrdersSchema = mongoose.Schema({
    order_id: {type: String, required: true,},
    dropbox_id: {type: String, required: true}, 
    stage: String,
    dropbox_address: {type: String, required: true},
    price: {type: Number, required: true},
    user_id: {type: String, required: true},
    preferences: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Orders', OrdersSchema);
