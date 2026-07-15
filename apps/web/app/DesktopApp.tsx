import { useMemo, useState } from "react";
import { DesktopShell, type DesktopNavItem } from "../components";
import { desktopNavigation } from "./module-navigation";
import { applyNavigationPermissions, type ModulePermissionMap } from "./navigation-permissions";

export type DesktopAppProps = {
  permissions?: ModulePermissionMap;
};

export function DesktopApp({ permissions = {} }: DesktopAppProps) {
  const [activeItem, setActiveItem] = useState("home");
  const visibleNavigation = useMemo(
    () => applyNavigationPermissions(desktopNavigation, permissions),
    [permissions],
  );
  const active = visibleNavigation.find((item) => item.id === activeItem) ?? visibleNavigation[0];

  return (
    <DesktopShell
      navItems={visibleNavigation}
      activeItem={active?.id ?? "home"}
      onNavigate={(item: DesktopNavItem) => setActiveItem(item.id)}
    >
      <section aria-labelledby="workspace-heading">
        <p className="desktop-shell__eyebrow">Native desktop workspace</p>
        <h2 id="workspace-heading">{active?.label ?? "Home"}</h2>
        <p>Select a module from the navigation to open its workbench.</p>
      </section>
    </DesktopShell>
  );
}
