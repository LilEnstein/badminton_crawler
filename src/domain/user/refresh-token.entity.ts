export interface RefreshTokenProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBy: string | null;
  createdAt: Date;
}

export class RefreshToken {
  private constructor(private props: RefreshTokenProps) {}

  static create(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get tokenHash(): string {
    return this.props.tokenHash;
  }
  get expiresAt(): Date {
    return this.props.expiresAt;
  }
  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }
  get replacedBy(): string | null {
    return this.props.replacedBy;
  }

  isActive(now: Date): boolean {
    return !this.props.revokedAt && this.props.expiresAt.getTime() > now.getTime();
  }

  isRevoked(): boolean {
    return this.props.revokedAt !== null;
  }

  revoke(at: Date, replacedBy: string | null = null): void {
    this.props.revokedAt = at;
    this.props.replacedBy = replacedBy;
  }
}
