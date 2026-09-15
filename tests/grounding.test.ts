import { describe, expect, it } from "vitest";
import { findUngrounded } from "../lib/grounding";

describe("findUngrounded", () => {
  it("accepts a phone number that appears in the fact sheet", () => {
    const facts = "Call us on 0800 555 0199.";
    const reply = "Please call 0800 555 0199.";

    expect(findUngrounded(reply, facts)).toEqual([]);
  });

  it("flags a phone number that does not appear in the fact sheet", () => {
    const facts = "Call us on 0800 555 0199.";
    const reply = "Please call 0800 555 0123.";

    expect(findUngrounded(reply, facts)).toEqual([
      {
        kind: "phone",
        value: "0800 555 0123",
      },
    ]);
  });

  it("treats £6 and 6 pounds as the same amount", () => {
    const facts = "The fee is 6 pounds per day.";
    const reply = "The fee is £6 per day.";

    expect(findUngrounded(reply, facts)).toEqual([]);
  });

  it("flags times that do not appear in the fact sheet", () => {
    const facts = "Our lines are open from 08:00 to 20:00.";
    const reply = "Our lines are open 07:00 to 22:00.";

    expect(findUngrounded(reply, facts)).toEqual([
      {
        kind: "time",
        value: "07:00",
      },
      {
        kind: "time",
        value: "22:00",
      },
    ]);
  });

  it("handles an empty reply without crashing", () => {
    const facts = "Call us on 0800 555 0199.";
    const reply = "";

    expect(findUngrounded(reply, facts)).toEqual([]);
  });
});