export type SessionStatus = "open" | "closed" | "unknown";
export type SessionType = "looking_for_players" | "court_available";
export type SessionGender = "male" | "female" | "mixed" | "any" | null;
export type SessionShuttleType = "plastic" | "feather" | "any" | null;

export interface SessionLocation {
  district: string | null;
  city: string | null;
  address: string | null;
}

export interface SessionDatetime {
  date: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  isRecurring: boolean;
}

export interface SessionSkillLevel {
  min: number | null;
  max: number | null;
}

export interface SessionBudget {
  amount: number | null;
  currency: string;
  per: "session" | "hour" | null;
  negotiable: boolean;
}

export interface SessionProps {
  id: string;
  rawPostId: string;
  location: SessionLocation;
  datetime: SessionDatetime;
  skillLevel: SessionSkillLevel;
  budget: SessionBudget;
  gender: SessionGender;
  playersNeeded: number | null;
  totalPlayers: number | null;
  shuttleType: SessionShuttleType;
  contact: string | null;
  status: SessionStatus;
  type: SessionType;
  confidence: number;
  needsReview: boolean;
  parsedAt: Date;
}

export class Session {
  private constructor(private props: SessionProps) {}

  static create(props: SessionProps): Session {
    return new Session({ ...props });
  }

  get id(): string { return this.props.id; }
  get rawPostId(): string { return this.props.rawPostId; }
  get location(): SessionLocation { return this.props.location; }
  get datetime(): SessionDatetime { return this.props.datetime; }
  get skillLevel(): SessionSkillLevel { return this.props.skillLevel; }
  get budget(): SessionBudget { return this.props.budget; }
  get gender(): SessionGender { return this.props.gender; }
  get playersNeeded(): number | null { return this.props.playersNeeded; }
  get totalPlayers(): number | null { return this.props.totalPlayers; }
  get shuttleType(): SessionShuttleType { return this.props.shuttleType; }
  get contact(): string | null { return this.props.contact; }
  get status(): SessionStatus { return this.props.status; }
  get type(): SessionType { return this.props.type; }
  get confidence(): number { return this.props.confidence; }
  get needsReview(): boolean { return this.props.needsReview; }
  get parsedAt(): Date { return this.props.parsedAt; }

  toPublic() {
    return {
      id: this.props.id,
      rawPostId: this.props.rawPostId,
      location: this.props.location,
      datetime: this.props.datetime,
      skillLevel: this.props.skillLevel,
      budget: this.props.budget,
      gender: this.props.gender,
      playersNeeded: this.props.playersNeeded,
      totalPlayers: this.props.totalPlayers,
      shuttleType: this.props.shuttleType,
      contact: this.props.contact,
      status: this.props.status,
      type: this.props.type,
      confidence: this.props.confidence,
      needsReview: this.props.needsReview,
      parsedAt: this.props.parsedAt.toISOString()
    };
  }
}
