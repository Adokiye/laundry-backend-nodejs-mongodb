const mongoose = require('mongoose');

const CardsSchema = mongoose.Schema({
    no: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},
    name: {type: String,},
    user_id: {type: String, required: true},
    square_up_id: {type: String, required: true}
}, {
    timestamps: true
});
module.exports = mongoose.model('Cards', CardsSchema);
