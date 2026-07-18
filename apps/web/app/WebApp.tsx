import { useMemo, useState } from 'react';
import { desktopNavigation } from './module-navigation';
import { createTenantId, createWebApproval, createWebCampaignMember, createWebFile, createWebLineItem, createWebPortalShare, createWebRecord, exportWorkspace, grantWebPermission, loadWebWorkspace, openWebSession, saveWebWorkspace, type WebCrmRecord, type WebWorkspaceState } from './web-store';
import './web-app.css';

type ModuleId = (typeof desktopNavigation)[number]['id'];

const moduleDescriptions: Record<ModuleId, string> = {
  home: 'A live summary of your organization, approvals, and exceptions.',
  admin: 'Users, roles, permissions, sessions, and audit history.',
  crm: 'Accounts, contacts, leads, opportunities, activities, quotes, and cases.',
  hr: 'Employees, departments, attendance, leave, and people records.',
  erp: 'Products, suppliers, purchasing, receiving, and operational controls.',
  pos: 'Registers, sales, returns, payments, and end-of-day closing.',
  ims: 'Locations, stock, lots, serials, transfers, and inventory counts.',
  oms: 'Orders, fulfillment, returns, cancellations, and customer status.',
  scm: 'Suppliers, shipments, lead times, receiving, and delivery exceptions.',
  accounting: 'Accounts, journals, imprest, narration, reconciliation, and closing.',
  finance: 'Budgets, cash flow, payables, receivables, and forecasts.',
  files: 'Controlled files, versions, sharing, and permission-aware access.',
};

const recordLabels: Record<WebCrmRecord['kind'], string> = {
  lead: 'Lead', prospect: 'Prospect', customer: 'Customer', organization: 'Organization', contact: 'Contact', opportunity: 'Opportunity', pipeline: 'Pipeline', 'sales-stage': 'Sales stage', activity: 'Activity', call: 'Call', meeting: 'Meeting', task: 'Task', note: 'Note', 'follow-up': 'Follow-up', quotation: 'Quotation', 'sales-order': 'Sales order', contract: 'Contract', renewal: 'Renewal', 'service-case': 'Customer service case', complaint: 'Complaint', campaign: 'Campaign', 'marketing-source': 'Marketing source', territory: 'Territory', 'sales-team': 'Sales team', commission: 'Commission', 'credit-limit': 'Customer credit limit', 'customer-statement': 'Customer statement',
};

function expandedRecordRows(record: WebCrmRecord): Array<{ label: string; value: string }> {
  const parts = record.detail.split(' · ').map((part) => part.trim()).filter(Boolean);
  const rows = parts.map((part) => {
    const separator = part.indexOf(':');
    return separator > 0
      ? { label: part.slice(0, separator).trim(), value: part.slice(separator + 1).trim() }
      : { label: 'Details', value: part };
  });
  return [
    { label: 'Record type', value: recordLabels[record.kind] },
    { label: 'Status / stage', value: record.status },
    ...rows,
    { label: 'Created', value: new Date(record.createdAt).toLocaleString() },
  ];
}

const crmViews = [
  ['overview', 'Overview'], ['sales', 'Sales'], ['activities', 'Activities'], ['service', 'Service'], ['marketing', 'Marketing'], ['controls', 'CRM controls'], ['automation', 'Automation'],
] as const;

const crmViewKinds: Record<(typeof crmViews)[number][0], WebCrmRecord['kind'][]> = {
  overview: Object.keys(recordLabels) as WebCrmRecord['kind'][],
  sales: ['lead', 'prospect', 'customer', 'organization', 'contact', 'opportunity', 'pipeline', 'sales-stage', 'quotation', 'sales-order', 'contract', 'renewal', 'commission', 'credit-limit', 'customer-statement'],
  activities: ['activity', 'call', 'meeting', 'task', 'note', 'follow-up'],
  service: ['service-case', 'complaint'],
  marketing: ['campaign', 'marketing-source'],
  controls: ['territory', 'sales-team'],
  automation: [],
};

