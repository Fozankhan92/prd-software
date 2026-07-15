import { useState } from "react";
import { DesktopShell, type DesktopNavItem } from "../components";

const navigation: DesktopNavItem[] = [
  { id: "home", label: "Home", module: "home" },
  { id: "admin", label: "Administration", module: "admin" },
  { id: "crm", label: "CRM", module: "crm" },
  { id: "hr", label: "HR", module: "hr" },
  { id: "erp", label: "ERP / Inventory", module: "erp" },
  { id: "pos", label: "POS", module: "pos" },
  { id: "ims", label: "IMS", module: "ims" },
  { id: "oms", label: "OMS", module: "oms" },
  { id: "scm", label: "SCM", module: "scm" },
  { id: "accounting", label: "Accounting", module: "accounting" },
  { id: "finance", label: "Finance", module: "finance" },
  { id: "files", label: "Files / Cloud", module: "files" },
];

export function DesktopApp() {
  const [activeItem, setActiveItem] = useState("home");
  const active = navigation.find((item) => item.id === activeItem);

  return (
    <DesktopShell
      navItems={navigation}
      activeItem={activeItem}
      onNavigate={(item) => setActiveItem(item.id)}
    >
      <section aria-labelledby="workspace-heading">
        <p className="desktop-shell__eyebrow">Native desktop workspace</p>
        <h2 id="workspace-heading">{active?.label ?? "Home"}</h2>
        <p>Select a module from the navigation to open its workbench.</p>
      </section>
    </DesktopShell>
  );
}
