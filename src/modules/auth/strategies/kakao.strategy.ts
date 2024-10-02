import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

// import { contract } from '@tvrestaurant/contracts';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(protected configService: ConfigService) {
    super({
      clientID: configService.get<string>('social.kakaoClientId'),
      callbackURL: `${configService.get<string>('app.url')}/api/v1/auth/kakao-sign-in/redirect`,
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    const user = {
      id: profileJson.id.toString(),
      name: kakao_account.profile.nickname,
      email:
        kakao_account?.has_email && !kakao_account.email_needs_agreement
          ? kakao_account.email
          : null,
      accessToken,
      refreshToken,
      thumbnail: kakao_account.profile.thumbnail_image_url,
    };
    done(null, user);
  }
}
