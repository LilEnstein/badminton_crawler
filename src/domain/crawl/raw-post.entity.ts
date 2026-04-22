import { InvalidRawPostError } from "./errors";

export type ParseStatus = "pending" | "parsed" | "failed";

export interface RawPostProps {
  id: string;
  fbPostId: string;
  groupId: string;
  authorName: string;
  text: string;
  postedAt: Date;
  fetchedAt: Date;
  parseStatus: ParseStatus;
}

export class RawPost {
  private constructor(private props: RawPostProps) {}

  static create(props: RawPostProps): RawPost {
    if (!props.fbPostId.trim()) throw new InvalidRawPostError("fbPostId must not be empty");
    if (!props.text.trim()) throw new InvalidRawPostError("text must not be empty");
    return new RawPost({ ...props });
  }

  get id(): string { return this.props.id; }
  get fbPostId(): string { return this.props.fbPostId; }
  get groupId(): string { return this.props.groupId; }
  get authorName(): string { return this.props.authorName; }
  get text(): string { return this.props.text; }
  get postedAt(): Date { return this.props.postedAt; }
  get fetchedAt(): Date { return this.props.fetchedAt; }
  get parseStatus(): ParseStatus { return this.props.parseStatus; }

  markParsed(): void { this.props.parseStatus = "parsed"; }
  markFailed(): void { this.props.parseStatus = "failed"; }

  toPublic() {
    return {
      id: this.props.id,
      fbPostId: this.props.fbPostId,
      groupId: this.props.groupId,
      authorName: this.props.authorName,
      text: this.props.text,
      postedAt: this.props.postedAt.toISOString(),
      fetchedAt: this.props.fetchedAt.toISOString(),
      parseStatus: this.props.parseStatus
    };
  }
}
