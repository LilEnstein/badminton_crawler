import jwt, { type JwtPayload } from "jsonwebtoken";

import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenSigner
} from "@/application/auth/ports";

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
}

export class JwtTokenSigner implements TokenSigner {
  readonly accessTtlSeconds: number;
  readonly refreshTtlSeconds: number;

  constructor(private readonly cfg: JwtConfig) {
    this.accessTtlSeconds = cfg.accessTtlSeconds;
    this.refreshTtlSeconds = cfg.refreshTtlSeconds;
  }

  signAccess(payload: AccessTokenPayload): string {
    return jwt.sign({ email: payload.email }, this.cfg.accessSecret, {
      subject: payload.sub,
      expiresIn: this.cfg.accessTtlSeconds,
      algorithm: "HS256"
    });
  }

  signRefresh(payload: RefreshTokenPayload): string {
    return jwt.sign({}, this.cfg.refreshSecret, {
      subject: payload.sub,
      jwtid: payload.jti,
      expiresIn: this.cfg.refreshTtlSeconds,
      algorithm: "HS256"
    });
  }

  verifyAccess(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, this.cfg.accessSecret, { algorithms: ["HS256"] }) as JwtPayload;
    if (!decoded.sub || typeof decoded.email !== "string") {
      throw new Error("Malformed access token");
    }
    return { sub: decoded.sub as string, email: decoded.email };
  }

  verifyRefresh(token: string): RefreshTokenPayload {
    const decoded = jwt.verify(token, this.cfg.refreshSecret, { algorithms: ["HS256"] }) as JwtPayload;
    if (!decoded.sub || !decoded.jti) {
      throw new Error("Malformed refresh token");
    }
    return { sub: decoded.sub as string, jti: decoded.jti };
  }
}
