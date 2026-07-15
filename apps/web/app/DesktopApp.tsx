import { createElement, useMemo, useState } from "react";
import { DesktopShell, type DesktopNavItem } from "../components";
import { desktopNavigation } from "./module-navigation";
import { applyNavigationPermissions, type ModulePermissionMap } from "./navigation-permissions";

export type DesktopAppProps = { permissions?: ModulePermissionMap };

const moduleContent: Record<string, { eyebrow: string; title: string; summary: string; actions: string[]; metrics?: string[] }> = {
  home: { eyebrow: "Executive workspace", title: "Operations overview", summary: "Monitor organization-wide activity, approvals, and exceptions.", actions: ["View summary", "Open approvals"] },
  admin: { eyebrow: "Control center", title: "Administration", summary: "Manage users, roles, permissions, sessions, and audit history.", actions: ["Manage users", "Review permissions", "Open audit log"] },
  crm: { eyebrow: "Customer operations", title: "CRM workbench", summary: "Manage organizations, contacts, leads, opportunities, and customer activity.", actions: ["New contact", "Open pipeline", "View activities"], metrics: ["Contacts", "Open opportunities", "Tasks due", "Recent activity"] },
  hr: { eyebrow: "People operations", title: "HR workbench", summary: "Manage employees, departments, attendance, leave, payroll inputs, and documents.", actions: ["Add employee", "Open directory", "Review approvals"], metrics: ["Employees", "Departments", "Leave requests", "Pending approvals"] },
  erp: { eyebrow: "Core operations", title: "ERP / Inventory workbench", summary: "Coordinate items, suppliers, purchasing, receiving, and stock controls.", actions: ["New item", "Create purchase order", "View stock"], metrics: ["Items", "Suppliers", "Open purchase orders", "Inventory alerts"] },
  pos: { eyebrow: "Retail operations", title: "POS workbench", summary: "Open registers, process sales, returns, payments, and end-of-day closing.", actions: ["Open register", "New sale", "Close register"] },
  ims: { eyebrow: "Inventory control", title: "IMS workbench", summary: "Track locations, lots, serials, transfers, adjustments, and inventory counts.", actions: ["Stock count", "Transfer stock", "View alerts"] },
  oms: { eyebrow: "Order operations", title: "OMS workbench", summary: "Manage order capture, fulfillment, returns, cancellations, and customer status.", actions: ["New order", "Open fulfillment", "View returns"] },
  scm: { eyebrow: "Supply network", title: "SCM workbench", summary: "Track suppliers, shipments, lead times, receiving, and delivery exceptions.", actions: ["New shipment", "Track delivery", "View exceptions"], metrics: ["In-transit shipments", "On-time delivery", "Supplier exceptions", "Lead-time risk"] },
  accounting: { eyebrow: "Financial operations", title: "Accounting workbench", summary: "Manage chart of accounts, journals, imprest, narration, reconciliations, and closing.", actions: ["New journal", "Open imprest", "Run reconciliation"], metrics: ["Unposted journals", "Imprest balance", "Reconciliation exceptions", "Close readiness"] },
  finance: { eyebrow: "Financial planning", title: "Finance workbench", summary: "Review budgets, cash flow, payables, receivables, forecasts, and controls.", actions: ["New budget", "View cash flow", "Open forecast"] },
  files: { eyebrow: "Controlled cloud files", title: "Files / Cloud workbench", summary: "Share and organize files with layered access, versioning, and audit history.", actions: ["Upload file", "Create folder", "Review access"] },
};

export function DesktopApp({ permissions = {} }: DesktopAppProps) {
  const [activeItem, setActiveItem] = useState("home");
  const visibleNavigation = useMemo(() => applyNavigationPermissions(desktopNavigation, permissions), [permissions]);
  const active = visibleNavigation.find((item) => item.id === activeItem) ?? visibleNavigation[0];
  const content = moduleContent[active?.id ?? "home"] ?? moduleContent.home;
  const metrics = content.metrics ? createElement("div", { className: "desktop-workbench__metrics", "aria-label": content.title + " summary" }, content.metrics.map((metric) => createElement("article", { key: metric }, createElement("strong", null, "—"), createElement("span", null, metric)))) : null;
  const actions = createElement("div", { className: "desktop-workbench__actions", "aria-label": content.title + " actions" }, content.actions.map((action) => createElement("button", { type: "button", key: action }, action)));
  const section = createElement("section", { "aria-labelledby": "workspace-heading" }, createElement("p", { className: "desktop-shell__eyebrow" }, content.eyebrow), createElement("h2", { id: "workspace-heading" }, content.title), createElement("p", null, content.summary), metrics, actions);
  return createElement(DesktopShell, { navItems: visibleNavigation, activeItem: active?.id ?? "home", onNavigate: (item: DesktopNavItem) => setActiveItem(item.id), children: section }, section);
}
