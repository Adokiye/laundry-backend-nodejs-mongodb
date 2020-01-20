const mongoose = require('mongoose');

const OrdersSchema = mongoose.Schema({
    order_id: {type: String, required: true, index: { unique: true },},
    dropbox_id: {type: String, required: true}, 
    stage: {type: String, enum: ['pending', 'active', 'completed'], default: 'pending'},
    dropbox_address: {type: String,},
    price: {type: Number, },
    user_id: {type: String, required: true},
    user_name: {type: String},
    user_no: {type: Number},
    user_email: {type: String},
    dropoff_date: {type: Date, required: true},
    pickup_date: {type: Date, required: true},
    pickup_time: {type: String, required: true},
    dropoff_time: {type: String, required: true},
    preferences: String,
    square_up_id: {type: String, required: true},
    description: {type: String},
    sub_stage: {type:  String, },
    locker_id: {type: String, },
    locker_code: {type: String, },
    driver: {type: Boolean, default: false},
    driver_name: {type: String},
    delivery: {type: Boolean, default: false},
    pickup: {type: Boolean, default: false}
    
//    current_process: String
}, {
    timestamps: true
});
module.exports = mongoose.model('Orders', OrdersSchema);
