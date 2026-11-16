import { describe, expect, it } from "vitest";
import { calendarEventPath } from "./analytics";

describe("calendarEventPath", () => {
  it("リンクの種類と刀のIDからパスを作る", () => {
    expect(calendarEventPath("webcal", "heshikiri-hasebe")).toBe("/_events/calendar-webcal/heshikiri-hasebe");
    expect(calendarEventPath("https", "abc")).toBe("/_events/calendar-https/abc");
  });

  it("IDに使えない文字があってもパスが壊れない", () => {
    expect(calendarEventPath("https", "a/b")).toBe("/_events/calendar-https/a%2Fb");
  });
});