type RecordField = { key: string; label: string; placeholder: string; type?: 'text' | 'number' | 'date' | 'email'; required?: boolean };
type RecordFormConfig = { nameLabel: string; namePlaceholder: string; fields: RecordField[]; statuses: string[] };
const recordFormConfigs: Record<WebCrmRecord['kind'], RecordFormConfig> = {
  lead: { nameLabel: 'Lead name', namePlaceholder: 'Person or company lead', fields: [{ key: 'source', label: 'Lead source', placeholder: 'Referral, website, event...' }, { key: 'qualification', label: 'Qualification notes', placeholder: 'Need, budget, timeline...' }], statuses: ['New', 'Working', 'Qualified', 'Unqualified', 'Converted'] },
  prospect: { nameLabel: 'Prospect name', namePlaceholder: 'Prospective customer', fields: [{ key: 'segment', label: 'Market segment', placeholder: 'Enterprise, SMB, public sector...' }, { key: 'score', label: 'Prospect score', placeholder: '0-100', type: 'number' }], statuses: ['New', 'Engaged', 'Qualified', 'Nurture', 'Converted'] },
  customer: { nameLabel: 'Customer name', namePlaceholder: 'Customer account', fields: [{ key: 'industry', label: 'Industry', placeholder: 'Industry' }, { key: 'creditTerms', label: 'Credit terms', placeholder: 'Cash, Net 30, Net 60...' }], statuses: ['Active', 'On hold', 'Inactive'] },
  organization: { nameLabel: 'Organization name', namePlaceholder: 'Legal or trading name', fields: [{ key: 'taxId', label: 'Tax identifier', placeholder: 'Tax/VAT registration' }, { key: 'billingAddress', label: 'Billing address', placeholder: 'Full billing address' }], statuses: ['Active', 'Prospect', 'Inactive'] },
  contact: { nameLabel: 'Contact name', namePlaceholder: 'First and last name', fields: [{ key: 'email', label: 'Email', placeholder: 'Optional email', type: 'email' }, { key: 'phone', label: 'Phone', placeholder: 'Phone or messaging number' }, { key: 'title', label: 'Job title', placeholder: 'Decision maker, buyer...' }], statuses: ['Active', 'Do not contact', 'Inactive'] },
  opportunity: { nameLabel: 'Opportunity name', namePlaceholder: 'Opportunity title', fields: [{ key: 'amount', label: 'Expected value', placeholder: 'Amount', type: 'number', required: true }, { key: 'probability', label: 'Probability %', placeholder: '0-100', type: 'number', required: true }, { key: 'closeDate', label: 'Expected close date', placeholder: '', type: 'date', required: true }], statuses: ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'] },
  pipeline: { nameLabel: 'Pipeline name', namePlaceholder: 'Sales pipeline', fields: [{ key: 'forecast', label: 'Forecast category', placeholder: 'Pipeline, best case, commit...' }], statuses: ['Active', 'Paused', 'Archived'] },
  'sales-stage': { nameLabel: 'Stage name', namePlaceholder: 'Sales stage', fields: [{ key: 'probability', label: 'Default probability %', placeholder: '0-100', type: 'number' }, { key: 'sequence', label: 'Stage order', placeholder: '1, 2, 3...', type: 'number' }], statuses: ['Active', 'Inactive'] },
  activity: { nameLabel: 'Activity subject', namePlaceholder: 'Activity subject', fields: [{ key: 'assignedTo', label: 'Assigned to', placeholder: 'User or team' }, { key: 'dueDate', label: 'Due date', placeholder: '', type: 'date', required: true }], statuses: ['Open', 'Completed', 'Cancelled'] },
  call: { nameLabel: 'Call subject', namePlaceholder: 'Call subject', fields: [{ key: 'phone', label: 'Phone number', placeholder: 'Phone number' }, { key: 'scheduledAt', label: 'Scheduled date', placeholder: '', type: 'date', required: true }], statuses: ['Planned', 'Completed', 'No answer', 'Cancelled'] },
  meeting: { nameLabel: 'Meeting subject', namePlaceholder: 'Meeting subject', fields: [{ key: 'attendees', label: 'Attendees', placeholder: 'Names or teams' }, { key: 'meetingDate', label: 'Meeting date', placeholder: '', type: 'date', required: true }], statuses: ['Planned', 'Completed', 'Cancelled'] },
  task: { nameLabel: 'Task title', namePlaceholder: 'Task title', fields: [{ key: 'assignedTo', label: 'Assigned to', placeholder: 'Owner' }, { key: 'dueDate', label: 'Due date', placeholder: '', type: 'date', required: true }], statuses: ['Open', 'In progress', 'Completed', 'Cancelled'] },
  note: { nameLabel: 'Note title', namePlaceholder: 'Note title', fields: [{ key: 'noteText', label: 'Note content', placeholder: 'Detailed note' }], statuses: ['Draft', 'Published'] },
  'follow-up': { nameLabel: 'Follow-up subject', namePlaceholder: 'Follow-up subject', fields: [{ key: 'followUpDate', label: 'Follow-up date', placeholder: '', type: 'date', required: true }, { key: 'owner', label: 'Owner', placeholder: 'User or team' }], statuses: ['Open', 'Completed', 'Overdue'] },
  quotation: { nameLabel: 'Quotation number or name', namePlaceholder: 'Quote reference', fields: [{ key: 'amount', label: 'Quote total', placeholder: 'Amount', type: 'number', required: true }, { key: 'validUntil', label: 'Valid until', placeholder: '', type: 'date', required: true }, { key: 'discount', label: 'Discount', placeholder: 'Discount amount or %' }], statuses: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'] },
  'sales-order': { nameLabel: 'Sales order number', namePlaceholder: 'Order reference', fields: [{ key: 'amount', label: 'Order total', placeholder: 'Amount', type: 'number', required: true }, { key: 'deliveryDate', label: 'Requested delivery date', placeholder: '', type: 'date' }, { key: 'paymentTerms', label: 'Payment terms', placeholder: 'Terms' }], statuses: ['Draft', 'Confirmed', 'Fulfilling', 'Fulfilled', 'Cancelled'] },
  contract: { nameLabel: 'Contract name', namePlaceholder: 'Contract reference', fields: [{ key: 'startDate', label: 'Start date', placeholder: '', type: 'date', required: true }, { key: 'endDate', label: 'End date', placeholder: '', type: 'date' }, { key: 'amount', label: 'Contract value', placeholder: 'Amount', type: 'number' }], statuses: ['Draft', 'Active', 'Expired', 'Terminated'] },
  renewal: { nameLabel: 'Renewal name', namePlaceholder: 'Renewal reference', fields: [{ key: 'renewalDate', label: 'Renewal date', placeholder: '', type: 'date', required: true }, { key: 'owner', label: 'Renewal owner', placeholder: 'Owner' }], statuses: ['Upcoming', 'In negotiation', 'Renewed', 'Lost'] },
  'service-case': { nameLabel: 'Case subject', namePlaceholder: 'Customer issue', fields: [{ key: 'priority', label: 'Priority', placeholder: 'Low, normal, high, urgent' }, { key: 'sla', label: 'SLA target', placeholder: 'Response/resolution target' }, { key: 'queue', label: 'Service queue', placeholder: 'Queue or owner' }, { key: 'knowledgeBase', label: 'Knowledge-base article', placeholder: 'Article ID or link' }, { key: 'escalationAt', label: 'Escalation threshold', placeholder: 'Minutes before escalation', type: 'number' }, { key: 'rootCause', label: 'Root cause', placeholder: 'Root cause or contributing factor' }, { key: 'csat', label: 'CSAT score', placeholder: '1-5', type: 'number' }, { key: 'nps', label: 'NPS score', placeholder: '-100 to 100', type: 'number' }, { key: 'portalShare', label: 'Customer portal sharing', placeholder: 'Internal only or customer-visible' }], statuses: ['New', 'Assigned', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed', 'Escalated', 'Reopened'] },
  complaint: { nameLabel: 'Complaint subject', namePlaceholder: 'Complaint subject', fields: [{ key: 'category', label: 'Complaint category', placeholder: 'Product, service, billing...' }, { key: 'investigationOwner', label: 'Investigation owner', placeholder: 'Responsible investigator' }, { key: 'rootCause', label: 'Root-cause analysis', placeholder: 'Findings' }, { key: 'correctiveAction', label: 'Corrective action', placeholder: 'Action plan' }, { key: 'resolution', label: 'Resolution plan', placeholder: 'Resolution details' }, { key: 'portalShare', label: 'Customer portal sharing', placeholder: 'Internal only or customer-visible' }], statuses: ['New', 'Investigating', 'Management Review', 'Resolved', 'Closed'] },
  campaign: { nameLabel: 'Campaign name', namePlaceholder: 'Campaign name', fields: [{ key: 'channel', label: 'Channel', placeholder: 'Email, event, advertising...' }, { key: 'audience', label: 'Target audience / segment', placeholder: 'Segment or dynamic list' }, { key: 'source', label: 'Marketing source', placeholder: 'Website, referral, event...' }, { key: 'members', label: 'Campaign members', placeholder: 'Contacts, leads, or organizations' }, { key: 'attribution', label: 'Attribution model', placeholder: 'First touch, last touch, multi-touch' }, { key: 'budget', label: 'Campaign cost', placeholder: 'Cost amount', type: 'number' }, { key: 'expectedLeads', label: 'Expected leads', placeholder: 'Number', type: 'number' }, { key: 'generatedLeads', label: 'Generated leads', placeholder: 'Number', type: 'number' }, { key: 'responses', label: 'Responses', placeholder: 'Number', type: 'number' }, { key: 'attributedRevenue', label: 'Attributed revenue', placeholder: 'Revenue amount', type: 'number' }, { key: 'startDate', label: 'Start date', placeholder: '', type: 'date' }], statuses: ['Draft', 'Planned', 'Active', 'Completed', 'Cancelled'] },
  'marketing-source': { nameLabel: 'Marketing source', namePlaceholder: 'Source name', fields: [{ key: 'channel', label: 'Channel', placeholder: 'Website, referral, event...' }, { key: 'cost', label: 'Acquisition cost', placeholder: 'Amount', type: 'number' }], statuses: ['Active', 'Inactive'] },
  territory: { nameLabel: 'Territory name', namePlaceholder: 'Region or territory', fields: [{ key: 'region', label: 'Region', placeholder: 'Geography or segment' }, { key: 'manager', label: 'Territory manager', placeholder: 'Manager' }], statuses: ['Active', 'Inactive'] },
  'sales-team': { nameLabel: 'Sales team name', namePlaceholder: 'Team name', fields: [{ key: 'manager', label: 'Team manager', placeholder: 'Manager' }, { key: 'target', label: 'Sales target', placeholder: 'Target amount', type: 'number' }], statuses: ['Active', 'Inactive'] },
  commission: { nameLabel: 'Commission plan', namePlaceholder: 'Plan or commission record', fields: [{ key: 'rate', label: 'Commission rate %', placeholder: 'Rate', type: 'number' }, { key: 'payableDate', label: 'Payable date', placeholder: '', type: 'date' }], statuses: ['Draft', 'Approved', 'Payable', 'Paid'] },
  'credit-limit': { nameLabel: 'Customer credit limit', namePlaceholder: 'Customer or account', fields: [{ key: 'limit', label: 'Credit limit', placeholder: 'Amount', type: 'number', required: true }, { key: 'terms', label: 'Credit terms', placeholder: 'Net 30, Net 60...' }], statuses: ['Pending approval', 'Approved', 'Suspended', 'Expired'] },
  'customer-statement': { nameLabel: 'Customer statement', namePlaceholder: 'Customer or statement reference', fields: [{ key: 'period', label: 'Statement period', placeholder: 'Month or date range' }, { key: 'balance', label: 'Closing balance', placeholder: 'Amount', type: 'number' }, { key: 'dueDate', label: 'Due date', placeholder: '', type: 'date' }], statuses: ['Open', 'Partially paid', 'Paid', 'Overdue'] },
};

export function WebApp() {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [workspace, setWorkspace] = useState<WebWorkspaceState>(() => loadWebWorkspace());
  const [recordKind, setRecordKind] = useState<WebCrmRecord['kind']>('contact');
  const [recordName, setRecordName] = useState('');
  const [recordDetail, setRecordDetail] = useState('');
  const [recordStatus, setRecordStatus] = useState('New');
  const [crmView, setCrmView] = useState<(typeof crmViews)[number][0]>('overview');
  const [recordRelationship, setRecordRelationship] = useState('');
  const [recordOwner, setRecordOwner] = useState('');
  const [recordAmount, setRecordAmount] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordPriority, setRecordPriority] = useState('Normal');
  const [recordFields, setRecordFields] = useState<Record<string, string>>({});
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customer360Query, setCustomer360Query] = useState('');
  const [customer360Status, setCustomer360Status] = useState('All statuses');
  const [lineItemDescription, setLineItemDescription] = useState('');
  const [lineItemQuantity, setLineItemQuantity] = useState('1');
  const [lineItemPrice, setLineItemPrice] = useState('0');
  const [draftLineItems, setDraftLineItems] = useState<Array<{ description: string; quantity: number; unitPrice: number }>>([]);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customStageName, setCustomStageName] = useState('');
  const [permissionSubject, setPermissionSubject] = useState('');
  const [permissionResource, setPermissionResource] = useState('');
  const [permissionEdit, setPermissionEdit] = useState(false);
  const [message, setMessage] = useState('');

  const crmRecords = useMemo(() => workspace.records, [workspace.records]);
  const activeRecordConfig = recordFormConfigs[recordKind];
  const crmViewRecords = useMemo(() => {
    return crmRecords.filter((record) => crmViewKinds[crmView].includes(record.kind));
  }, [crmRecords, crmView]);
  const selectedCustomer = workspace.records.find((record) => record.id === selectedCustomerId);
  const customer360Records = useMemo(() => {
    const customerName = selectedCustomer?.name ?? '';
    const query = customer360Query.trim().toLowerCase();
    return workspace.records.filter((record) => {
      const related = record.id === selectedCustomerId || (customerName && record.detail.toLowerCase().includes(customerName.toLowerCase()));
      const matchesQuery = !query || `${record.name} ${record.detail} ${recordLabels[record.kind]}`.toLowerCase().includes(query);
      const matchesStatus = customer360Status === 'All statuses' || record.status === customer360Status;
      return related && matchesQuery && matchesStatus;
    });
  }, [workspace.records, selectedCustomerId, selectedCustomer?.name, customer360Query, customer360Status]);
  const weightedPipeline = useMemo(() => crmRecords.filter((record) => record.kind === 'opportunity').reduce((total, record) => total + Number(record.detail.match(/Weighted value: ([\d.]+)/)?.[1] ?? 0), 0), [crmRecords]);
  const creditSummary = useMemo(() => {
    const limit = crmRecords.filter((record) => record.kind === 'credit-limit' && record.status === 'Approved').reduce((total, record) => total + Number(record.detail.match(/Credit limit: ([\d.]+)/)?.[1] ?? 0), 0);
    const statements = crmRecords.filter((record) => record.kind === 'customer-statement').reduce((total, record) => total + Number(record.detail.match(/Closing balance: ([\d.]+)/)?.[1] ?? 0), 0);
    const orders = crmRecords.filter((record) => record.kind === 'sales-order' && !['Fulfilled', 'Cancelled'].includes(record.status)).reduce((total, record) => total + Number(record.detail.match(/Order total: ([\d.]+)/)?.[1] ?? 0), 0);
    return { limit, exposure: statements + orders, available: limit - statements - orders };
  }, [crmRecords]);
  const renewalAlerts = useMemo(() => crmRecords.filter((record) => record.kind === 'contract' && record.status === 'Active').filter((record) => {
    const endDate = record.detail.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1];
    if (!endDate) return false;
    const days = (new Date(`${endDate}T00:00:00`).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 90;
  }), [crmRecords]);
  const serviceMetrics = useMemo(() => ({
    open: crmRecords.filter((record) => record.kind === 'service-case' && !['Resolved', 'Closed'].includes(record.status)).length,
    escalated: crmRecords.filter((record) => record.kind === 'service-case' && record.status === 'Escalated').length,
    scored: crmRecords.filter((record) => record.kind === 'service-case' && /(?:CSAT score|NPS score):/.test(record.detail)).length,
  }), [crmRecords]);
  const campaignMetrics = useMemo(() => {
    const campaigns = crmRecords.filter((record) => record.kind === 'campaign');
    const revenue = campaigns.reduce((sum, record) => sum + Number(record.detail.match(/Attributed revenue: ([\d.]+)/)?.[1] ?? 0), 0);
    const cost = campaigns.reduce((sum, record) => sum + Number(record.detail.match(/Campaign cost: ([\d.]+)/)?.[1] ?? 0), 0);
    return { count: campaigns.length, revenue, cost, roi: cost ? ((revenue - cost) / cost) * 100 : 0, members: workspace.campaignMembers.length };
  }, [crmRecords, workspace.campaignMembers.length]);
  const portalShareCount = workspace.portalShares.length;
  const saveWorkspace = (next: WebWorkspaceState, successMessage: string) => {
    setWorkspace(next);
    saveWebWorkspace(next);
    setMessage(successMessage);
  };
  function exportCrmCsv() {
    if (typeof document === 'undefined') return;
    const rows = [['Type', 'Name', 'Status', 'Details', 'Created'], ...crmViewRecords.map((record) => [recordLabels[record.kind], record.name, record.status, record.detail, record.createdAt])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `crm-${crmView}-records.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage('CRM records exported to CSV.');
  }

  function finishSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace.organization.trim() || !workspace.adminName.trim()) {
      setMessage('Organization and administrator name are required. Email can be added later.');
      return;
    }
    const next = { ...workspace, tenantId: workspace.tenantId || createTenantId(), session: workspace.session || openWebSession(workspace.tenantId || 'local-tenant', workspace.adminName) };
    saveWorkspace(next, 'Workspace setup saved and session opened.');
  }

  function addRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recordName.trim()) {
      setMessage(`${recordLabels[recordKind]} name is required.`);
      return;
    }
    if (recordKind === 'sales-order' && workspace.records.some((record) => record.kind === 'credit-limit' && record.status === 'Suspended')) {
      setMessage('Sales order blocked: an active customer credit hold requires finance approval.');
      return;
    }
    const duplicate = workspace.records.some((record) => record.kind === recordKind && record.name.trim().toLowerCase() === recordName.trim().toLowerCase());
    if (duplicate) {
      setMessage(`Possible duplicate detected: this ${recordLabels[recordKind].toLowerCase()} already exists.`);
      return;
    }
    const missingField = activeRecordConfig.fields.find((field) => field.required && !recordFields[field.key]?.trim());
    if (missingField) {
      setMessage(`${missingField.label} is required for ${recordLabels[recordKind]}.`);
      return;
    }
    if (recordKind === 'opportunity') {
      const probability = Number(recordFields.probability);
      if (probability < 0 || probability > 100) {
        setMessage('Probability must be between 0 and 100%.');
        return;
      }
    }
    if (recordKind === 'quotation') {
      const discountMatch = recordFields.discount?.match(/[0-9]+(?:\.[0-9]+)?/);
      const discount = discountMatch ? Number(discountMatch[0]) : 0;
      if (discount > 15 && recordStatus === 'Accepted') {
        setMessage('Discounts above 15% require sales director and finance approval before acceptance.');
        return;
      }
      if (discount > 5 && recordStatus === 'Accepted') {
        setMessage('Discounts above 5% require sales manager approval before acceptance.');
        return;
      }
    }
    const dynamicDetails = Object.entries(recordFields).filter(([, value]) => value.trim()).map(([key, value]) => `${activeRecordConfig.fields.find((field) => field.key === key)?.label ?? key}: ${value}`);
    const weightedValue = recordKind === 'opportunity' ? `Weighted value: ${(Number(recordFields.amount) * Number(recordFields.probability) / 100).toFixed(2)}` : '';
    const slaMinutes = recordPriority === 'Urgent' ? 30 : recordPriority === 'High' ? 120 : recordPriority === 'Low' ? 480 : 240;
    const slaTarget = recordKind === 'service-case' ? `SLA response target: ${slaMinutes} minutes · SLA deadline: ${new Date(Date.now() + slaMinutes * 60000).toISOString()}` : '';
    const campaignCost = recordKind === 'campaign' ? Number(recordFields.budget ?? 0) : 0;
    const campaignRevenue = recordKind === 'campaign' ? Number(recordFields.attributedRevenue ?? 0) : 0;
    const campaignRoi = recordKind === 'campaign' && campaignCost > 0 ? `Campaign ROI: ${((campaignRevenue - campaignCost) / campaignCost * 100).toFixed(2)}%` : '';
    const portalShare = (recordKind === 'service-case' || recordKind === 'complaint' || recordKind === 'campaign') && recordFields.portalShare ? `Portal sharing: ${recordFields.portalShare}` : '';
    const detailParts = [recordDetail.trim(), ...dynamicDetails, weightedValue, slaTarget, campaignRoi, portalShare, recordRelationship.trim() ? `Related to: ${recordRelationship.trim()}` : '', recordOwner.trim() ? `Owner: ${recordOwner.trim()}` : '', recordAmount.trim() ? `Amount: ${recordAmount.trim()}` : '', recordDate ? `Date: ${recordDate}` : '', crmView === 'service' ? `Priority: ${recordPriority}` : ''].filter(Boolean);
    const detail = [...detailParts, draftLineItems.length ? `Line items: ${draftLineItems.map((item) => `${item.description} x${item.quantity} @ ${item.unitPrice}`).join('; ')}` : ''].filter(Boolean).join(' · ');
    const newRecord = createWebRecord(recordKind, recordName.trim(), detail, recordStatus);
    const approvalKinds: WebCrmRecord['kind'][] = ['quotation', 'sales-order', 'contract', 'credit-limit'];
    const discount = recordKind === 'quotation' ? Number(recordFields.discount?.replace('%', '') || 0) : 0;
    const quotationApproval = recordKind === 'quotation' && discount > 15 ? 'Director and finance approval required' : recordKind === 'quotation' && discount > 5 ? 'Sales manager approval required' : '';
    const approvalAction = quotationApproval || `Review ${recordLabels[recordKind].toLowerCase()}`;
    const shareAudience = recordFields.portalShare?.trim();
    const portalShares = shareAudience && ['service-case', 'complaint'].includes(recordKind) ? [createWebPortalShare(newRecord.id, shareAudience), ...workspace.portalShares] : workspace.portalShares;
    const campaignMembers = recordKind === 'campaign' && recordFields.members?.trim() ? recordFields.members.split(',').map((member) => createWebCampaignMember(newRecord.id, member.trim(), recordFields.source)).filter((member) => member.subject) : [];
    const next = { ...workspace, records: [newRecord, ...workspace.records], lineItems: [...workspace.lineItems, ...draftLineItems.map((item) => createWebLineItem(newRecord.id, item.description, item.quantity, item.unitPrice))], approvals: approvalKinds.includes(recordKind) && (recordKind !== 'quotation' || discount > 5) ? [createWebApproval(newRecord.id, recordLabels[recordKind], approvalAction), ...workspace.approvals] : workspace.approvals, portalShares, campaignMembers: [...campaignMembers, ...workspace.campaignMembers] };
    saveWorkspace(next, `${recordLabels[recordKind]} added to the web workspace.`);
    setRecordName('');
    setRecordDetail('');
    setRecordRelationship('');
    setRecordOwner('');
    setRecordAmount('');
    setRecordDate('');
    setRecordPriority('Normal');
    setRecordFields({});
    setDraftLineItems([]);
    setLineItemDescription('');
    setLineItemQuantity('1');
    setLineItemPrice('0');
  }

  function addDraftLineItem() {
    const quantity = Number(lineItemQuantity);
    const unitPrice = Number(lineItemPrice);
    if (!lineItemDescription.trim() || quantity <= 0 || unitPrice < 0) {
      setMessage('Enter a line description, positive quantity, and valid price.');
      return;
    }
    setDraftLineItems([...draftLineItems, { description: lineItemDescription.trim(), quantity, unitPrice }]);
    setLineItemDescription('');
    setLineItemQuantity('1');
    setLineItemPrice('0');
  }

  function changeRecordKind(kind: WebCrmRecord['kind']) {
    setRecordKind(kind);
    setRecordFields({});
    setRecordStatus(recordFormConfigs[kind].statuses[0]);
  }

  function changeCrmView(view: (typeof crmViews)[number][0]) {
    setCrmView(view);
    if (crmViewKinds[view][0]) changeRecordKind(crmViewKinds[view][0]);
  }

  function convertLead(leadId: string) {
    const lead = workspace.records.find((record) => record.id === leadId && record.kind === 'lead');
    if (!lead) return;
    const alreadyConverted = workspace.records.some((record) => record.kind === 'organization' && record.detail.includes(`Converted from lead: ${lead.id}`));
    if (alreadyConverted) {
      setMessage('This lead has already been converted.');
      return;
    }
    const organization = createWebRecord('organization', lead.name, `Converted from lead: ${lead.id} · ${lead.detail}`, 'Active');
    const contact = createWebRecord('contact', lead.name, `Converted from lead: ${lead.id} · Related to: ${organization.name}`, 'Active');
    const opportunity = createWebRecord('opportunity', `${lead.name} opportunity`, `Converted from lead: ${lead.id} · Related to: ${organization.name}`, 'Qualification');
    const convertedLead = { ...lead, status: 'Converted', detail: `${lead.detail} · Converted to organization, contact, and opportunity.` };
    saveWorkspace({ ...workspace, records: [organization, contact, opportunity, ...workspace.records.map((record) => record.id === leadId ? convertedLead : record)] }, 'Lead converted into organization, contact, and opportunity.');
  }

  function deleteRecord(recordId: string) {
    const record = workspace.records.find((item) => item.id === recordId);
    if (!record) return;
    if (!window.confirm(`Delete this ${recordLabels[record.kind].toLowerCase()}?`)) return;
    saveWorkspace({ ...workspace, records: workspace.records.filter((item) => item.id !== recordId) }, `${recordLabels[record.kind]} deleted.`);
  }

  function setApprovalStatus(approvalId: string, status: 'Approved' | 'Rejected') {
    const approval = workspace.approvals.find((item) => item.id === approvalId);
    if (!approval) return;
    saveWorkspace({ ...workspace, approvals: workspace.approvals.map((item) => item.id === approvalId ? { ...item, status, history: [...(item.history ?? []), { status, at: new Date().toISOString() }] } : item) }, `Approval ${status.toLowerCase()}.`);
  }

  function convertQuotation(quotationId: string) {
    const quotation = workspace.records.find((record) => record.id === quotationId && record.kind === 'quotation');
    if (!quotation || quotation.status !== 'Accepted') {
      setMessage('Only an accepted quotation can be converted to a sales order.');
      return;
    }
    if (workspace.records.some((record) => record.kind === 'sales-order' && record.detail.includes(`Converted from quotation: ${quotation.id}`))) {
      setMessage('This quotation has already been converted.');
      return;
    }
    const order = createWebRecord('sales-order', `Order from ${quotation.name}`, `Converted from quotation: ${quotation.id} · ${quotation.detail}`, 'Confirmed');
    saveWorkspace({ ...workspace, records: [order, ...workspace.records] }, 'Accepted quotation converted to sales order.');
  }

  function createRenewal(contractId: string) {
    const contract = workspace.records.find((record) => record.id === contractId && record.kind === 'contract');
    if (!contract) return;
    const endDate = contract.detail.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1];
    const preparationDate = endDate ? new Date(`${endDate}T00:00:00`) : null;
    if (preparationDate) preparationDate.setDate(preparationDate.getDate() - 90);
    const renewal = createWebRecord('renewal', `Renewal for ${contract.name}`, `Created from contract: ${contract.id} · ${contract.detail}${preparationDate ? ` · Renewal preparation date: ${preparationDate.toISOString().slice(0, 10)}` : ' · Renewal preparation lead time: 90 days'}`, 'Upcoming');
    saveWorkspace({ ...workspace, records: [renewal, ...workspace.records] }, 'Renewal opportunity created from contract.');
  }

  function addCustomField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customFieldName.trim() || workspace.customFields.includes(customFieldName.trim())) return setMessage('Enter a new custom field name.');
    saveWorkspace({ ...workspace, customFields: [...workspace.customFields, customFieldName.trim()] }, 'Custom CRM field added.');
    setCustomFieldName('');
  }

  function addCustomStage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customStageName.trim() || workspace.customPipelineStages.includes(customStageName.trim())) return setMessage('Enter a new custom pipeline stage.');
    saveWorkspace({ ...workspace, customPipelineStages: [...workspace.customPipelineStages, customStageName.trim()] }, 'Custom pipeline stage added.');
    setCustomStageName('');
  }

  function deleteCustomField(field: string) {
    saveWorkspace({ ...workspace, customFields: workspace.customFields.filter((item) => item !== field) }, 'Custom CRM field deleted.');
  }

  function deleteCustomStage(stage: string) {
    saveWorkspace({ ...workspace, customPipelineStages: workspace.customPipelineStages.filter((item) => item !== stage) }, 'Custom pipeline stage deleted.');
  }

  function addPermission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!permissionSubject.trim() || !permissionResource.trim()) {
      setMessage('User or group and resource are required.');
      return;
    }
    saveWorkspace({ ...workspace, permissions: [grantWebPermission(permissionSubject.trim(), permissionResource.trim(), permissionEdit), ...workspace.permissions] }, permissionEdit ? 'Read and edit permission granted.' : 'Read-only permission granted.');
    setPermissionSubject('');
    setPermissionResource('');
  }

  function addFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    saveWorkspace({ ...workspace, files: [createWebFile(file), ...workspace.files] }, `${file.name} added to file metadata. Cloud storage adapter is ready.`);
    event.target.value = '';
  }

  return (
    <div className="web-app">
      <aside className="web-app__sidebar">
        <div className="web-app__brand"><span className="web-app__brand-mark">P</span><span>PRD Software</span></div>
        <p className="web-app__sidebar-label">Workspace</p>
        <nav aria-label="Primary navigation">
          {desktopNavigation.map((item) => (
            <button key={item.id} className={item.id === activeModule ? 'web-nav web-nav--active' : 'web-nav'} onClick={() => { setActiveModule(item.id); setMessage(''); }} type="button">
              <span className="web-nav__icon">{item.label.slice(0, 1)}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="web-app__sidebar-footer"><span className="web-status-dot" /> Web workspace<br /><small>{workspace.session ? 'Session active' : 'Setup required'}</small></div>
      </aside>
      <main className="web-app__main">
        <header className="web-app__header">
          <div><p className="web-app__eyebrow">{workspace.organization || 'Your organization'}</p><h1>{desktopNavigation.find((item) => item.id === activeModule)?.label}</h1></div>
          <div className="web-app__header-actions"><button type="button" className="web-button web-button--quiet">Search</button><button type="button" className="web-button web-button--quiet">Notifications</button><span className="web-avatar">{workspace.adminName ? workspace.adminName.slice(0, 1).toUpperCase() : 'A'}</span></div>
        </header>
        <section className="web-app__content">
          <div className="web-app__intro"><div><p className="web-app__eyebrow">{activeModule === 'crm' ? 'Customer operations' : 'Business workspace'}</p><h2>{activeModule === 'home' ? 'Good morning' : `${desktopNavigation.find((item) => item.id === activeModule)?.label} workspace`}</h2><p>{moduleDescriptions[activeModule]}</p></div><span className="web-pill">MCP boundary · no AI tools</span></div>

          {activeModule === 'home' ? <>
            <div className="web-metrics"><article><span>CRM records</span><strong>{crmRecords.length}</strong><small>Accounts, contacts, leads, opportunities</small></article><article><span>Active modules</span><strong>12</strong><small>Connected business areas</small></article><article><span>Permission model</span><strong>2-layer</strong><small>Read and edit are separate</small></article><article><span>Data mode</span><strong>Web</strong><small>Ready for managed cloud database</small></article></div>
            <div className="web-grid web-grid--two"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Getting started</p><h3>Set up your workspace</h3></div><span className="web-card__step">1 of 3</span></div><form className="web-form" onSubmit={finishSetup}><label>Organization name<input value={workspace.organization} onChange={(event) => setWorkspace({ ...workspace, organization: event.target.value })} placeholder="e.g. Fozan Trading Co." /></label><label>Administrator name<input value={workspace.adminName} onChange={(event) => setWorkspace({ ...workspace, adminName: event.target.value })} placeholder="Your name" /></label><button className="web-button web-button--primary" type="submit">Save workspace setup</button></form></section><section className="web-card"><p className="web-app__eyebrow">Next layers</p><h3>Connected services</h3><ul className="web-checklist"><li><span>✓</span> Tenant-aware data service</li><li><span>✓</span> Session and permission boundary</li><li><span>✓</span> JSON backup/export now</li><li><span>✓</span> PostgreSQL and cloud storage ready</li></ul><button className="web-button web-button--secondary" type="button" onClick={() => exportWorkspace(workspace)}>Download backup</button></section></div>

          </> : null}

          {activeModule === 'crm' ? <>
            <div className="web-subnav" aria-label="CRM sections">{crmViews.map(([value, label]) => <button type="button" key={value} className={crmView === value ? 'web-subnav__item web-subnav__item--active' : 'web-subnav__item'} onClick={() => changeCrmView(value)}>{label}</button>)}</div>
            {crmView === 'automation' ? <section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Phase 4 automation</p><h3>Workflow operations</h3><p className="web-card__description">Rules are tenant-scoped and execute through the server automation boundary. Configure and monitor workflow rules here as the production scheduler is connected.</p></div><span className="web-card__hint">Backend ready</span></div><div className="web-crm-overview__grid"><article><span>Workflow engine</span><strong>Ready</strong><small>Event triggers and conditions</small></article><article><span>Lead scoring</span><strong>Ready</strong><small>Signals and qualification thresholds</small></article><article><span>Automatic assignment</span><strong>Ready</strong><small>Priority routing by team or territory</small></article><article><span>Forecasting</span><strong>Ready</strong><small>Weighted pipeline calculations</small></article><article><span>Commissions</span><strong>Ready</strong><small>Rates, tiers, and splits</small></article><article><span>Advanced analytics</span><strong>Ready</strong><small>Conversion, win rate, and campaign ROI</small></article></div><div className="web-grid web-grid--two"><div className="web-card"><h3>Next configuration</h3><p className="web-card__description">Rule editor, execution history, retries, and approval thresholds will be connected to the persistent automation repository.</p><button className="web-button web-button--primary" type="button" onClick={() => setMessage('Automation rule editor is queued for the next Phase 4 increment.')}>Configure workflow rule</button></div><div className="web-card"><h3>Permission boundary</h3><p className="web-card__description">Automation actions respect the same tenant, record, field, and portal permissions as manual actions.</p><span className="web-pill">Permission-aware</span></div></div></section> : null}
            {crmView !== 'controls' && crmView !== 'overview' && crmView !== 'automation' ? <div className="web-grid web-grid--crm"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">{crmViews.find(([value]) => value === crmView)?.[1]} data entry</p><h3>{activeRecordConfig.nameLabel}</h3></div><span className="web-card__hint">Fields change for {recordLabels[recordKind]}</span></div><form className="web-form" onSubmit={addRecord}><label>Record type<select value={recordKind} onChange={(event) => changeRecordKind(event.target.value as WebCrmRecord['kind'])}>{crmViewKinds[crmView].map((kind) => <option value={kind} key={kind}>{recordLabels[kind]}</option>)}</select></label><label>{activeRecordConfig.nameLabel}<input required value={recordName} onChange={(event) => setRecordName(event.target.value)} placeholder={activeRecordConfig.namePlaceholder} /></label><label>{crmView === 'service' ? 'Case complaint and details' : crmView === 'marketing' ? 'Audience and campaign details' : 'Additional notes'}<input value={recordDetail} onChange={(event) => setRecordDetail(event.target.value)} placeholder="Enter detailed information" /></label>{(recordKind === 'quotation' || recordKind === 'sales-order') ? <div className="web-line-items"><p className="web-form__section-title">Line items</p><div className="web-line-item-entry"><input value={lineItemDescription} onChange={(event) => setLineItemDescription(event.target.value)} placeholder="Product or service" /><input value={lineItemQuantity} onChange={(event) => setLineItemQuantity(event.target.value)} type="number" min="1" placeholder="Qty" /><input value={lineItemPrice} onChange={(event) => setLineItemPrice(event.target.value)} type="number" min="0" placeholder="Unit price" /><button className="web-button web-button--secondary" type="button" onClick={addDraftLineItem}>Add line</button></div>{draftLineItems.map((item, index) => <small className="web-line-item" key={index}>{item.description} · {item.quantity} × {item.unitPrice} = {item.quantity * item.unitPrice}</small>)}</div> : null}{activeRecordConfig.fields.map((field) => <label key={field.key}>{field.label}<input required={field.required} type={field.type ?? 'text'} value={recordFields[field.key] ?? ''} onChange={(event) => setRecordFields({ ...recordFields, [field.key]: event.target.value })} placeholder={field.placeholder} /></label>)}<label>Owner or team<input value={recordOwner} onChange={(event) => setRecordOwner(event.target.value)} placeholder="Assign an owner or team" /></label>{(crmView === 'sales' || crmView === 'activities') ? <label>Follow-up date<input type="date" value={recordDate} onChange={(event) => setRecordDate(event.target.value)} /></label> : null}{crmView === 'service' ? <label>Priority<select value={recordPriority} onChange={(event) => setRecordPriority(event.target.value)}><option>Normal</option><option>Low</option><option>High</option><option>Urgent</option></select></label> : null}<label>Related record<input value={recordRelationship} onChange={(event) => setRecordRelationship(event.target.value)} placeholder="Account, contact, opportunity..." /></label><label>Status or stage<select value={recordStatus} onChange={(event) => setRecordStatus(event.target.value)}>{[...activeRecordConfig.statuses, ...workspace.customPipelineStages].map((stage) => <option key={stage}>{stage}</option>)}</select></label><button className="web-button web-button--primary" type="submit">Add {recordLabels[recordKind]}</button></form></section><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">{crmViews.find(([value]) => value === crmView)?.[1]}</p><h3>Expanded CRM data</h3></div><span className="web-card__hint">{crmViewRecords.length} records</span></div><div className="web-data-table"><div className="web-data-table__head"><span>Record</span><span>Status</span><span>Owner / details</span><span>Created</span></div><div className="web-records">{crmViewRecords.length ? crmViewRecords.slice(0, 20).map((record) => <details className="web-record" key={record.id}><summary><span className="web-record-icon">{recordLabels[record.kind].slice(0, 1)}</span><span><strong>{record.name}</strong><small>{recordLabels[record.kind]} · {record.status}</small></span></summary><div className="web-record__details"><div className="web-record__table"><div className="web-record__table-head"><span>Field</span><span>Value</span></div>{expandedRecordRows(record).map((row, index) => <div className="web-record__table-row" key={`${record.id}-${row.label}-${index}`}><strong>{row.label}</strong><span>{row.value}</span></div>)}</div><div className="web-record__actions">{record.kind === 'lead' && record.status !== 'Converted' ? <button className="web-button web-button--secondary" type="button" onClick={() => convertLead(record.id)}>Convert lead</button> : null}{record.kind === 'quotation' && record.status === 'Accepted' ? <button className="web-button web-button--secondary" type="button" onClick={() => convertQuotation(record.id)}>Convert to sales order</button> : null}{record.kind === 'contract' && record.status === 'Active' ? <button className="web-button web-button--secondary" type="button" onClick={() => createRenewal(record.id)}>Create renewal</button> : null}<button className="web-button web-button--danger" type="button" onClick={() => deleteRecord(record.id)}>Delete record</button></div></div></details>) : <div className="web-empty">No records in this CRM section yet.</div>}</div></div></section></div> : null}
            {crmView === 'overview' ? <section className="web-card web-customer-360"><div className="web-card__heading"><div><p className="web-app__eyebrow">CRM relationship layer</p><h3>Customer 360</h3><p className="web-card__description">CRM-owned customer, contact, sales, activity, service, and contract context. Accounting, inventory, HR, and operations remain independent and can link to this customer when needed.</p></div><span className="web-card__hint">{workspace.records.length} CRM-linked records</span></div><label className="web-form__customer-select">Search related CRM records<input value={customer360Query} onChange={(event) => setCustomer360Query(event.target.value)} placeholder="Name, activity, case, quote..." /></label><label className="web-form__customer-select">Filter by status<select value={customer360Status} onChange={(event) => setCustomer360Status(event.target.value)}><option>All statuses</option>{[...new Set(workspace.records.map((record) => record.status))].map((status) => <option key={status}>{status}</option>)}</select></label><label className="web-form__customer-select">Select customer or organization<select value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}><option value="">Choose a customer</option>{workspace.records.filter((record) => ['customer', 'organization', 'contact'].includes(record.kind)).map((record) => <option value={record.id} key={record.id}>{record.name} · {recordLabels[record.kind]}</option>)}</select></label>{selectedCustomerId ? <div className="web-customer-360__timeline">{customer360Records.map((record) => <article key={record.id}><span className="web-record-icon">{recordLabels[record.kind].slice(0, 1)}</span><div><strong>{record.name}</strong><small>{recordLabels[record.kind]} · {record.status}</small><p>{record.detail || 'No additional details.'}</p></div></article>)}</div> : <p className="web-empty">Select a customer, organization, or contact to see CRM-related sales, activities, service, contracts, and statements.</p>}</section> : null}
            {crmView === 'overview' ? <section className="web-card web-crm-overview"><div className="web-card__heading"><div><p className="web-app__eyebrow">CRM overview</p><h3>Summary by CRM area</h3></div><div><span className="web-card__hint">Live browser data</span><button className="web-button web-button--secondary" type="button" onClick={exportCrmCsv}>Export CRM CSV</button></div></div><div className="web-crm-overview__grid">{crmViews.filter(([value]) => value !== 'overview' && value !== 'controls').map(([value, label]) => <article key={value}><span>{label}</span><strong>{crmRecords.filter((record) => crmViewKinds[value].includes(record.kind)).length}</strong><small>{value === 'sales' ? 'Revenue lifecycle' : value === 'activities' ? 'Engagement history' : value === 'service' ? 'Customer support' : 'Demand generation'}</small></article>)}<article><span>Weighted forecast</span><strong>{weightedPipeline.toLocaleString()}</strong><small>Opportunity amount × probability</small></article><article><span>Available credit</span><strong>{creditSummary.available.toLocaleString()}</strong><small>Limit {creditSummary.limit.toLocaleString()} · exposure {creditSummary.exposure.toLocaleString()}</small></article><article><span>Renewals due soon</span><strong>{renewalAlerts.length}</strong><small>Active contracts ending within 90 days</small></article><article><span>Open service cases</span><strong>{serviceMetrics.open}</strong><small>{serviceMetrics.escalated} escalated · {serviceMetrics.scored} scored</small></article><article><span>Campaign ROI</span><strong>{campaignMetrics.roi.toFixed(1)}%</strong><small>{campaignMetrics.count} campaigns · revenue {campaignMetrics.revenue.toLocaleString()} · cost {campaignMetrics.cost.toLocaleString()}</small></article></div></section> : null}
            {crmView === 'overview' ? <div className="web-grid web-grid--two"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">External access</p><h3>Portal shares</h3></div><span className="web-card__hint">{portalShareCount} read-only</span></div><div className="web-records">{workspace.portalShares.length ? workspace.portalShares.slice(0, 10).map((share) => <article key={share.id}><span className="web-record-icon">R</span><div><strong>{workspace.records.find((record) => record.id === share.recordId)?.name ?? 'CRM record'}</strong><small>{share.audience} · Read only · {new Date(share.createdAt).toLocaleDateString()}</small></div></article>) : <div className="web-empty">No customer portal shares yet.</div>}</div></section><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Marketing reach</p><h3>Campaign members</h3></div><span className="web-card__hint">{campaignMetrics.members} targeted</span></div><div className="web-records">{workspace.campaignMembers.length ? workspace.campaignMembers.slice(0, 10).map((member) => <article key={member.id}><span className="web-record-icon">M</span><div><strong>{member.subject}</strong><small>{workspace.records.find((record) => record.id === member.campaignId)?.name ?? 'Campaign'} · {member.status}{member.source ? ` · ${member.source}` : ''}</small></div></article>) : <div className="web-empty">No campaign members yet.</div>}</div></section></div> : null}
            {crmView === 'controls' ? <div className="web-grid web-grid--two"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Configuration</p><h3>Custom CRM fields</h3></div><span className="web-card__hint">{workspace.customFields.length} fields</span></div><form className="web-form" onSubmit={addCustomField}><label>Field name<input value={customFieldName} onChange={(event) => setCustomFieldName(event.target.value)} placeholder="e.g. Customer segment" /></label><button className="web-button web-button--primary" type="submit">Add custom field</button></form><div className="web-chip-list">{workspace.customFields.map((field) => <span className="web-chip-list__item" key={field}><span>{field}</span><button type="button" aria-label={`Delete custom field `} onClick={() => deleteCustomField(field)}>×</button></span>)}</div></section><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Pipeline configuration</p><h3>Custom sales stages</h3></div><span className="web-card__hint">{workspace.customPipelineStages.length} stages</span></div><form className="web-form" onSubmit={addCustomStage}><label>Stage name<input value={customStageName} onChange={(event) => setCustomStageName(event.target.value)} placeholder="e.g. Legal review" /></label><button className="web-button web-button--primary" type="submit">Add pipeline stage</button></form><div className="web-chip-list">{workspace.customPipelineStages.map((stage) => <span className="web-chip-list__item" key={stage}><span>{stage}</span><button type="button" aria-label={`Delete custom stage `} onClick={() => deleteCustomStage(stage)}>×</button></span>)}</div></section></div> : null}
          </> : null}

          {activeModule === 'admin' ? <div className="web-grid web-grid--two"><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Double-layer access</p><h3>Assign permission</h3></div><span className="web-card__hint">Read ≠ edit</span></div><form className="web-form" onSubmit={addPermission}><label>User or group<input value={permissionSubject} onChange={(event) => setPermissionSubject(event.target.value)} placeholder="User, role, or department" /></label><label>Resource<input value={permissionResource} onChange={(event) => setPermissionResource(event.target.value)} placeholder="CRM account, file, report..." /></label><label className="web-checkbox"><input type="checkbox" checked={permissionEdit} onChange={(event) => setPermissionEdit(event.target.checked)} /> Also grant edit permission</label><button className="web-button web-button--primary" type="submit">Grant permission</button></form></section><section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Permission register</p><h3>Current grants</h3></div><button className="web-button web-button--secondary" type="button" onClick={() => exportWorkspace(workspace)}>Backup</button></div><div className="web-records">{workspace.permissions.length ? workspace.permissions.map((permission) => <article key={permission.id}><span className="web-record-icon">{permission.canEdit ? 'E' : 'R'}</span><div><strong>{permission.subject}</strong><small>{permission.resource} · {permission.canEdit ? 'Read and edit' : 'Read only'}</small></div></article>) : <div className="web-empty">No permissions assigned yet.</div>}</div></section></div> : null}

          {activeModule === 'files' ? <section className="web-card"><div className="web-card__heading"><div><p className="web-app__eyebrow">Cloud file boundary</p><h3>Files and controlled sharing</h3></div><span className="web-card__hint">Cloud-ready</span></div><label className="web-file-drop">Choose a file<input type="file" onChange={addFile} /></label><div className="web-records">{workspace.files.length ? workspace.files.map((file) => <article key={file.id}><span className="web-record-icon">F</span><div><strong>{file.name}</strong><small>{Math.ceil(file.size / 1024)} KB · {file.storage} · uploaded {new Date(file.uploadedAt).toLocaleDateString()}</small></div></article>) : <div className="web-empty">No files added yet.</div>}</div></section> : null}

          {activeModule !== 'home' && activeModule !== 'crm' ? <section className="web-card web-placeholder"><span className="web-placeholder__icon">{desktopNavigation.find((item) => item.id === activeModule)?.label.slice(0, 1)}</span><h3>{desktopNavigation.find((item) => item.id === activeModule)?.label} foundation</h3><p>{moduleDescriptions[activeModule]} The web foundation is ready for its detailed forms, workflows, reports, and permission-aware database services.</p><button type="button" className="web-button web-button--secondary" onClick={() => setMessage('This module is queued for its detailed web workflow.')}>Plan module workflow</button></section> : null}
          {activeModule === 'admin' ? <section className="web-card web-approval-inbox"><div className="web-card__heading"><div><p className="web-app__eyebrow">Phase 2 controls</p><h3>Approval inbox</h3></div><span className="web-card__hint">{workspace.approvals.filter((item) => item.status === 'Pending').length} pending</span></div><div className="web-records">{workspace.approvals.length ? workspace.approvals.map((approval) => <article key={approval.id}><span className="web-record-icon">{approval.status === 'Pending' ? '!' : approval.status.slice(0, 1)}</span><div><strong>{approval.requestedAction}</strong><small>{approval.recordType} · {approval.status} · requested {new Date(approval.requestedAt).toLocaleString()}</small>{approval.status === 'Pending' ? <div><button className="web-button web-button--secondary" type="button" onClick={() => setApprovalStatus(approval.id, 'Approved')}>Approve</button><button className="web-button web-button--danger" type="button" onClick={() => setApprovalStatus(approval.id, 'Rejected')}>Reject</button></div> : null}</div></article>) : <div className="web-empty">No approval requests yet.</div>}</div></section> : null}
          {message ? <p className="web-message" role="status">{message}</p> : null}
        </section>
      </main>
    </div>
  );
}
