const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const sendEmail = async (options) => {
  console.log(`Attempting to send email to: ${options.email}`);
  
  try {
    // Use fallback during SSL setup
    const sourceEmail = process.env.USE_DOMAIN_EMAIL === 'true'
      ? `Fennec FC <noreply@${process.env.DOMAIN_NAME}>`
      : process.env.AWS_SES_FROM_EMAIL;

    console.log(`Using source email: ${sourceEmail}`);
    
    // Check if we're in sandbox mode and recipient is verified
    const isSandbox = process.env.AWS_SES_SANDBOX === 'true';
    if (isSandbox) {
      console.log(`SES Sandbox Mode - recipient ${options.email} should be verified in AWS SES`);
    }
    
    const params = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: [options.email]
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: options.message,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    const result = await ses.send(command);
    console.log('Email sent successfully:', result.MessageId);
    return true;
  } catch (error) {
    if (error.message.includes('not verified')) {
      console.error(`Email address ${options.email} needs verification in SES sandbox mode`);
      throw new Error(`Email address needs verification. Please contact support.`);
    }
    console.error('SES error:', error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = sendEmail;