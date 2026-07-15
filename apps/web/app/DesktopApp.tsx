import { createElement, useMemo, useState } from "react";
import { DesktopShell, type DesktopNavItem } from "../components";
import { desktopNavigation } from "./module-navigation";
import { applyNavigationPermissions, type ModulePermissionMap } from "./navigation-permissions";

export type DesktopAppProps = { permissions?: ModulePermissionMap };

const moduleContent: Record<string, { eyebrow: string; title: string; summary: string; actions: string[]; metrics?: string[] }> = {
  home: { eyebrow: "Executive workspace", title: "Operations overview", summary: "Monitor organization-wide activity, approvals, and exceptions.", actions: ["View summary", "Open approvals"], metrics: ["Pending approvals", "Open exceptions", "Active modules", "Organization health"] },
  admin: { eyebrow: "Control center", title: "Administration", summary: "Manage users, roles, permissions, sessions, and audit history.", actions: ["Manage users", "Review permissions", "Open audit log"], metrics: ["Active users", "Pending permissions", "Open sessions", "Audit events"] },
  crm: { eyebrow: "Customer operations", title: "CRM workbench", summary: "Manage accounts, contacts, leads, opportunities, activities, quotes, service cases, campaigns, and customer history.", actions: ["New contact", "Capture lead", "Open pipeline", "Create quote", "Log activity", "Open service cases", "View reports"], metrics: ["Accounts", "Contacts", "Open leads", "Pipeline value", "Tasks due", "Open cases", "Quote conversion", "Recent activity"] },
  hr: { eyebrow: "People operations", title: "HR workbench", summary: "Manage employees, departments, attendance, leave, payroll inputs, and documents.", actions: ["Add employee", "Open directory", "Review approvals"], metrics: ["Employees", "Departments", "Leave requests", "Pending approvals"] },
  erp: { eyebrow: "Core operations", title: "ERP / Inventory workbench", summary: "Coordinate items, suppliers, purchasing, receiving, and stock controls.", actions: ["New item", "Create purchase order", "View stock"], metrics: ["Items", "Suppliers", "Open purchase orders", "Inventory alerts"] },
  pos: { eyebrow: "Retail operations", title: "POS workbench", summary: "Open registers, process sales, returns, payments, and end-of-day closing.", actions: ["Open register", "New sale", "Close register"], metrics: ["Open registers", "Sales today", "Returns pending", "Cash variance"] },
  ims: { eyebrow: "Inventory control", title: "IMS workbench", summary: "Track locations, lots, serials, transfers, adjustments, and inventory counts.", actions: ["Stock count", "Transfer stock", "View alerts"], metrics: ["Tracked locations", "Low-stock items", "Open transfers", "Count variance"] },
  oms: { eyebrow: "Order operations", title: "OMS workbench", summary: "Manage order capture, fulfillment, returns, cancellations, and customer status.", actions: ["New order", "Open fulfillment", "View returns"] },
  scm: { eyebrow: "Supply network", title: "SCM workbench", summary: "Track suppliers, shipments, lead times, receiving, and delivery exceptions.", actions: ["New shipment", "Track delivery", "View exceptions"], metrics: ["In-transit shipments", "On-time delivery", "Supplier exceptions", "Lead-time risk"] },
  accounting: { eyebrow: "Financial operations", title: "Accounting workbench", summary: "Manage chart of accounts, journals, imprest, narration, reconciliations, and closing.", actions: ["New journal", "Open imprest", "Run reconciliation"], metrics: ["Unposted journals", "Imprest balance", "Reconciliation exceptions", "Close readiness"] },
  finance: { eyebrow: "Financial planning", title: "Finance workbench", summary: "Review budgets, cash flow, payables, receivables, forecasts, and controls.", actions: ["New budget", "View cash flow", "Open forecast"], metrics: ["Budget variance", "Available cash", "Overdue receivables", "Forecast confidence"] },
  files: { eyebrow: "Controlled cloud files", title: "Files / Cloud workbench", summary: "Share and organize files with layered access, versioning, and audit history.", actions: ["Upload file", "Create folder", "Review access"], metrics: ["Shared files", "Pending access reviews", "Recent versions", "Storage health"] },
};

