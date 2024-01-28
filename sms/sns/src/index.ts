import express from 'express';
import AWS from 'aws-sdk';

const app = express();
const port = 3000;

// Initialize AWS SDK
const sns = new AWS.SNS({
  region:`ap-south-1`,
  accessKeyId: `AKIATCRL5COQBRSQ22XQ`, 
  secretAccessKey: `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`
});

// Generate OTP
const generateOTP = (length: number = 6): string => {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
};

// Send OTP via SMS
const sendOTP = async(phone: string, otp: string) => {
  const params = {
    Message: `Gandi re nabu ki? `,
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

// Subscribe phone number to SNS topic
const subscribePhoneNumber = async (phone: string) => {
  const params = {
    Protocol: 'sms',
    TopicArn: 'arn:aws:sns:ap-south-1:211619222432:agrosafe-sns', // Replace 'your-topic-arn' with your SNS topic ARN
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

// Endpoint to request OTP
app.post('/request-otp', async (req, res) => {
  const phone = req.query.phone as string; // Assuming phone number is sent in the query string
  const otp = generateOTP();
  
  // Subscribe phone number if not already subscribed
  await subscribePhoneNumber(phone);
  
  // Send OTP
  await sendOTP(phone, otp);
  res.send('OTP sent successfully!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
