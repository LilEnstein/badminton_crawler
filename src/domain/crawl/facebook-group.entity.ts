import { IllegalStatusTransitionError, InvalidGroupUrlError } from "./errors";

export type GroupStatus = "active" | "paused" | "no_access";

const LEGAL_TRANSITIONS: Record<GroupStatus, GroupStatus[]> = {
  active: ["paused", "no_access"],
  paused: ["active", "no_access"],
  no_access: ["active", "paused"]
};

export interface FacebookGroupProps {
  id: string;
  fbGroupId: string;
  name: string;
  url: string;
  status: GroupStatus;
  addedAt: Date;
}

export class FacebookGroup {
  private constructor(private props: FacebookGroupProps) {
    this.props = { ...props };
  }

  static create(props: FacebookGroupProps): FacebookGroup {
    if (!props.fbGroupId.trim()) {
      throw new InvalidGroupUrlError(props.fbGroupId);
    }
    try {
      new URL(props.url);
    } catch {
      throw new InvalidGroupUrlError(props.url);
    }
    return new FacebookGroup(props);
  }

  get id(): string {
    return this.props.id;
  }

  get fbGroupId(): string {
    return this.props.fbGroupId;
  }

  get name(): string {
    return this.props.name;
  }

  get url(): string {
    return this.props.url;
  }

  get status(): GroupStatus {
    return this.props.status;
  }

  get addedAt(): Date {
    return this.props.addedAt;
  }

  transitionTo(next: GroupStatus): void {
    const allowed = LEGAL_TRANSITIONS[this.props.status];
    if (!allowed.includes(next)) {
      throw new IllegalStatusTransitionError(this.props.status, next);
    }
    this.props.status = next;
  }

  toPublic() {
    return {
      id: this.props.id,
      fbGroupId: this.props.fbGroupId,
      name: this.props.name,
      url: this.props.url,
      status: this.props.status,
      addedAt: this.props.addedAt.toISOString()
    };
  }
}
