import { describe, expect, it } from "vitest";

import { FacebookGroup } from "./facebook-group.entity";
import { IllegalStatusTransitionError, InvalidGroupUrlError } from "./errors";

const BASE = {
  id: "01J",
  fbGroupId: "123456789",
  name: "Cầu lông Hà Nội",
  url: "https://www.facebook.com/groups/123456789",
  status: "active" as const,
  addedAt: new Date("2024-01-01T00:00:00Z")
};

describe("FacebookGroup", () => {
  it("creates with valid props", () => {
    const group = FacebookGroup.create(BASE);
    expect(group.fbGroupId).toBe("123456789");
    expect(group.status).toBe("active");
  });

  it("throws on invalid URL", () => {
    expect(() => FacebookGroup.create({ ...BASE, url: "not-a-url" })).toThrow(
      InvalidGroupUrlError
    );
  });

  it("throws on empty fbGroupId", () => {
    expect(() => FacebookGroup.create({ ...BASE, fbGroupId: "   " })).toThrow(
      InvalidGroupUrlError
    );
  });

  it("transitions active → paused", () => {
    const group = FacebookGroup.create(BASE);
    group.transitionTo("paused");
    expect(group.status).toBe("paused");
  });

  it("transitions active → no_access", () => {
    const group = FacebookGroup.create(BASE);
    group.transitionTo("no_access");
    expect(group.status).toBe("no_access");
  });

  it("throws IllegalStatusTransitionError on active → active (same-status transition)", () => {
    const group = FacebookGroup.create(BASE);
    expect(() => group.transitionTo("active")).toThrow(IllegalStatusTransitionError);
  });

  it("toPublic returns ISO addedAt", () => {
    const group = FacebookGroup.create(BASE);
    expect(group.toPublic().addedAt).toBe("2024-01-01T00:00:00.000Z");
  });
});
