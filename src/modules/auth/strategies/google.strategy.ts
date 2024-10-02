import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(protected configService: ConfigService) {
    super({
      clientID: configService.get<string>('social.googleClientId'),
      clientSecret: configService.get<string>('social.googleClientSecret'),
      callbackURL: `${configService.get<string>('app.url')}/api/v1/auth/google-sign-in/redirect`,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const fullName = name.familyName
      ? `${name.givenName} ${name.familyName}`
      : name.givenName;

    const user = {
      id: id,
      email: emails[0].value,
      name: fullName,
      accessToken,
      refreshToken,
      thumbnail: photos[0].value,
    };
    done(null, user);
  }
}
