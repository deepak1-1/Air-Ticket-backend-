const jwt = require('jsonwebtoken');
const adminModel = require('../models/admin');

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
		console.log('Isnide error else');
		res.send({login: false});
	}
}


module.exports = {
    checkAdmin
}
