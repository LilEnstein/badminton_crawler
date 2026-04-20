import { Email } from "@/domain/user/email.value-object";
import { EmailAlreadyRegisteredError, WeakPasswordError } from "@/domain/user/errors";
import { User } from "@/domain/user/user.entity";

import type { AuthResult } from "./auth-result";
import { issueTokensForUser, type IssueTokensDeps } from "./issue-tokens";
import type { UserRepository } from "./ports";

export interface RegisterUserInput {
  email: string;
  password: string;
}

export interface RegisterUserDeps extends IssueTokensDeps {
  userRepo: UserRepository;
}

export class RegisterUserUseCase {
  constructor(private readonly deps: RegisterUserDeps) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    if (input.password.length < 8) {
      throw new WeakPasswordError();
    }
    const email = Email.create(input.email);

    const existing = await this.deps.userRepo.findByEmail(email.value);
    if (existing) {
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await this.deps.hasher.hash(input.password);
    const now = this.deps.clock.now();
    const user = User.create({
      id: this.deps.ids.generate(),
      email,
      passwordHash,
      googleSub: null,
      createdAt: now,
      lastLoginAt: now
    });
    await this.deps.userRepo.save(user);

    return issueTokensForUser(this.deps, user);
  }
}
