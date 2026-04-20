import { Email } from "@/domain/user/email.value-object";
import { InvalidCredentialsError } from "@/domain/user/errors";

import type { AuthResult } from "./auth-result";
import { issueTokensForUser, type IssueTokensDeps } from "./issue-tokens";
import type { UserRepository } from "./ports";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginDeps extends IssueTokensDeps {
  userRepo: UserRepository;
}

export class LoginWithEmailUseCase {
  constructor(private readonly deps: LoginDeps) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const email = this.tryParseEmail(input.email);
    const user = email ? await this.deps.userRepo.findByEmail(email.value) : null;

    const hashToCheck = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
    const matches = await this.deps.hasher.verify(input.password, hashToCheck);

    if (!user || !user.passwordHash || !matches) {
      throw new InvalidCredentialsError();
    }

    const now = this.deps.clock.now();
    await this.deps.userRepo.touchLastLogin(user.id, now);
    user.markLoggedIn(now);

    return issueTokensForUser(this.deps, user);
  }

  private tryParseEmail(raw: string): Email | null {
    try {
      return Email.create(raw);
    } catch {
      return null;
    }
  }
}
