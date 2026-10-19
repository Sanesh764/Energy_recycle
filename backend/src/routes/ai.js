const express = require('express');
const { chatWithAssistant } = require('../services/ai');

const router = express.Router();

/**
 * POST /api/ai/chat
 * Conversational endpoint for the E-Waste AI Guide.
 * Powered by Amazon Bedrock Converse API with local knowledge-base fallback.
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required and cannot be empty'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Message is too long (maximum 1000 characters)'
      });
    }

    const result = await chatWithAssistant({
      message: message.trim(),
      history: Array.isArray(history) ? history : []
    });

    return res.status(200).json({
      reply: result.reply,
      source: result.source,
      modelId: result.modelId || null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
