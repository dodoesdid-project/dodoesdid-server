import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('local', 'development', 'production').required(),
  APP_HOST: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  APP_URL: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  EMAIL_HOST: Joi.string().required(),
  EMAIL_USER: Joi.string().required(),
  EMAIL_SECRET: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  SOCIAL_KAKAO_CLIENT_ID: Joi.string().required(),
  SOCIAL_GOOGLE_CLIENT_ID: Joi.string().required(),
  SOCIAL_GOOGLE_CLIENT_SECRET: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),
  AWS_S3_ACCESS_KEY: Joi.string().required(),
  AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
});

export default validationSchema;
