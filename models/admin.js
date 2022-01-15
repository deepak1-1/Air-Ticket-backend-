const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    adharcard: {
        type: String,
        required: true,
        unique: true
    }
    
}, {timestamps : true});

const adminModel = mongoose.model('admin', adminSchema);
module.exports = adminModel;