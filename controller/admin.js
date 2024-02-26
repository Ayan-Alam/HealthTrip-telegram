const path = require('path');
const User = require('../model/user');

exports.getAdminDashboard = (req, res, next) => {
	res.sendFile(path.join(__dirname, '../', 'public', "views", 'admin.html'));
}

exports.getusers = async (req,res,next)=>{
	try{
		const users = await User.find();
	    res.json({users:users});
	} catch (err){
		console.log(err);
	}
}

exports.deleteUser = async (req,res,next)=>{
	try{
	const id = req.params.userID
	console.log(id)
	await User.deleteOne({telegramId:id});
	}catch (err){
		console.log(err);
	}
}