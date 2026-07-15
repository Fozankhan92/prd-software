import { useState } from "react";
import { DesktopShell, type DesktopNavItem } from "../components";
import { desktopNavigation } from "./module-navigation";

export function DesktopApp() {
  const [activeItem, setActiveItem] = useState("home");
  const active = desktopNavigation.find((item) => item.id === activeItem);

  return (
    <DesktopShell
      navItems={desktopNavigation}
      activeItem={activeItem}
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
