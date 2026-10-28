import joi from "joi"

export const Validation=(schema)=>{
    return(req,res,next)=>{
        const errResults=[]
        for (const key of Object.keys(schema)) {
           const {error}=schema[key].validate(req[key],{abortEarly:false})
        if(error){
            error.details.forEach((err)=>{
                errResults.push({
                    message: err.message,
                    path: err.path[0],
                    key
                })
            })
        } 
        }
        if(errResults.length){
            return res.status(400).json({message:"Validation error",error:errResults})
        }
         next()
    }
}