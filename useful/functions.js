const mailer = require('nodemailer');

const email_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      adharCard_exp = /^[2-9]{1}[0-9]{11}$/,
      mobile_exp = /^(91|0|)[6-9]\d{9}$/,
      password_exp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

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

function regex_check( regex_exp, input_string ){

    return input_string.match(regex_exp)? true: false;

}


module.exports = {
    email_exp,
    adharCard_exp,
    mobile_exp,
    password_exp,
    transporter,
    mailOptions,
    regex_check

}