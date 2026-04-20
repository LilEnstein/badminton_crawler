export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidEmailError extends DomainError {
  constructor(value: string) {
    super("INVALID_EMAIL", `Email is not valid: ${value}`);
  }
}

export class WeakPasswordError extends DomainError {
  constructor() {
    super("WEAK_PASSWORD", "Password must be at least 8 characters");
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("INVALID_CREDENTIALS", "Invalid email or password");
  }
}

export class EmailAlreadyRegisteredError extends DomainError {
  constructor() {
    super("EMAIL_ALREADY_REGISTERED", "An account with this email already exists");
  }
}

export class TokenReuseError extends DomainError {
  constructor() {
    super("TOKEN_REUSE_DETECTED", "Refresh token reuse detected; session revoked");
  }
}

export class TokenInvalidError extends DomainError {
  constructor() {
    super("TOKEN_INVALID", "Refresh token is invalid or expired");
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super("USER_NOT_FOUND", "User not found");
  }
}
