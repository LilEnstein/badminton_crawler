import { DomainError } from "@/domain/user/errors";

export class InvalidParserOutputError extends DomainError {
  constructor(detail: string) {
    super("INVALID_PARSER_OUTPUT", `Parser returned invalid output: ${detail}`);
  }
}

export class ProviderUnavailableError extends DomainError {
  constructor(provider: string) {
    super("PROVIDER_UNAVAILABLE", `AI provider unavailable: ${provider}`);
  }
}

export class SessionNotFoundError extends DomainError {
  constructor(id: string) {
    super("SESSION_NOT_FOUND", `Session not found: ${id}`);
  }
}
