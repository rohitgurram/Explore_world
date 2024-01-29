const nodemailer= require('nodemailer');
const sendEmail = async options =>{
    //1) create a transporter
    console.log('entered sendEmail');
  const transporter= nodemailer.createTransport({
    service:process.env.EMAIL_HOST,
    port:465,
    secure: true,
    logger: true,
    debug: true,
    secureConnection: false,
    auth: {
        Username: process.env.EMAIL_USERNAME,
        Password: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: true
    }
    //Activate in gmail "less secure app" option
  });
    //2)Define email options
  const mailOptions={
    from:'info@mailtrap.club',
    to:'rohitgurram22@gmail.com',
    subject:'options.subject',
    text:'helloworld'
  };
  console.log(transporter);
    //3)Actually send the email 
  let info= await transporter.sendMail(mailOptions);
  console.log('message Sent : %s',info.messageId);
}
module.exports =sendEmail;