import type { ReactNode } from "react";
import { DesktopShell, type DesktopNavItem } from "../components";

export type DesktopWorkspaceFrameProps = {
  navItems: DesktopNavItem[];
  activeItem: string;
  onNavigate: (item: DesktopNavItem) => void;
  children: ReactNode;
};

export function DesktopWorkspaceFrame({
  navItems,
  activeItem,
  onNavigate,
  children,
}: DesktopWorkspaceFrameProps) {
  return (
    <DesktopShell
      navItems={navItems}
      activeItem={activeItem}
      onNavigate={onNavigate}
    >
      {children}
    </DesktopShell>
  );
}
