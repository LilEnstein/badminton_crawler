import { InvalidBotError } from "./errors";

export type BotStatus = "active" | "needs_refresh" | "banned";

export interface FacebookBotProps {
  id: string;
  label: string;
  cookieEncrypted: string;
  status: BotStatus;
  lastUsedAt: Date | null;
}

export class FacebookBot {
  private constructor(private props: FacebookBotProps) {}

  static create(props: FacebookBotProps): FacebookBot {
    if (!props.cookieEncrypted.trim()) {
      throw new InvalidBotError("cookieEncrypted must not be empty");
    }
    if (!props.label.trim()) {
      throw new InvalidBotError("label must not be empty");
    }
    return new FacebookBot({ ...props });
  }

  get id(): string { return this.props.id; }
  get label(): string { return this.props.label; }
  get cookieEncrypted(): string { return this.props.cookieEncrypted; }
  get status(): BotStatus { return this.props.status; }
  get lastUsedAt(): Date | null { return this.props.lastUsedAt; }

  markNeedsRefresh(): void { this.props.status = "needs_refresh"; }
  markBanned(): void { this.props.status = "banned"; }
  markActive(): void { this.props.status = "active"; }
  markUsed(at: Date): void { this.props.lastUsedAt = at; }

  toPublic() {
    return {
      id: this.props.id,
      label: this.props.label,
      status: this.props.status,
      lastUsedAt: this.props.lastUsedAt?.toISOString() ?? null
    };
  }
}
