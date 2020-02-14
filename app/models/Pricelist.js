const mongoose = require('mongoose');

const PricelistSchema = mongoose.Schema({
    name: {type: String, required: true, index: { unique: true }},
    price: {type: String, required: true},
}, {
    timestamps: true
});
module.exports = mongoose.model('Pricelist', PricelistSchema);
