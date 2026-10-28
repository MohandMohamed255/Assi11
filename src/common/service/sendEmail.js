import nodemailer from "nodemailer";
import {randomInt, randomUUID} from "crypto"

 
const sendEmail=async({to,subject,html,attachments})=>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"mohandelgn88889@gmail.com",
            pass:"bpaydzhqdfhpfwwa"
        }
    })
    const info = await transporter.sendMail({
    from: '"Mohand" <mohandelgn88889@example.com>', // sender address
    to, // list of recipients
    subject, // subject line
    html: html || "",
    attachments:attachments || [] // HTML body
  });

  return info.accepted.length > 0 ?true : false 

}
export const generate_otp=async()=>{
    return randomInt(1000,10000).toString()
  }
console.log(sendEmail);

export default sendEmail