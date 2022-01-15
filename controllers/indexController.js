
const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const adminModel = require('../models/admin');
const mailer = require('nodemailer');
const jwt = require('jsonwebtoken');


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
        pass: 'Deepak@121'
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
    let emailPass = false, namePass = false, passwordPass = false, confirmPasswordPass = false;

    if(data.email.trim().length !== 0 && regex_check( email_exp, data.email) )
        emailPass = true;
    else 
        emailPass = 'Either email is empty or not valid!';
    
    if(data.name.trim().length !== 0)
        namePass = true;
    else
        namePass = 'Name can\'t be empty';

    if(data.password.trim().length !== 0 && regex_check( password_exp, data.password)){
        passwordPass = true;
        if( data.password === data.confirm_password)
            confirmPasswordPass = true;
        else 
            confirmPasswordPass = 'Password don\'t match!';
    } else {
        passwordPass = 'Password should be 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter';
    }

    if(namePass && emailPass && passwordPass && confirmPasswordPass){

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
                        res.send({
                            email: emailPass,
                            name: namePass,
                            password: passwordPass,
                            confirm_password: confirmPasswordPass,
                            redirect: '/login',
                            error: false 
                        })
                    } else {
                        res.send({
                            email: emailPass,
                            name: namePass,
                            password: passwordPass,
                            confirm_password: confirmPasswordPass,
                            redirect: false,
                            error: false 
                        })
                    }
                })
                .catch(err=>{
                    
                    console.log("Error While Registering user: "+err.message);

                    if(err.code === 11000){
                        res.send({
                            email: emailPass,
                            name: namePass,
                            password: passwordPass,
                            confirm_password: confirmPasswordPass,
                            redirect: false,
                            error: 'Email already Exists!'
                        })
                    } else {
                        res.send({
                            email: emailPass,
                            name: namePass,
                            password: passwordPass,
                            confirm_password: confirmPasswordPass,
                            redirect: false,
                            error: err.message
                        })
                    }
                })

    } else {
        res.send({
            email: emailPass,
            name: namePass,
            password: passwordPass,
            confirm_password: confirmPasswordPass,
            redirect: false,
            error: false
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

                        // req.session.userId = user._id.toString();
                        res.send({error: false, password: true, email: true})
                    
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

const send_code = (req, res)=>{

    let model;
    if(req.body.data === 'admin')
        model = adminModel;
    else if(req.body.data === 'user')
        model = userModel;
    
    model.findOne({email: req.body.email}, (err, data) =>{
        
        if(data){

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

                        console.log(user);
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


module.exports = {
    check_user,
    register_user,
    login,
    send_code,
    update_password,
    login_admin,
    update_admin_password
};