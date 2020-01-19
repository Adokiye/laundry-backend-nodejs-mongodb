const mongoose = require('mongoose'),
bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 10;
const UsersSchema = mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true}, 
    address: {type: String, required: true},
    zipcode: {type: String, required: true},
    mobile_number: {type: Number, required: true},
    email: {type: String, required: true, index: { unique: true }, lowercase: true},
    role: {type: String, enum: ['admin', 'super-admin', 'user'], default: 'user'},
     password: {type: String, required: true},
     img_url: String,
     square_up_id: {type: String, required: true},
     device_token: {type: String},
     device_type: {type: String},
     device_language: {type: String}
}, {
    timestamps: true,
    strict: false
});
UsersSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
UsersSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Users', UsersSchema);
