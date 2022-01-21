const bookingModel =  require('../models/booking');
const flightSchedulingModel = require('../models/flightScheduling');
const userModel = require('../models/user');
const adminModel = require('../models/admin');
const bcrypt = require('bcrypt');
const usefulData = require('../useful/functions');
const routeModel = require('../models/planeRoute');


const checkAdmin = (req, res)=>{
    res.send({login: true});
}

const getTodayCount = (req, res)=>{
    
    let dateNow = new Date();
    dateNow = dateNow.toDateString();

    flightSchedulingModel.find({date: dateNow})
        .then(result => {
            
            const data = {flight: 0, booking: 0, admin: 0, login:true };
            data.flight = result.length;

            if(data.flight !== 0){
                result.forEach( (eachResult,index, array) =>{

                    bookingModel.find({idFlightScheduling: eachResult.id})
                        .then((bookingData) => {
                            data.booking += bookingData.length;
                        })
                    
                    // when loop overs
                    if(index === (array.length-1)){
                        adminModel.find((err, admins)=>{
                            if(err)
                                console.log(err);
                            data.admin = admins.length;
                            res.send(data)
                        });
                    }

                })
            } else {
                adminModel.find((err, admins)=>{
                    if(err)
                        console.log(err);
                    data.admin = admins.length;
                    res.send(data);
                });
            }
        })
}


const addAdmin = async (req, res)=>{

    const data = req.body;
    console.log(data);
    if(usefulData.regex_check(usefulData.email_exp, data.email) && 
       usefulData.regex_check(usefulData.mobile_exp, data.mobile) &&
       usefulData.regex_check(usefulData.adharCard_exp, data.adharcard) && 
       data.name.trim().length !== 0){

        const checkEmail = await adminModel.findOne({email: req.body.email});
        const checkNumber = await adminModel.findOne({mobile: req.body.mobile});

        if(checkEmail){
            res.send({error:'email'});
        } else {

            if(checkNumber){
                res.send({error:'mobile'});
            } else {
                
                let name = data.name.toLowerCase();                 
                let  createdPassword = "";
                createdPassword = createdPassword.concat(name.substr(0, 4), "@", data.adharcard.slice(8,13));

                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(createdPassword, salt);

                const addAdmin = adminModel({
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile,
                    password: hashPassword,
                    adharcard: data.adharcard
                })

                addAdmin.save()
                    .then(result => {
                        res.send({error: false, login:true });
                    })
                    .catch(err => {
                        console.log(err);
                        res.send({error: 'Some error', login:true });
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
    data.distance = Number(data.distance);
    
    if(data.place1.trim().length !== 0 && data.place2.trim().length !== 0 && data.distance){

        const check1 = await routeModel.findOne({place1: data.place1, place2: data.place2})
        const check2 = await routeModel.findOne({place1: data.place2, place2: data.place1})

        if(check1){
            res.send({exists: true, added: false,  login:true });
        } else {
            if(check2){
                res.send({exists: true, added: false, login:true })
            } else {

                const routeRegister = routeModel(data);

                routeRegister.save()
                    .then(result => {
                        res.send({exists: false, added: true, login:true });
                    })

            }
        }

    } else {
        res.sendStatus(500);
    }
}

const getDestinations = async (req, res) => {
    
    const sendData = {
        distanceList: [],
        nameList: [],
        login:true 
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
                res.send({error: false, data: result,  login:true });
            })
            .catch(err => {
                console.log(err);
                res.send({error: err, data: false,  login:true });
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
                     res.send({error: err, alreadyExists: false, scheduled: false,  login:true });
                 } 

                 if(findResult){
                     res.send({error: false, alreadyExists: true, scheduled: false,  login:true });
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
                            
                            res.send({error: false, alreadyExists: false, scheduled: true,  login:true });
                        })
                        .catch(error=>{
                            res.send({error: error, alreadyExists: false, scheduled: true,  login:true });
                        })
                 }
             } )
}

const getRouteData = (req, res)=>{

    routeModel.find()
    .then(result => {
        res.send({result, error: false, valid: true, login:true});
    })
    .catch(err => {
        console.log(err);
        res.send({result:false, error: false, valid: true, login:true});
    })
}

const updatePassword = async (req, res) =>{

    const data = req.body;

    adminModel.findOne({_id:data.adminId}, (err, admin)=>{
        if(err){
            console.log(err);
            res.send({error: "some error", login: true});
        }
        
        if(admin){

            bcrypt.compare(data. oldpassword, admin.password, async (err, result)=>{
                if(result){
                    
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(data.newpassword, salt);

                    adminModel.updateOne({_id: data.adminId}, 
                                            {password: hashPassword},
                                            {upsert: false}, (err, updated)=>{
                            
                            if(err){
                                console.log(err);
                                res.send({error: "Some error", login: true});
                            } else {
                                if(updated.modifiedCount){
                                    res.send({error: false, login: true});
                                } else {
                                    res.send({error: "unable to Updated", login: true});
                                }
                            }
                    })

                }  else {
                    res.send({error: "Current password wrong", login: true});
                }
            })
        } else {
            res.send({error: "don't exists ", login: true});
        }
    })
    
                
}


const getFlightRoutes = (req, res) => {

    routeModel.find((err, data)=>{
        if(err){
            console.log(err);
            res.send({data:[], login:true});
        } else {
            res.send({data, login:true});
        }
    });
}

const UpdateFlightRoute = (req, res) =>{

    const data = req.body;
    
    routeModel.updateOne({_id:data.id}, {place1:data.place1, place2: data.place2, distance: data.distance}, (err, update)=>{

        if(err){
            console.log(err);
            res.send({error: true, modified: false, login:true});
        } else {
            if(update.modifiedCount){
                res.send({error:false, modified: true, login:true});
            } else {
                res.send({error:false, modified: false, login:true});
            }
        }
    })
}

const DeleteFlightRoute = (req, res) => {

    routeModel.remove({_id: req.body.id}, (err, data)=>{
        if(err){
            console.log(err);
            res.send({done: false, login:true});
        } else {
            res.send({done: true, login:true});
        }
    })
}

module.exports = {
    checkAdmin,
    getTodayCount,
    addAdmin,
    addRoute,
    getDestinations,
    getMyData,
    scheduleFlight,
    getRouteData,
    updatePassword,
    getFlightRoutes,
    UpdateFlightRoute,
    DeleteFlightRoute
}