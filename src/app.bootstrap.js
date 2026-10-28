import express from 'express'
import connectDB from './DB/connectionDB.js';
import userRouter from './modules/users/user.controller.js';
import connectionRedis from './DB/connection.redis.js';
import { getvalue, setValue } from './DB/redis.service.js';
import messageRouter from './modules/messages/message.controller.js';
import convRouter from './modules/conversations/conversation.controller.js';
const app=express();
const port=5000;



const bootstrap=async ()=>{
    
    
    app.use(express.json())
    await connectDB()
    await connectionRedis()
app.get('/',(req,res)=>{
    return res.status(200).json({
        message:"Welcome to Saraha app"
    })
})

app.use("/users",userRouter)
app.use("/messages",messageRouter)
app.use("/conversations",convRouter)







app.use('{/*demo}',(req,res,next)=>{
    throw new Error(`The URL u have entered ${req.originalUrl} with method ${req.method} not exsist`,{cause:404})
})

app.use((err,req,res,next)=>{
    console.log(err);
    res.status(err.cause || 500).json({message:err.message,stack:err.stack})
})



app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
    
})
}


export default bootstrap
