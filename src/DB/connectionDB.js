import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/Saraha',{serverSelectionTimeoutMS:5000})
        console.log('Connected to DB done successfully');
    } catch (error) {
        console.log("Connected faield to db",error);
    }
}

export default connectDB