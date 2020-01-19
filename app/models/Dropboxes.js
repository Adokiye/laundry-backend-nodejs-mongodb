const mongoose = require('mongoose');

const DropboxesSchema = mongoose.Schema({
    dropbox_id: {type: String, required: true, index: { unique: true }},
    address: {type: String, required: true},
    lat: {type: Number,},
    long: {type: Number, },
}, {
    timestamps: true
});
module.exports = mongoose.model('Dropboxes', DropboxesSchema);
