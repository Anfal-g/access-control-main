import express from 'express';
import TelegramBot from 'node-telegram-bot-api';

const router = express.Router();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Store chat IDs of users who interact with the bot
const userChatIds = new Set();

// Listen for messages (for receiving)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  userChatIds.add(chatId); // Save chat ID for later replies
  console.log(`Received message from ${chatId}: ${msg.text}`);
});

// API endpoint to send messages (for sending)
router.post('/send', async (req, res) => {
  const { chatId, text } = req.body;

  try {
    await bot.sendMessage(chatId, text);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;