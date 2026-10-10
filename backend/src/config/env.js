const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables from .env file if available
dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().regex(/^\d+$/).default('5000').transform(Number),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI must be provided'),
    COGNITO_USER_POOL_ID: z.string().optional(),
    COGNITO_CLIENT_ID: z.string().optional(),
    ALLOW_DEV_DEMO_AUTH: z
      .enum(['true', 'false'])
      .default('false')
      .transform((val) => val === 'true'),
    CORS_ORIGIN: z.string().default('*'),
    // AWS Configuration: required in dev/prod; deterministic defaults only in test mode
    AWS_REGION: z.string().min(1, 'AWS_REGION must be explicitly configured in non-test environments'),
    S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME must be explicitly configured in non-test environments'),
    BEDROCK_MODEL_ID: z.string().min(1, 'BEDROCK_MODEL_ID must be explicitly configured in non-test environments')
  })
  .refine(
    (data) => !(data.NODE_ENV === 'production' && data.ALLOW_DEV_DEMO_AUTH === true),
    {
      message: 'ALLOW_DEV_DEMO_AUTH cannot be enabled in production mode'
    }
  );

let parsedEnv;
try {
  parsedEnv = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI || (isTest ? 'mongodb://localhost:27017/e-waste-passport-test' : undefined),
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    ALLOW_DEV_DEMO_AUTH: process.env.ALLOW_DEV_DEMO_AUTH || 'false',
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    AWS_REGION: process.env.AWS_REGION || (isTest ? 'us-east-1' : undefined),
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || (isTest ? 'e-waste-passport-photos-test' : undefined),
    BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || (isTest ? 'anthropic.claude-3-haiku-20240307-v1:0' : undefined)
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment configuration validation error:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
  }
  throw error;
}

module.exports = parsedEnv;
