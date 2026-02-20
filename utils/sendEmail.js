const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD
    }
})

transporter.verify((error, success)=>{
    if(error){
        console.error("SMTP Error:" , error)
    }
    else{
        console.log("SMTP server is ready to take messages")
    }
})
 
const sendOTPEmail= async(to, otp) =>{
    await transporter.sendMail({
        to,
        subject: "Verify your Email",
        html: `<h2>Your OTP is ${otp}</h2>`
    })
}

module.exports = sendOTPEmail
