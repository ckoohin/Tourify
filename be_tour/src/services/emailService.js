const nodemailer = require('nodemailer');

async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,        
      port: parseInt(process.env.SMTP_PORT) || 587, 
      secure: false,                      
      auth: {
        user: process.env.SMTP_USER,     
        pass: process.env.SMTP_PASSWORD,  
      },
    });

    const info = await transporter.sendMail({
      from: `"Tourify" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return info;

  } catch (error) {
    console.error("SMTP error:", error); 
    throw new Error('Could not send email');
  }
}

module.exports = { sendEmail };