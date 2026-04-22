import { describe, expect, it } from "vitest";

import { InvalidRawPostError } from "@/domain/crawl/errors";
import { RawPost } from "./raw-post.entity";

const BASE = {
  id: "01HTEST",
  fbPostId: "123456",
  groupId: "group-1",
  authorName: "Nguyễn A",
  text: "Tìm người chơi cầu lông tối nay",
  postedAt: new Date("2024-06-01T12:00:00Z"),
  fetchedAt: new Date("2024-06-01T12:05:00Z"),
  parseStatus: "pending" as const
};

describe("RawPost", () => {
  it("creates with valid props", () => {
    const post = RawPost.create(BASE);
    expect(post.fbPostId).toBe("123456");
    expect(post.parseStatus).toBe("pending");
  });

  it("throws InvalidRawPostError for empty fbPostId", () => {
    expect(() => RawPost.create({ ...BASE, fbPostId: "  " })).toThrow(InvalidRawPostError);
  });

  it("throws InvalidRawPostError for empty text", () => {
    expect(() => RawPost.create({ ...BASE, text: "" })).toThrow(InvalidRawPostError);
  });

  it("markParsed transitions to parsed", () => {
    const post = RawPost.create(BASE);
    post.markParsed();
    expect(post.parseStatus).toBe("parsed");
  });

  it("markFailed transitions to failed", () => {
    const post = RawPost.create(BASE);
    post.markFailed();
    expect(post.parseStatus).toBe("failed");
  });

  it("toPublic returns ISO dates", () => {
    const post = RawPost.create(BASE);
    const pub = post.toPublic();
    expect(pub.postedAt).toBe("2024-06-01T12:00:00.000Z");
    expect(pub.fetchedAt).toBe("2024-06-01T12:05:00.000Z");
  });
});
