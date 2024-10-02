import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATA_BASE_URL,
}));
