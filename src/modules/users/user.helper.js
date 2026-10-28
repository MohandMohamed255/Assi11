import { hashSync } from "bcrypt"
import { eventEmitter } from "../../common/utils/events.js"
import * as dbService from "../../DB/db.service.js";
import { deleteKey, getvalue, incr, setValue, ttl } from "../../DB/redis.service.js"
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js"
import userModel from "../../DB/models/user.model.js"
import { emailTempled } from "../../common/utils/email.templete.js";

export const sendOTP=async({email ,isConfirmed,subject="Confirm Email"}={})=>{
    const isBlocked_ttl=await ttl(`otp::block::${email}`)
    if(isBlocked_ttl>0){
        throw new Error(`You have been blocked and u can resend otp again after : ${isBlocked} sec`)
    }
    // if(isBlocked_ttl<0){
    //     if(getvalue(`otp::max::${email}`>5)){
    //         await setValue({
    //     key:`otp::max::${email}`,
    //     value: 1 ,
    //     ttl :60*4
    //         })
    //     }
    // }

    const otpTTL=await ttl(`otp::${email}`)
    if(otpTTL>0) throw new Error(`You have unexpired otp and will end after ${otpTTL} sec. hint(you can resend after the time)`)
    
    const max_otp=await getvalue(`otp::max::${email}`)
    if(max_otp>=5){
        await setValue({
            key:`otp::block::${email}`,
            value:"1",
            ttl:60*30
        })
        await deleteKey(`otp::max::${email}`)
        throw new Error("You reached the maximum tries of resend OTP u can try later after banded:30mins")
    }    

    const user=await dbService.findOne({
        model:userModel,
        filter:{
            email,
            isConfirmed: {$exists:isConfirmed}
        }
    })
    if(!user) throw new Error("user not exist or already confirmed")
        const otp=await generate_otp()
        const otpHash=hashSync(otp,12)
        await setValue({
        key:`otp::${email}`,
        value: otpHash ,
        ttl :60*4
    })
    eventEmitter.emit("confirm-email",async()=>{
        await sendEmail({
        to:email,
        subject,
        html:emailTempled(otp)
        })
    })

    await incr(`otp::max::${email}`)
}