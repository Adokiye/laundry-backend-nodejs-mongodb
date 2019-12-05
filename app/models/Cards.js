const mongoose = require('mongoose');

const CardsSchema = mongoose.Schema({
    no: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},
    cvv: {type: Number, required: true},
    user_id: {type: String, required: true},
}, {
    timestamps: true
});

module.exports = mongoose.model('Cards', CardsSchema);
