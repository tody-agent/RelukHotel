import { describe, expect, it } from "vitest";

import {
  APP_API_KEY_PREFIX,
  APP_BUNDLE_IDENTIFIER,
  APP_DATABASE_FILENAME,
  APP_LOGO_ALT,
  APP_NAME,
  APP_RUNTIME_DIR,
  EXPORT_PREFIX,
  ONBOARDING_DRAFT_KEY,
} from "./appIdentity";

describe("appIdentity", () => {
  it("exports the RelukHotel app identity constants", () => {
    expect(APP_NAME).toBe("RelukHotel");
    expect(APP_LOGO_ALT).toBe("RelukHotel logo");
    expect(EXPORT_PREFIX).toBe("RelukHotel");
    expect(ONBOARDING_DRAFT_KEY).toBe("relukhotel-onboarding-draft");
    expect(APP_API_KEY_PREFIX).toBe("reluk_sk_");
    expect(APP_RUNTIME_DIR).toBe("RelukHotel");
    expect(APP_DATABASE_FILENAME).toBe("relukhotel.db");
    expect(APP_BUNDLE_IDENTIFIER).toBe("io.relukhotel.app");
  });
});
