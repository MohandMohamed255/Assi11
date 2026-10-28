import mongoose from "mongoose";
import userModel from "../../DB/models/user.model.js";
import jwt from 'jsonwebtoken'
import * as dbService from "../../DB/db.service.js";
import { Decrypt, Encrypt } from "../../common/middleware/security/encrypted.js";
import bcrypt, { compareSync, hashSync } from "bcrypt"
import { Compare, Hash } from "../../common/middleware/security/hash.js";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import joi from "joi"
import {randomUUID} from "node:crypto"
import { deleteKey, expire, getvalue, incr, Keys, setValue, ttl } from "../../DB/redis.service.js";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/events.js";
import { emailTempled } from "../../common/utils/email.templete.js";
import { sendOTP } from "./user.helper.js";

// ==============================================Sign Up==================================================
export const signup=async(req,res,next)=>{
        const {fName,lName,email,password,age,gender,phone,profileImage,role}=req.body
    if(await userModel.findOne({email:email})){
        throw new Error("Email already exist",{cause:400})
    }
    const otp=await generate_otp()
    const otpHash=hashSync(otp,12)

    eventEmitter.emit("confirm-email",async()=>{
        await sendEmail({
        to:email,
        subject:"Confirm Email",
        html:emailTempled(otp)
        })
    })
    await setValue({
        key:`otp::${email}`,
        value: otpHash ,
        ttl :60*4
    })
    await setValue({
        key:`otp::max::${email}`,
        value: 1 ,
        ttl :60*4
    })

    

    const user=await dbService.create({
        model:userModel,
        data:{fName,
            lName,
            email,
            password:await Hash(password),
            age,
            gender,
            phone:Encrypt(phone),
            profileImage:req.file.path,
            // coverImages: paths
        }
    })

    return res.status(201).json({
        message:"Successfully",user
    })

}
// ==============================================reSend OTP==================================================
export const reSendOTP=async(req,res,next)=>{
    const {email}=req.body;
    await sendOTP({email , isConfirmed: false })
    return res.status(201).json({message:"OTP resended successfully"})
}
// ==============================================sign in==================================================
export const signin=async(req,res,next)=>{
//         const {email,password}=req.body;
//         const user=await dbService.findOne({
//             model:userModel,
//             filter:{email:email,
//                 isConfirmed: {$exists:true},
//                 provider:ProviderEnum.system
//             }
//         });
//         if(!user){
//         throw new Error("Email already exist",{cause:400})
//         }
//         if(!await Compare(password,user.password)){
//         throw new Error("inValid password",{cause:400})
//         }

//         const tokenId= randomUUID()
//         const access_token= jwt.sign({id:user._id,email:user.email},"mohand3mk",{
//             expiresIn:60*2,
//             issuer:"http://localhost:3333",
//             jwtid:tokenId
//         })
//         const refresh_token= jwt.sign({id:user._id,email:user.email},"3mkmohand",{
//             expiresIn: "1d",
//             jwtid:tokenId
//         })

//         return res.status(200).json({message:"Done",tokens:{access_token,refresh_token}})
     const { email, password } = req.body;

    const blockTTL = await ttl(`signin::block::${email}`);
    if (blockTTL > 0) {
        throw new Error(
            `Too many failed attempts. Try again after ${blockTTL} sec`,
            { cause: 429 }
        );
    }

    const user = await dbService.findOne({
        model: userModel,
        filter: {
            email,
            // isConfirmed: { $exists: true },
            provider: ProviderEnum.system
        }
    });

    
    const isValid = user && await Compare(password, user.password);

    if (!isValid) {
        const attempts = await incr(`signin::max::${email}`);

    
        if (attempts === 1) {
            await expire(`signin::max::${email}`, 60 * 15);
        }

        if (attempts >= 5) {
            await setValue({
                key: `signin::block::${email}`,
                value: "1",
                ttl: 60 * 5
            });
            await deleteKey(`signin::max::${email}`);
            throw new Error(
                "You reached the maximum login attempts. You are blocked for 5 minutes",
                { cause: 429 }
            );
        }

        throw new Error("Invalid email or password", { cause: 400 });
    }
    if (!user.isConfirmed) {
    throw new Error("Please confirm your email", { cause: 400 });
}

    await deleteKey(`signin::max::${email}`);

    const tokenId = randomUUID();
    const access_token = jwt.sign({ id: user._id, email: user.email }, "mohand3mk", {
        expiresIn: 60 * 5,
        issuer: "http://localhost:3333",
        jwtid: tokenId
    });
    const refresh_token = jwt.sign({ id: user._id, email: user.email }, "3mkmohand", {
        expiresIn: "1d",
        jwtid: tokenId
    });

    return res.status(200).json({ message: "Done", tokens: { access_token, refresh_token } });
   
}
// ==============================================confirm  email===========================================
export const confirmEmail=async(req,res,next)=>{
const {email , otp} = req.body;
const otpValue=await getvalue(`otp::${email}`)
if(!otpValue){
    throw new Error("OTP expire",{cause:400})
}
if(!compareSync(otp,otpValue)){
    throw new Error("inValid OTP")
}
const user =await dbService.findOneAndUpdate({
    model: userModel,
    filter:{
        email,
        isConfirmed:{$exists:false}
    },
    update:{
        isConfirmed:true
    }
})
if(!user){
    throw new Error("user not exist or already confirmed",{cause:400})
}   
    await deleteKey(`otp::${email}`)
    return res.status(200).json({message:"your email has been confirmed successflly"})
}
// ==============================================Get Profile==============================================
export const getProfile=async(req,res,next)=>{
    

    return res.status(200).json({message:"done",user:req.user})


}
// ==============================================Share Profile============================================
export const shareProfile =async(req,res,next)=>{
    const {id}=req.params
    let user=await dbService.findById({
        model:userModel,
        id,
        options:{password:0}
    })
    if(!user){
        throw new Error("User is not exsist",{cause:400})
    }
    user.phone=Decrypt(user.phone)

    return res.status(200).json({message: "Done", user})
}
// ==============================================refresh Token============================================
export const refreshToken=async(req,res,next)=>{
    const {authorization}=req.headers;
    if(!authorization){
        throw new Error("inValidToken")
    }
    const decoded=jwt.verify(authorization,"3mkmohand")
    if(!decoded?.id){
        throw new Error("InValid Token")
    }
    const user=await dbService.findOne({
            model:userModel,
            filter:{_id:decoded.id}
        });
        if(!user){
        throw new Error("Email already exist",{cause:400})
        }
        const access_token= jwt.sign({id:user._id,email:user.email},"mohand3mk",{
            expiresIn:60*2,
            issuer:"http://localhost:3333"
        })
        return res.status(200).json({message:"Done",tokens:{access_token}})

}
// ==============================================update profile===========================================
export const updateProfile=async(req,res,next)=>{
    const {fName,lName,phone,age}=req.body

    let updateQuery={}
    if(fName !== undefined){
        updateQuery.fName=fName
    }
    if(lName !== undefined){
        updateQuery.lName=lName
    }
    if(age !== undefined){
        updateQuery.age=age
    }
    if(phone !== undefined){
        updateQuery.phone=Encrypt(phone)
    }

    if(Object.keys(updateQuery).length ==0){
        throw new Error("no data updated",{cause:400})
    }
    let user =await dbService.findByIdAndUpdate({
        model:userModel,
        filter:req.user._id,
        update:updateQuery
    })
    return res.status(201).json({
        message:"Done",
        user
    })
}
// ==============================================update Password==========================================
export const updatePassword=async(req,res,next)=>{
    const {oldPassword,newPassword,cPassword}=req.body
if(!await Compare(oldPassword,req.user.password)){
    throw new Error("Wrong oldPassword")
}
   req.user.password=await Hash(newPassword)
   req.user.changeCredentialAt=new Date()
   

   await req.user.save()
    return res.status(201).json({
        message:"Done",
        user:req.user
    })
}
// ==============================================log out==================================================
export const logout = async (req, res, next) => {
    const {flag}=req.query 
    if(flag=="all"){
        req.user.changeCredentialAt=new Date()
        await req.user.save()
        await deleteKey(await Keys(`revoke_token:${req.user._id}::${req.verify.jti}`))
    }else{
        console.log(req.verify.exp - Math.floor((Date.now()/1000)));
        
        await setValue({
            key:`revoke_token:${req.user._id}::${req.verify.jti}`,
            value:`${req.verify.jti}`,
            ttl: req.verify.exp - Math.floor((Date.now()/1000))
        })
}

    return res.status(200).json({ message: "Done" })
}
// =============================================forget password============================================
export const fPassword = async (req, res, next) => {
    const {email}=req.body
     await sendOTP({email ,isConfirmed:true,subject:"Forget Password"})
    return res.status(200).json({ message: "Done" })
}
// =============================================reset password============================================
export const resetPassword = async (req, res, next) => {
    const {email,code,password}=req.body
    const otp=await getvalue(`otp::${email}`)
        if(!otp) throw new Error(`otp expire`)

            if(!compareSync(code,otp)){
                throw new Error("invalid OTP")
            }
                const user=await dbService.findOneAndUpdate({
                    model:userModel,
                    filter:{
                        email,
                        isConfirmed:{$exists:true}
                    },
                    update:{
                        password:hashSync(password,12),
                        changeCredentialAt:new Date()
                    }
                })
                if(!user){
                    throw new Error("user doesn't exists")
                }
                await deleteKey(`otp::${email}`)
    return res.status(200).json({ message: "your password has been updated" })
}



