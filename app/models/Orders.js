const mongoose = require('mongoose');

const OrdersSchema = mongoose.Schema({
    order_id: {type: String, required: true,},
    dropbox_id: {type: String,}, 
    stage: String,
    dropbox_address: {type: String,},
    price: {type: Number, required: true},
    user_id: {type: String, required: true},
    preferences: String,
    square_up_id: {type: String, required: true}
//    current_process: String
}, {
    timestamps: true
});
module.exports = mongoose.model('Orders', OrdersSchema);