export function DesktopApp({ permissions = {} }: DesktopAppProps) {
  const [activeItem, setActiveItem] = useState("home");
  const [notice, setNotice] = useState<string | null>(null);
  const [crmName, setCrmName] = useState("");
  const [crmEmail, setCrmEmail] = useState("");
  const [crmOrganization, setCrmOrganization] = useState("");
  const [crmOpportunity, setCrmOpportunity] = useState("");
  const [crmStage, setCrmStage] = useState("Qualification");
  const [crmProbability, setCrmProbability] = useState("25");
  const [crmCloseDate, setCrmCloseDate] = useState("");
  const visibleNavigation = useMemo(() => applyNavigationPermissions(desktopNavigation, permissions), [permissions]);
  const active = visibleNavigation.find((item) => item.id === activeItem) ?? visibleNavigation[0];
  const content = moduleContent[active?.id ?? "home"] ?? moduleContent.home;
  const metrics = content.metrics ? createElement("div", { className: "desktop-workbench__metrics", "aria-label": content.title + " summary" }, content.metrics.map((metric) => createElement("article", { key: metric }, createElement("strong", null, "—"), createElement("span", null, metric)))) : null;
  const actions = createElement("div", { className: "desktop-workbench__actions", "aria-label": content.title + " actions" }, content.actions.map((action) => createElement("button", { type: "button", key: action, onClick: () => setNotice(action + " workflow ready") }, action)));
  const crmPanel = active?.id === "crm" ? createElement("div", { className: "desktop-workbench__form", "aria-label": "New CRM contact" }, createElement("h3", null, "New contact"), createElement("input", { value: crmName, placeholder: "Contact name", onChange: (event: { target: { value: string } }) => setCrmName(event.target.value) }), createElement("input", { value: crmOrganization, placeholder: "Organization (optional)", onChange: (event: { target: { value: string } }) => setCrmOrganization(event.target.value) }), createElement("input", { value: crmEmail, placeholder: "Email (optional)", type: "email", onChange: (event: { target: { value: string } }) => setCrmEmail(event.target.value) }), createElement("button", { type: "button", onClick: () => setNotice(crmName.trim() ? "Contact draft ready" : "Enter a contact name") }, "Save contact draft")) : null;
  const pipelinePanel = active?.id === "crm" ? createElement("div", { className: "desktop-workbench__form", "aria-label": "New CRM opportunity" }, createElement("h3", null, "New opportunity"), createElement("input", { value: crmOpportunity, placeholder: "Opportunity name", onChange: (event: { target: { value: string } }) => setCrmOpportunity(event.target.value) }), createElement("select", { value: crmStage, onChange: (event: { target: { value: string } }) => setCrmStage(event.target.value) }, ["Qualification", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => createElement("option", { key: stage, value: stage }, stage))), createElement("input", { value: crmProbability, type: "number", min: "0", max: "100", placeholder: "Probability %", onChange: (event: { target: { value: string } }) => setCrmProbability(event.target.value) }), createElement("input", { value: crmCloseDate, type: "date", onChange: (event: { target: { value: string } }) => setCrmCloseDate(event.target.value) }), createElement("button", { type: "button", onClick: () => setNotice(crmOpportunity.trim() ? "Opportunity draft ready" : "Enter an opportunity name") }, "Save opportunity draft")) : null;
  const section = createElement("section", { "aria-labelledby": "workspace-heading" }, createElement("p", { className: "desktop-shell__eyebrow" }, content.eyebrow), createElement("h2", { id: "workspace-heading" }, content.title), createElement("p", null, content.summary), metrics, actions, crmPanel, pipelinePanel, notice ? createElement("p", { role: "status", className: "desktop-workbench__notice" }, notice) : null);
  return createElement(DesktopShell, { navItems: visibleNavigation, activeItem: active?.id ?? "home", onNavigate: (item: DesktopNavItem) => setActiveItem(item.id), children: section }, section);
}
