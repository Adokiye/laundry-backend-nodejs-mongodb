const mongoose = require('mongoose');

const DropboxesSchema = mongoose.Schema({
    dropbox_id: {type: String, required: true, index: { unique: true }},
    address: {type: String, required: true},
    lat: {type: Number, required: true},
    long: {type: Number, required: true},
}, {
    timestamps: true
});

module.exports = mongoose.model('Dropboxes', DropboxesSchema);
