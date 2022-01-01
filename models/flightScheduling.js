const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const flightSchedulingSchema = new Schema({
    to: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    takeOffDate: {
        type: String,
        required: true
    },
    takeOffTime: {
        type: String,
        required: true
    },
    scheduledBy: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    fair: {
        type: Number,
        required: true
    },
    km: {
        type: Number,
        required: true
    }
    
}, {timestamps : true});

const flightSchedulingModel = mongoose.model('flightScheduling', flightSchedulingSchema);
module.exports = flightSchedulingModel;