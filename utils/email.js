const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const sendEmail = async (options) => {
  try {
    const params = {
      Source: process.env.AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [options.email]
      },
      Message: {
        Subject: {
          Data: options.subject
        },
        Body: {
          Html: {
            Data: options.message
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await ses.send(command);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('SES error:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;