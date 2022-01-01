const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    idUser: {
        type: String,
        required: true
    },
    idFlightScheduling: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Boolean,
        default: false
    },
    cancel: {
        type: Boolean,
        default: false
    }
    
}, {timestamps : true});

const bookingModel = mongoose.model('booking', bookingSchema);
module.exports = bookingModel;