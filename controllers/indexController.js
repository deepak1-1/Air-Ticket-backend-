
const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const adminModel = require('../models/admin');
const mailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID)


// ****************** Some Usefull functions ********************************

const email_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      password_exp = /.{6,}$/;

function regex_check( regex_exp, input_string ){

    return input_string.match(regex_exp)? true: false;

}

function createtoken( id, key){

    return jwt.sign( {id}, key )
}

function genrateCode(){
    var minm = 100000;
    var maxm = 999999;
    return (Math.floor(Math.random() * (maxm - minm + 1)) + minm);
}

const transporter = mailer.createTransport({
    service: 'gmail',
    auth : {
        user: 'deepaktewatia049@gmail.com',
        pass: process.env.Email_Password
    }
});

const mailOptions = {
    from: 'deepaktewatia049@gmail.com',
    to: ``,
    subject: 'Your verification code',
    text: ``
}

// ****************** Main Routes functions starts here **********************

const check_user = (req, res) => {

    const data = req.body;

    userModel.find({email: data.email}, (err, data)=>{
        if(err){
            console.log("Error Inside Check User: "+err);
            res.send({error: 'Some Error', found: false});
        } else {
            if(data.length === 0){
                res.send({error: false, found: false});
            } else {
                res.send({error:false, found: true});
            }
        }
    });
}

const register_user = async (req, res) => {
    
    const data = req.body;

    if(req.body.name && regex_check(email_exp, req.body.email) && 
        regex_check(password_exp, req.body.password)){

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(data.password, salt);

        const register = userModel({
            name: data.name,
            email: data.email,
            password: hashPassword
        })

        register.save()
                .then(result => {
                    if(result){
                        res.send({added: true, email: false, error: false});
                    } else {
                        res.send({added: false, email: false, error: "Unable to register!"});
                    }
                })
                .catch(err=>{
                    
                    console.log("Error While Registering user: "+err.message, err.code);
                    if(err.code === 11000){
                        res.send({added: false, email: true, error: false});
                    } else {
                        res.send({added: false, email: false, error: "Some Error"});
                    }

                })
        }
}


const login = async (req, res) => {

    const data = req.body;

    if(data.email && data.password){

        userModel.findOne({email: data.email}, (err, user) => {

            if(user){

                bcrypt.compare(data.password, user.password, (err, result)=>{

                    if(result == true){

                        const token = createtoken( user.id, 'USER_TOKEN' );
                        res.send({password: true, email: true, token});
                    
                    } else {
                    
                        res.send({ password: false, email: true});
                    
                    }
                })

            } else {
                res.send({ password: false, email: false});
            }

        })

    } else {
        res.sendStatus(500);
    }
}


const send_code = (req, res)=>{

    let model;
    if(req.body.data === 'admin')
        model = adminModel;
    else if(req.body.data === 'user')
        model = userModel;
    
    model.findOne({email: req.body.email}, (err, data) =>{
        
        if(data){
            console.log(data);
            beforeVerificationCode = genrateCode();
            mailOptions.text = `Your verification code is ${beforeVerificationCode}`;
            mailOptions.to = req.body.email;
            
            transporter.sendMail( mailOptions, (err, info)=> {
                if(err){
                    console.log(err);
                    res.send( {codeSended: false, exists:true } );
                } else {
                    res.send( {codeSended: beforeVerificationCode, exists:true } );
                }
            })

        } else {
            res.send({codeSended: false, exists:false})
        }
    
    } )
}


const update_password = async (req, res)=>{

    console.log(req.body)

    if(regex_check(email_exp, req.body.email) && regex_check(password_exp, req.body.password)){
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        userModel.updateOne({email: req.body.email}, {password: hashPassword}, {upsert: false}, (err,data)=>{
            
            if(data.modifiedCount === 1){
                res.send({erro: false});
            } else {
                res.send({error: 'No such User'});
            }
        })
    } else {
        res.sendStatus(500);
    }
    
}

const login_admin = (req, res)=>{

    const data = req.body;

    if(data.email && data.password){

        adminModel.findOne({email: data.email}, (err, user) => {

            if(user){

                bcrypt.compare(data.password, user.password, (err, result)=>{

                    if(result == true){

                        const token = createtoken( user.id, 'ADMIN_TOKEN' )
                        res.send({error: false, password: true, email: true, token})
                    
                    } else {
                    
                        res.send({error: 'Password is incorrect!', password: false, email: true});
                    
                    }
                })

            } else {
                res.send({error: 'No user with this email!', password: false, email: false});
            }

        })

    } else {
        res.sendStatus(500);
    }
}

const update_admin_password = async (req, res)=>{

    if(regex_check(email_exp, req.body.email) && regex_check(password_exp, req.body.password)){
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        adminModel.updateOne({email: req.body.email}, {password: hashPassword}, {upsert: false}, (err,data)=>{
            
            if(data.modifiedCount === 1){
                res.send({erro: false});
            } else {
                res.send({error: 'No such User'});
            }
        })
    } else {
        res.sendStatus(500);
    }

}


const google_auth = async (req, res) => {

    const { token, googleId } = req.body;

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const { name, email } = ticket.getPayload();

    userModel.findOne({email: email}, async (err, user) => {

        if(err){
            res.send({password: false, email: false, added: false, error: err})
        }

        if(user){

            bcrypt.compare(googleId, user.password, (err, result)=>{

                if(result == true){

                    const token = createtoken( user.id, 'USER_TOKEN' );
                    res.send({password: true, email: true, added: false, error: false, token});
                
                } else {
                
                    res.send({ password: false, email: true, added: false, error: false});
                
                }
            })

        } else {
            
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(googleId, salt);

            const register = userModel({
                name: name,
                email: email,
                password: hashPassword
            })

            register.save()
                    .then(result => {
                        if(result){
                            const token = createtoken( result.id, 'USER_TOKEN' );
                            res.send({added: true, email: false, password:false, error: false, token});
                        } else {
                            res.send({added: false, email: false, password:false, error: "Unable to register!"});
                        }
                    })
                    .catch(err=>{
                        
                        console.log("Error While Registering user: "+err.message, err.code);
                        res.send({added: false, email: false, error: "Some Error"});

                    })
        }

    })

}

module.exports = {
    check_user,
    register_user,
    login,
    send_code,
    update_password,
    login_admin,
    update_admin_password,
    google_auth
};