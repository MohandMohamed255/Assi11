import { Router } from "express";
import * as US from "./user.service.js"
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { Validation } from "../../common/middleware/validation.js";
import { confirmEmailSchema, refreshTokenSchema, shareProfileSchema, signInSchema, signupSchema, updatePasswordSchema, updateProfileSchema } from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";

const userRouter=Router({strict:true , caseSensitive:true })



userRouter.post("/signup",multerLocal({customPath:"admin",customType:['image/png']}).single("attachment"),
Validation(signupSchema),
US.signup)
userRouter.get("/signin",Validation(signInSchema),US.signin)
userRouter.get("/refresh-token",Validation(refreshTokenSchema),US.refreshToken)
userRouter.get("/profile",authentication,authorization(Object.values([RoleEnum.user])) ,US.getProfile)
userRouter.get("/share-profile/:id",Validation(shareProfileSchema),US.shareProfile)
userRouter.patch("/update-profile",authentication,Validation(updateProfileSchema),US.updateProfile)
userRouter.patch("/reSendOtp",US.reSendOTP)
userRouter.patch("/update-password",Validation(updatePasswordSchema),authentication,US.updatePassword)
userRouter.patch("/forget-password",US.fPassword)
userRouter.patch("/reset-password",US.resetPassword)
userRouter.patch("/confirm-email",Validation(confirmEmailSchema),US.confirmEmail)
userRouter.patch("/logout",authentication,US.logout)



export default userRouter