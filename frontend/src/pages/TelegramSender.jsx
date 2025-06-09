import React, { useState } from 'react';
import axios from 'axios';

const TelegramSender = () => {
  const [chatId, setChatId] = useState('');  // You'll paste your chat ID here
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = async () => {
    try {
      const res = await axios.post('http://localhost:5001/api/telegram/send', {
        chatId,
        text: message
      });
      if (res.data.success) {
        setStatus('✅ Message sent successfully!');
      } else {
        setStatus('❌ Failed to send message.');
      }
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h2>Send Telegram Message</h2>
      <input
        type="text"
        placeholder="Your Telegram chat ID"
        value={chatId}
        onChange={(e) => setChatId(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
      />
      <textarea
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
        rows={4}
      />
      <button onClick={handleSend} style={{ padding: '10px 20px' }}>
        Send
      </button>
      <p>{status}</p>
    </div>
  );
};

export default TelegramSender;
