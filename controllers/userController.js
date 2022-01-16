const bookingModel =  require('../models/booking');
const flightSchedulingModel = require('../models/flightScheduling');
const userModel = require('../models/user');
const adminModel = require('../models/admin');
const bcrypt = require('bcrypt');
const usefulData = require('../useful/functions');
const routeModel = require('../models/planeRoute');


const checkUser  = (req, res) =>{
    res.send({login: true});
}



module.exports = {
    checkUser
}