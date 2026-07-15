import type { ReactNode } from "react";
import { DesktopShell, type DesktopNavItem } from "../components";
import { applyNavigationPermissions, type ModulePermissionMap } from "./navigation-permissions";

export type DesktopWorkspaceFrameProps = {
  navItems: DesktopNavItem[];
  permissions?: ModulePermissionMap;
  activeItem: string;
  onNavigate: (item: DesktopNavItem) => void;
  children: ReactNode;
};

export function DesktopWorkspaceFrame({
  navItems,
  permissions = {},
  activeItem,
  onNavigate,
  children,
}: DesktopWorkspaceFrameProps) {
  const permittedItems = applyNavigationPermissions(navItems, permissions);
  return (
    <DesktopShell
      navItems={permittedItems}
      activeItem={activeItem}
      onNavigate={onNavigate}
    >
      {children}
    </DesktopShell>
  );
}
