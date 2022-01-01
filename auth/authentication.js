const jwt = require('jsonwebtoken');


const checkAdmin = (req, res, next) =>{

    const token = req.cookies.jwt;
	console.log('INSIDE VALIDATION')
    if(token){
		console.log(token);
		jwt.verify(token, 'Admin_Login', (err, decodedToken)=>{
			if(err){
				console.log(err);
				res.send({valid: false})
			} else {
				next();
			}
		})
	} else {
		console.log("INVALID TOKEN");
		res.send({valid: false});
	}
}


module.exports = {
    checkAdmin
}
