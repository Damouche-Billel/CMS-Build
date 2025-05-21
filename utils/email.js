const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create test account for development
    const testAccount = await nodemailer.createTestAccount();
    
    // Create transporter with Ethereal credentials
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Email options
    const message = {
      from: '"Fennec FC" <noreply@fennecfc.com>',
      to: options.email,
      subject: options.subject,
      html: options.message
    };

    // Send email
    const info = await transporter.sendMail(message);

    // Log the test email URL - THIS IS WHERE YOU CAN VIEW THE EMAIL
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return info;

  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;