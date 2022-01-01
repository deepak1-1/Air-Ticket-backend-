const bookingModel =  require('../models/booking');
const flightSchedulingModel = require('../models/flightScheduling');
const userModel = require('../models/user');
const adminModel = require('../models/admin');
const bcrypt = require('bcrypt');
const usefulData = require('../useful/functions');
const routeModel = require('../models/planeRoute');


const getAdminPage = (req, res)=>{
    console.log("Inside ADMIN HOME PAGE!");
    res.send({valid: true});
}

const getFlightAndBookingCount = (req, res)=>{
    
    // bookingModel.find({dateTimeStart:})
    let dateNow = new Date();
    dateNow = dateNow.toDateString();

    flightSchedulingModel.find({date: dateNow})
        .then(result => {
            
            const data = {flight: 0, booking: 0};
            data.flight = result.length;

            if(data.flight !== 0){
                result.forEach( (eachResult,index, array) =>{

                    bookingModel.find({idFlightScheduling: eachResult.id})
                        .then((bookingData) => {
                            data.booking += bookingData.length;
                        })
                    
                    // when loop overs
                    if(index === (array.length-1)){
                        res.send({data});
                    }

                })
            } else {
                res.send({data});
            }
        })
}

const getAdminCount = (req, res)=>{
    
    adminModel.find()
        .then(result => {
            const data = result.length
            res.send({data});
        })
}

const addAdmin = async (req, res)=>{

    const data = req.body;
    if(usefulData.regex_check(usefulData.email_exp, data.email) && 
       usefulData.regex_check(usefulData.mobile_exp, data.mobile) &&
       usefulData.regex_check(usefulData.adharCard_exp, data.adharCard) && 
       data.name.trim().length !== 0){

        const checkEmail = await adminModel.findOne({email: req.body.email});
        const checkNumber = await adminModel.findOne({mobile: req.body.mobile});

        if(checkEmail){
            res.send({found:'email', added: false});
        } else {

            if(checkNumber){
                res.send({found:'mobile', added:false});
            } else {
                
                let name = data.name.toLowerCase();                 
                let  createdPassword = "";
                createdPassword = createdPassword.concat(name.substr(0, 4), "@", data.adharCard.slice(8,13));

                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(createdPassword, salt);

                const addAdmin = adminModel({
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile,
                    password: hashPassword,
                    adharCard: data.adharCard
                })

                addAdmin.save()
                    .then(result => {
                        res.send({found: false, added: true});
                    })
                    .catch(err => {
                        res.send({Error: 'Some error'});
                    })
            }
        }

    } else {
        res.sendStatus(500);
    }
    
}

const addRoute = async (req, res)=>{
    
    const data = req.body;
    data.place1 = data.place1.toUpperCase();
    data.place2 = data.place2.toUpperCase();
    data.km = Number(data.km);

    if(data.place1.trim().length !== 0 && data.place2.trim().length !== 0 && data.km){

        const check1 = await routeModel.findOne({place1: data.place1, place2: data.place2})
        const check2 = await routeModel.findOne({place1: data.place2, place2: data.place1})

        if(check1){
            res.send({exists: true, added: false});
        } else {
            if(check2){
                res.send({exists: true, added: false})
            } else {

                const routeRegister = routeModel(data);

                routeRegister.save()
                    .then(result => {
                        res.send({exists: false, added: true});
                    })

            }
        }

    } else {
        res.sendStatus(500);
    }
}

const getPlaces = async (req, res) => {
    
    const sendData = {
        distanceList: [],
        nameList: []
    }
    const data = await routeModel.find();

    if(data){

        data.forEach( (eachData, index, array) =>{
            var appendDataDistance = [];
            appendDataDistance.push(eachData.place1);
            appendDataDistance.push(eachData.place2);
            appendDataDistance.push(eachData.km);
            sendData.distanceList.push(appendDataDistance);

            sendData.nameList.push(eachData.place1);
            sendData.nameList.push(eachData.place2);

            if((array.length-1) === index){
                res.send(sendData);
            }

        } )
    } else {
        res.send({data: false});
    }
}

const getMyData = (req, res) =>{ 
    
    const id = req.body.id;

    if(id.trim().length !== 0){
        
        adminModel.findOne({_id: id})
            .then(result =>{
                res.send({error: false, data: result});
            })
            .catch(err => {
                console.log(err);
                res.send({error: err, data: false});
            })

    } else { res.sendStatus(500); }
}

const scheduleFlight = (req, res) =>{
    
    const data = req.body;
    flightSchedulingModel
    .findOne({to: data.to, from: data.from, 
             takeOffDate: data.takeoffDate, takeOffTime: data.takeoffTime}, 
             (err, findResult) => {
                 
                 if(err){
                     res.send({error: err, alreadyExists: false, scheduled: false});
                 } 

                 if(findResult){
                     res.send({error: false, alreadyExists: true, scheduled: false});
                 } else {

                    const register = flightSchedulingModel({
                        to: data.to,
                        from: data.from,
                        fair: data.fair,
                        takeOffDate: data.takeoffDate,
                        takeOffTime: data.takeoffTime,
                        scheduledBy: data.userId,
                        duration: data.duration,
                        fair: data.fair,
                        km: data.km 
                    })

                    register.save()
                        .then(saveResult => {
                            
                            res.send({error: false, alreadyExists: false, scheduled: true});
                        })
                        .catch(error=>{
                            res.send({error: error, alreadyExists: false, scheduled: true});
                        })
                 }
             } )
}

const getRouteData = (req, res)=>{

    routeModel.find()
    .then(result => {
        res.send({result, error: false, valid: true});
    })
    .catch(err => {
        console.log(err);
        res.send({result:false, error: false, valid: true});
    })
}

module.exports = {
    getAdminPage,
    getFlightAndBookingCount,
    getAdminCount,
    addAdmin,
    addRoute,
    getPlaces,
    getMyData,
    scheduleFlight,
    getRouteData
}