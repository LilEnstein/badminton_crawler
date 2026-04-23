import { DomainError } from "@/domain/user/errors";

export class GroupNotFoundError extends DomainError {
  constructor() {
    super("GROUP_NOT_FOUND", "Facebook group not found");
  }
}

export class GroupAccessError extends DomainError {
  constructor(url: string) {
    super("GROUP_ACCESS_DENIED", `Bot cannot access group: ${url}`);
  }
}

export class DuplicateGroupError extends DomainError {
  constructor(fbGroupId: string) {
    super("DUPLICATE_GROUP", `Group already exists: ${fbGroupId}`);
  }
}

export class InvalidGroupUrlError extends DomainError {
  constructor(url: string) {
    super("INVALID_GROUP_URL", `Not a valid URL: ${url}`);
  }
}

export class IllegalStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super("ILLEGAL_STATUS_TRANSITION", `Cannot transition from ${from} to ${to}`);
  }
}

export class LoginWallError extends DomainError {
  readonly detail: string | null;
  constructor(detail: string | null = null) {
    super(
      "LOGIN_WALL",
      detail
        ? `Facebook redirected to login — bot session needs refresh (${detail})`
        : "Facebook redirected to login — bot session needs refresh"
    );
    this.detail = detail;
  }
}

export class BotBannedError extends DomainError {
  constructor(botId: string) {
    super("BOT_BANNED", `Bot ${botId} appears to be banned`);
  }
}

export class DomChangedError extends DomainError {
  constructor(detail: string) {
    super("DOM_CHANGED", `Facebook DOM structure changed: ${detail}`);
  }
}

export class BotNotFoundError extends DomainError {
  constructor() {
    super("BOT_NOT_FOUND", "No active bot session found");
  }
}

export class RawPostNotFoundError extends DomainError {
  constructor(id: string) {
    super("RAW_POST_NOT_FOUND", `Raw post not found: ${id}`);
  }
}

export class InvalidRawPostError extends DomainError {
  constructor(detail: string) {
    super("INVALID_RAW_POST", detail);
  }
}

export class InvalidBotError extends DomainError {
  constructor(detail: string) {
    super("INVALID_BOT", detail);
  }
}
