const mongoose = require('mongoose');

const NotificationsSchema = mongoose.Schema({
    description: {type: String, required: true},
    order_id: String, 
    user_id: {type: String, required: true},
    status: {type: Boolean, default: false},
}, {
    timestamps: true
});

module.exports = mongoose.model('Orders', NotificationsSchema);
