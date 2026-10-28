import multer from "multer"
import {randomUUID} from "crypto"
import fs from "node:fs"
import {resolve} from "node:path"





export const multerLocal=({customPath = "General",customType=[]})=>{

    const fullPath=`uploads/${customPath}`
    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath,{recursive:true})
    }

    
    const storage= multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,fullPath)
        },
        filename: (req,file,cb)=>{
            cb(null,randomUUID() + "_" + file.originalname)
        }
        
    })

    function fileFilter(req,file,cb){
        if(!customType.includes(file.mimetype)){
            cb(new Error(`invalid file`))
        }else {
            cb(null,true)
        }
    }
    const upload=multer({storage,fileFilter})
    return upload
}