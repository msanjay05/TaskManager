const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'sanjayamystery@gmail.com',
        subject:'Welcome to task',
        text:`welcome to the app , ${name}, how is your day`
    })
}

const sendAccountDeleteEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'sanjayamystery@gmail.com',
        subject:'Account Deletion',
        text:`Hi ${name},
            We hope you are doing well
            Your account is deleted successfully,
            Please let us know the reason of deleting your account`
    })
}

module.exports={
    sendWelcomeEmail,
    sendAccountDeleteEmail
}

// sgMail.send({
//     to:'sanjayamystery@gmail.com',
//     from:'sanjayamystery@gmail.com',
//     subject:'first mail ',
//     text:'i hope this works'
// })