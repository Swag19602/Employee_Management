const jwt=require('jsonwebtoken')
const Employees=require('../models/employee')


const auth=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        const verifyUser=await jwt.verify(token,"swag")
        console.log(verifyUser)
        const user=await Employees.findOne({_id:verifyUser})
        console.log(user);
        req.token=token;
        req.user=user;
        next();
    } catch (error) {
        res.send(404).send(error)
    }
}
module.exports=auth