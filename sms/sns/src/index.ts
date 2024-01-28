import express from 'express';
import AWS from 'aws-sdk';

const app = express();
const port = 3000;

const sns = new AWS.SNS({
  region:"",
  secretAccessKey:"",
  accessKeyId:"",
});

const generateOTP = (length: number = 6): string => {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
};

const sendOTP = async(phone: string, otp: string) => {
  const params = {
    Message: `POLLOS`,
    PhoneNumber: phone
  };

  await sns.publish(params, (err, data) => {
    if (err) {
      console.error('Failed to send OTP:', err);
    } else {
      console.log('OTP sent successfully:', data);
    }
  });
};

const subscribePhoneNumber = async (phone: string) => {
  const params = {
    Protocol: 'sms',
    TopicArn: 'arn-/-', 
    Endpoint: phone,
  };

  await sns.subscribe(params, (err, data) => {
    if (err) {
      console.error('Failed to subscribe phone number:', err);
    } else {
      console.log('Phone number subscribed successfully:', data);
    }
  });
};

app.post('/request-otp', async (req, res) => {
  const phone = req.query.phone as string; 
  const otp = generateOTP();
  
  await subscribePhoneNumber(phone);
  
  await sendOTP(phone, otp);
  res.send('OTP sent successfully!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
