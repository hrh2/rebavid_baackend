const axios = require('axios');

const API_KEY = 'your_resend_api_key';
const API_URL = 'https://api.resend.com/v1/messages';

const sendMessage = async (to, subject, text) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        to: to,
        subject: subject,
        text: text
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

sendMessage('recipient@example.com', 'Hello World', 'This is a test message.');
