const jwt = require('jsonwebtoken');
const adminModel = require('../models/admin');
const userModel = require('../models/user');


const checkAdmin = (req, res, next) =>{

	try{
		let token = req.headers.token;
		if(token){
			
			const decodedToken = jwt.verify(token, "ADMIN_TOKEN");
			if(decodedToken){
				adminModel.findOne({_id: decodedToken.id}, ( err, admin)=>{
					if(err){
						console.log(err);
						res.send({login: false});
					}
					if(admin){
						req.body.adminId = decodedToken.id;
						next()
					}else {
						res.send({login: false})
					}
					
				})
			} else {
				res.send({ login: false });
			}
		} else {
			res.send({ login: false });
		}
	} catch(error){
		console.log(error);
		res.send({login: false});
	}
}


const checkUser = (req, res, next) =>{

	try{
		let token = req.headers.token;
		if(token){
			
			const decodedToken = jwt.verify(token, "USER_TOKEN");
			if(decodedToken){
				userModel.findOne({_id: decodedToken.id}, ( err, admin)=>{
					if(err){
						console.log(err);
						res.send({login: false});
					}
					if(admin){
						req.body.userId = decodedToken.id;
						next()
					}else {
						res.send({login: false})
					}
					
				})
			} else {
				res.send({ login: false });
			}
		} else {
			res.send({ login: false });
		}
	} catch(error){
		console.log(error);
		res.send({login: false});
	}

}


module.exports = {
    checkAdmin,
	checkUser
}
