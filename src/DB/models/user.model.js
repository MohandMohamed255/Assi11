import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/user.enum.js";

const userSchema=new mongoose.Schema({
    fName:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:9
    },
    lName:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:9
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
        min:8,
        max:16
    },
    age:{
        type:Number,
        required:true,
        min:18,
        max:50
    },
    gender:{
        type:String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.male

    },
    phone:String,
    profileImage:String,
    coverImages:[String],
    provider:{
        type:String,
        enum:Object.values(ProviderEnum),
        default:ProviderEnum.system
    },
    role:{
        type:String,
        enum:Object.values(RoleEnum),
        default:RoleEnum.user
    },
    isConfirmed:{
        type:Boolean
    },
    changeCredentialAt:Date
},{
    timestamps:true,
    strict:true,
    strictQuery:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

const userModel=mongoose.models.User || mongoose.model("User",userSchema)
 
export default userModel