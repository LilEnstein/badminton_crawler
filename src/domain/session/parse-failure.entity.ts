export interface ParseFailureProps {
  id: string;
  rawPostId: string;
  reason: string;
  providerRaw: string;
  failedAt: Date;
}

export class ParseFailure {
  private constructor(private props: ParseFailureProps) {}

  static create(props: ParseFailureProps): ParseFailure {
    return new ParseFailure({ ...props });
  }

  get id(): string { return this.props.id; }
  get rawPostId(): string { return this.props.rawPostId; }
  get reason(): string { return this.props.reason; }
  get providerRaw(): string { return this.props.providerRaw; }
  get failedAt(): Date { return this.props.failedAt; }

  toPublic() {
    return {
      id: this.props.id,
      rawPostId: this.props.rawPostId,
      reason: this.props.reason,
      failedAt: this.props.failedAt.toISOString()
    };
  }
}
