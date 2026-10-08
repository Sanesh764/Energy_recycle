const express = require('express');
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { createUploadPresignedUrl } = require('../services/s3');

const router = express.Router();

const presignRequestSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png'], {
    errorMap: () => ({ message: 'Invalid contentType. Only image/jpeg and image/png are allowed' })
  })
});

/**
 * POST /api/uploads/presign
 * Role: citizen only
 * Body: { contentType: "image/jpeg" | "image/png" }
 * Returns: { uploadUrl, key }
 */
router.post('/presign', authenticate, requireRole('citizen'), async (req, res, next) => {
  try {
    const parseResult = presignRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid request body';
      return res.status(400).json({ error: firstError });
    }

    const { contentType } = parseResult.data;
    const result = await createUploadPresignedUrl({ contentType });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
