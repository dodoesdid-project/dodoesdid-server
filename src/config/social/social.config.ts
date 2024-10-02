import { registerAs } from '@nestjs/config';

export default registerAs('social', () => ({
  kakaoClientId: process.env.SOCIAL_KAKAO_CLIENT_ID,
  googleClientId: process.env.SOCIAL_GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.SOCIAL_GOOGLE_CLIENT_SECRET,
}));
