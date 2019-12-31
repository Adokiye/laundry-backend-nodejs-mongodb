const mongoose = require('mongoose');

const OrdersSchema = mongoose.Schema({
    order_id: {type: String, required: true,},
    dropbox_id: {type: String,}, 
    stage: String,
    dropbox_address: {type: String,},
    price: {type: Number, },
    user_id: {type: String, required: true},
    user_name: {type: String},
    user_no: {type: Number},
    dropoff_date: {type: Date, required: true},
    pickup_date: {type: Date, required: true},
    pickup_time: {type: String, required: true},
    dropoff_time: {type: String, required: true},
    preferences: String,
    square_up_id: {type: String, required: true}
//    current_process: String
}, {
    timestamps: true
});
module.exports = mongoose.model('Orders', OrdersSchema);
