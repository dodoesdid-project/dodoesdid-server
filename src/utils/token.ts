import { Response } from 'express';

export const setTokensCookie = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) => {
  setAccessTokenCookie(res, tokens.accessToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
};

export const setAccessTokenCookie = (res: Response, accessToken: string) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 1000 * 60 * 60,
  });
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
};

export const resetTokensCookie = (res: Response) => {
  res.cookie('access_token', '', {
    httpOnly: true,
    maxAge: 0,
  });
  res.cookie('refresh_token', '', {
    httpOnly: true,
    maxAge: 0,
  });
};
