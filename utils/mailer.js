const mailer = require('nodemailer');
require('dotenv').config();



async function sendToken(user, token) {

    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
    const mailOptions = {
        from: `Favorite Vault <${process.env.EMAIL_USER}>`,
        to: user,
        subject: 'Password Reset',
        text: `Please use the following token to reset your password: ${token}`,
        html: `<p>Please use the following token to reset your password: <strong>${token}</strong></p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

const tokgen = () => {
    const randomToken = Math.random().toString(36).slice(2, 8);
    return randomToken;
}



module.exports = {sendToken, tokgen};