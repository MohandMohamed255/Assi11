import jwt from "jsonwebtoken";
import * as dbService from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { ttl } from "../../DB/redis.service.js";

export const authentication=async(req,res,next)=>{
const {token}=req.headers;
    if(!token){
        throw new Error("token not exsits",{cause:400})
    }
    const verify= jwt.verify(token,"mohand3mk")
    if(!verify?.id){
        throw new Error("inValid token",{cause:400})
    }
    const user =await dbService.findOne({
        model:userModel,
        filter:{
            email:verify.email
        }
    })
    if(!user){
        throw new Error("user already exsits",{cause:400})
    }
    if(!user?.isConfirmed) {
        throw new Error("Please confirm your email")
    }
    if(user?.changeCredentialAt?.getTime()> verify.iat*1000){
        throw new Error("token expire u should signin again",{cause:400})
    }
    if(await ttl(`revoke_token:${user._id}::${verify.jti}`) > 0){
        throw new Error("token expire from this device u should signin again",{cause:400})
    }
    req.user= user
    req.verify=verify
    
    next()
}
export const optionalAuthentication = async (req, res, next) => {
    const token = req.headers.token?.trim();
    if (!token) {
        req.user = null;
        req.verify=null;
        return next();
    }
    const verify= jwt.verify(token,"mohand3mk")
    if(!verify?.id){
        throw new Error("inValid token",{cause:400})
    }
    const user =await dbService.findOne({
        model:userModel,
        filter:{
            email:verify.email
        }
    })
    if(!user){
        throw new Error("user already exsits",{cause:400})
    }
    if(!user?.isConfirmed) {
        throw new Error("Please confirm your email")
    }
    if(user?.changeCredentialAt?.getTime()> verify.iat*1000){
        throw new Error("token expire u should signin again",{cause:400})
    }
    if(await ttl(`revoke_token:${user._id}::${verify.jti}`) > 0){
        throw new Error("token expire from this device u should signin again",{cause:400})
    }
    req.user= user
    req.verify=verify
    
    next()
};