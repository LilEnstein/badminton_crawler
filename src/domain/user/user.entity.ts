import { Email } from "./email.value-object";

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string | null;
  googleSub: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export class User {
  private constructor(private props: UserProps) {
    if (!props.passwordHash && !props.googleSub) {
      throw new Error("User must have at least one of passwordHash or googleSub");
    }
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string | null {
    return this.props.passwordHash;
  }

  get googleSub(): string | null {
    return this.props.googleSub;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }

  markLoggedIn(at: Date): void {
    this.props.lastLoginAt = at;
  }

  toPublic(): { id: string; email: string; createdAt: string } {
    return {
      id: this.props.id,
      email: this.props.email.value,
      createdAt: this.props.createdAt.toISOString()
    };
  }
}
