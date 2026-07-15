import type { ReactNode } from "react";

export type DesktopNavItem = {
  id: string;
  label: string;
  module: "home" | "admin" | "crm" | "hr" | "erp" | "pos" | "ims" | "oms" | "scm" | "accounting" | "finance" | "files";
  readOnly?: boolean;
};

export type DesktopShellProps = {
  title?: string;
  userLabel?: string;
  navItems: DesktopNavItem[];
  activeItem: string;
  onNavigate: (item: DesktopNavItem) => void;
  children: ReactNode;
};

export function DesktopShell({
  title = "PRD Software",
  userLabel = "Administrator",
  navItems,
  activeItem,
  onNavigate,
  children,
}: DesktopShellProps) {
  return (
    <div className="desktop-shell" data-app="prd-software">
      <aside className="desktop-shell__sidebar" aria-label="Primary navigation">
        <div className="desktop-shell__brand">{title}</div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeItem ? "nav-item nav-item--active" : "nav-item"}
              aria-current={item.id === activeItem ? "page" : undefined}
              aria-label={item.readOnly ? item.label + " (read only)" : item.label}
              onClick={() => onNavigate(item)}
            >
              <span>{item.label}</span>
              {item.readOnly ? <small>Read only</small> : null}
            </button>
          ))}
        </nav>
      </aside>
      <section className="desktop-shell__workspace">
        <header className="desktop-shell__header">
          <div>
            <p className="desktop-shell__eyebrow">Workspace</p>
            <h1>{navItems.find((item) => item.id === activeItem)?.label ?? "Home"}</h1>
          </div>
          <div className="desktop-shell__actions">
            <button type="button" aria-label="Global search">Search</button>
            <button type="button" aria-label="Notifications">Notifications</button>
            <span className="desktop-shell__user">{userLabel}</span>
          </div>
        </header>
        <main className="desktop-shell__content">{children}</main>
      </section>
    </div>
  );
}
