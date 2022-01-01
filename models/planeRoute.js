const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const routeSchema = new Schema({
    place1: {
        type: String,
        required: true
    },
    place2: {
        type: String,
        required: true
    },
    km: {
        type: Number,
        required: true
    },
    
}, {timestamps : true});

const routeModel = mongoose.model('route', routeSchema);
module.exports = routeModel;