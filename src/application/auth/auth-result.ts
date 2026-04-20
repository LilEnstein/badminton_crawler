export interface AuthResult {
  user: { id: string; email: string; createdAt: string };
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}
