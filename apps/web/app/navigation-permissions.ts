import type { DesktopNavItem } from "../components";

export type ModulePermission = {
  visible: boolean;
  canEdit: boolean;
};

export type ModulePermissionMap = Partial<Record<DesktopNavItem["module"], ModulePermission>>;

export function applyNavigationPermissions(
  items: DesktopNavItem[],
  permissions: ModulePermissionMap,
): DesktopNavItem[] {
  return items
    .filter((item) => permissions[item.module]?.visible !== false)
    .map((item) => ({
      ...item,
      readOnly: permissions[item.module]?.canEdit === false,
    }));
}
