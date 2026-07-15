import { describe, expect, it } from "vitest";
import { desktopNavigation } from "./module-navigation";
import { applyNavigationPermissions } from "./navigation-permissions";

describe("applyNavigationPermissions", () => {
  it("hides modules without visibility permission", () => {
    const result = applyNavigationPermissions(desktopNavigation, {
      crm: { visible: false, canEdit: false },
    });
    expect(result.some((item) => item.module === "crm")).toBe(false);
  });

  it("marks visible modules read-only without edit permission", () => {
    const result = applyNavigationPermissions(desktopNavigation, {
      finance: { visible: true, canEdit: false },
    });
    expect(result.find((item) => item.module === "finance")?.readOnly).toBe(true);
  });

  it("preserves editable access when granted", () => {
    const result = applyNavigationPermissions(desktopNavigation, {
      accounting: { visible: true, canEdit: true },
    });
    expect(result.find((item) => item.module === "accounting")?.readOnly).toBe(false);
  });
});
