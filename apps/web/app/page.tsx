'use client';

import { useEffect, useState } from 'react';
import Database from '@tauri-apps/plugin-sql';
import { LocalUserDirectory } from '../user-directory';
import { LocalCrmDirectory } from '../crm-directory';
import { LocalHrDirectory } from '../hr-directory';
import { LocalErpDirectory } from '../erp-directory';
import { LocalOmsDirectory } from '../oms-directory';
import { LocalScmDirectory } from '../scm-directory';
import { LocalAccountingDirectory } from '../accounting-directory';

const cards = [
  ['Revenue', '—', 'Connect finance data'],
  ['Open orders', '—', 'Connect OMS data'],
  ['Inventory alerts', '—', 'Connect IMS data'],
  ['Pending approvals', '—', 'Review authorization queue'],
];

const modules = ['CRM', 'HR', 'ERP', 'POS', 'IMS', 'OMS', 'SCM', 'Accounting', 'Finance', 'Files'];

export default function HomePage() {
  const [organization, setOrganization] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [status, setStatus] = useState('Admin setup pending');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [resumeSessionId, setResumeSessionId] = useState('');
  const [resumeStatus, setResumeStatus] = useState('Session resume pending');
  const [revokeSessionId, setRevokeSessionId] = useState('');
  const [revokeStatus, setRevokeStatus] = useState('Admin revocation pending');
  const [userEmail, setUserEmail] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userRole, setUserRole] = useState<'staff' | 'manager' | 'department_admin' | 'organization_admin'>('staff');
  const [userStatus, setUserStatus] = useState<'active' | 'invited' | 'suspended'>('active');
  const [userStatusMessage, setUserStatusMessage] = useState('User management pending');
  const [users, setUsers] = useState<readonly { id: string; email: string; displayName: string; status: string }[]>([]);
  const [usersStatus, setUsersStatus] = useState('User list not loaded');
  const [crmOrganizationName, setCrmOrganizationName] = useState('');
  const [crmContactFirstName, setCrmContactFirstName] = useState('');
  const [crmContactLastName, setCrmContactLastName] = useState('');
  const [crmStatus, setCrmStatus] = useState('CRM not loaded');
  const [crmOrganizations, setCrmOrganizations] = useState<readonly { id: string; name: string }[]>([]);
  const [crmContacts, setCrmContacts] = useState<readonly { id: string; firstName: string; lastName: string }[]>([]);
  const [hrDepartmentName, setHrDepartmentName] = useState('');
  const [hrFirstName, setHrFirstName] = useState('');
  const [hrLastName, setHrLastName] = useState('');
  const [hrStatus, setHrStatus] = useState('HR not loaded');
  const [hrDepartments, setHrDepartments] = useState<readonly { id: string; name: string }[]>([]);
  const [hrEmployees, setHrEmployees] = useState<readonly { id: string; firstName: string; lastName: string }[]>([]);
  const [erpStatus, setErpStatus] = useState('ERP not loaded');
  const [erpItems, setErpItems] = useState<readonly { id: string; name: string }[]>([]);
  const [erpSuppliers, setErpSuppliers] = useState<readonly { id: string; name: string }[]>([]);
  const [erpPurchaseOrders, setErpPurchaseOrders] = useState<readonly { id: string; status: string }[]>([]);
  const [omsStatus, setOmsStatus] = useState('OMS/SCM not loaded');
  const [omsOrders, setOmsOrders] = useState<readonly { id: string; status: string }[]>([]);
  const [scmShipments, setScmShipments] = useState<readonly { id: string; status: string }[]>([]);
  const [financeStatus, setFinanceStatus] = useState('Accounting/finance not loaded');
  const [accounts, setAccounts] = useState<readonly { id: string; name: string }[]>([]);
  const [journalEntries, setJournalEntries] = useState<readonly { id: string; description: string }[]>([]);
  const [budgets, setBudgets] = useState<readonly { id: string; name: string }[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const database = await Database.load('sqlite:prd.sqlite');
        const metadata = await database.select<{ value: string }[]>('SELECT value FROM app_metadata WHERE key = $1', ['current_session_id']);
        const sessionId = metadata[0]?.value;
        if (!sessionId) return;
        const rows = await database.select<{ id: string; revoked_at: string | null; expires_at: string | null }[]>('SELECT id, revoked_at, expires_at FROM session WHERE id = $1', [sessionId]);
        const session = rows[0];
        if (!session || session.revoked_at || (session.expires_at && session.expires_at <= new Date().toISOString())) return;
        setCurrentSessionId(session.id);
        setResumeStatus('Active local session restored');
      } catch {
        // Session restoration runs only inside the Tauri desktop shell.
      }
    })();
  }, []);
  const [permissionSubject, setPermissionSubject] = useState('');
  const [permissionResource, setPermissionResource] = useState('');
  const [permissionAction, setPermissionAction] = useState<'read' | 'edit'>('read');
  const [permissionStatus, setPermissionStatus] = useState('Permission assignment pending');

  async function bootstrapAdmin() {
    if (!organization.trim()) {
      setStatus('Organization is required. Adding an administrator email is encouraged for account recovery and notifications.');
      return;
    }

    try {
      const database = await Database.load('sqlite:prd.sqlite');
      const now = new Date().toISOString();
      const tenantId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const sessionId = crypto.randomUUID();
      const contactEmail = adminEmail.trim() || null;

      await database.execute('INSERT INTO tenant (id, name, created_at) VALUES ($1, $2, $3)', [tenantId, organization.trim(), now]);
      await database.execute('INSERT INTO app_user (id, tenant_id, email, display_name, created_at) VALUES ($1, $2, $3, $4, $5)', [userId, tenantId, contactEmail, contactEmail ?? 'Administrator', now]);
      await database.execute('UPDATE admin_bootstrap SET tenant_id = $1, user_id = $2, completed_at = $3 WHERE id = 1', [tenantId, userId, now]);
      await database.execute('INSERT INTO session (id, tenant_id, user_id, issued_at, expires_at) VALUES ($1, $2, $3, $4, $5)', [sessionId, tenantId, userId, now, null]);
      await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('current_tenant_id', $1)", [tenantId]);
      await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('current_user_id', $1)", [userId]);
      await database.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('current_session_id', $1)", [sessionId]);
      setCurrentSessionId(sessionId);
      setStatus('Administrator bootstrap and local session saved');
    } catch {
      setStatus('Open PRD Software inside Tauri to save the local bootstrap');
    }
  }

  async function grantPermission() {
    if (!permissionSubject.trim() || !permissionResource.trim()) {
      setPermissionStatus('Subject and resource are required');
      return;
    }
    try {
      const database = await Database.load('sqlite:prd.sqlite');
      const bootstrap = await database.select<{ tenant_id: string; user_id: string }[]>('SELECT tenant_id, user_id FROM admin_bootstrap WHERE id = 1');
      const tenantId = bootstrap[0]?.tenant_id;
      const actorId = bootstrap[0]?.user_id;
      if (!tenantId || !actorId) throw new Error('administrator_bootstrap_required');
      await database.execute('INSERT INTO permission_grant (id, tenant_id, subject_id, resource_type, resource_id, action, effect, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [crypto.randomUUID(), tenantId, permissionSubject.trim(), 'business_record', permissionResource.trim(), permissionAction, 'allow', new Date().toISOString()]);
      await database.execute('INSERT INTO audit_event (id, tenant_id, actor_id, action, resource_type, resource_id, occurred_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [crypto.randomUUID(), tenantId, actorId, 'permission_granted', 'business_record', permissionResource.trim(), new Date().toISOString()]);
      setPermissionStatus(permissionAction === 'read' ? 'Read-only permission granted' : 'Edit permission granted');
    } catch {
      setPermissionStatus('Open PRD Software inside Tauri to save permissions');
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 24 }}>
        <div>
          <p style={{ color: '#667085', marginBottom: 8 }}>PRD SOFTWARE / ADMIN</p>
          <h1 style={{ margin: 0 }}>Operations overview</h1>
          <p style={{ color: '#667085' }}>Authorized summaries with drill-down detail.</p>
        </div>
        <span style={{ background: '#ecfdf3', color: '#027a48', padding: '8px 12px', borderRadius: 999, fontSize: 13 }}>MCP disabled</span>
      </header>

      <section aria-label="Executive summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 32 }}>
        {cards.map(([label, value, detail]) => (
          <article key={label} style={{ border: '1px solid #eaecf0', borderRadius: 12, padding: 20 }}>
            <p style={{ color: '#667085', margin: 0 }}>{label}</p>
            <strong style={{ display: 'block', fontSize: 28, margin: '12px 0' }}>{value}</strong>
            <small style={{ color: '#667085' }}>{detail}</small>
          </article>
        ))}
      </section>

      <section aria-label="Administrator setup" style={{ marginTop: 40, border: '1px solid #d0d5dd', borderRadius: 12, padding: 24 }}>
        <h2>First-launch administrator setup</h2>
        <p style={{ color: '#667085' }}>Create the local organization and administrator record for this desktop installation.</p>
        <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          <input aria-label="Organization name" placeholder="Organization name" value={organization} onChange={(event) => 
					275 container grammarly-integration
						276 text {"mode":"full","isActive":true,"isUserDisabled":false}
			277 pop-up button (settable, string) Tab search
			278 container (settable, string)
				279 tab group (settable, string)
					280 tab (settable, boolean) Description: What’s new, Value: off
					281 tab (settable, boolean) Description: Oops, Value: off
					282 tab (settable, boolean) Description: LAHORE'S LOST FRAMES |DOCUMENTARY |MASOOD BUTT|FOZAN KHAN |NOW STREAMING - YouTube, Value: off
					283 tab (settable, boolean) Description: YouTube Creator Studio, Value: off
					284 tab (settable, boolean) Description: YouTube Creator Studio, Value: off
					285 tab (settable, boolean) Description: window 11 - YouTube, Value: off
					286 tab (settable, boolean) Description: Oops, Value: off
					287 tab (settable, boolean) Description: ALEXA 35 Xtreme - The Guided Tour - More Speed. Less Data. - YouTube, Value: off
					288 tab (settable, boolean) Description: Course 5 Notes - Business Leader Communication Certification, Value: off
					289 tab (settable, boolean) Description: Products – NSCS, Value: off
					290 tab (settable, boolean) Description: (45) Remote jobs | LinkedIn - Memory usage - 360 MB, Value: off
					291 tab (settable, boolean) Value: off, Description: Jr. Production Assistant - Remote Operations in Atlanta, Georgia, United States of America | Early Careers at Warner Bros. Discovery
					292 tab (settable, boolean) Description: Jr. Production Assistant - Remote Operations, Value: off
					293 tab (settable, boolean) Description: New Member Checklist, Value: off
					294 tab (settable, boolean) Description: NSCS Virtual Induction Ceremony December 5, 2024, Value: off
					295 tab (settable, boolean) Description: Royalty Free Scary Horror Background Music Downloads | FStudios, Value: off
					296 tab (settable, boolean) Description: Royalty-Free Suspenseful Music | Epidemic Sound, Value: off
					297 tab (settable, boolean) Description: Oops, Value: off
					298 tab (settable, boolean) Description: Oops, Value: off
					299 tab (settable, boolean) Description: Oops, Value: off
					300 tab (settable, boolean) Description: (66) YouTube - Memory usage - 282 MB, Value: off
					301 tab (settable, boolean) Description: Use automatic dubbing - Computer - YouTube Help, Value: off
					302 tab (settable, boolean) Description: LMS Dashboard Template, Admin Templates ft. admin & bootstrap - Envato, Value: off
					303 tab (settable, boolean) Description: (9) WhatsApp Business - Memory usage - 477 MB, Value: off
					304 tab (settable, boolean) Description: add-logo-watermark · Clueso Video Skills, Value: off
					305 tab (settable, boolean) Description: Home | Julián Martínez, Value: off
					306 tab (settable, boolean) Description: Where possibilities begin - Udemy Blog, Value: off
					307 tab (settable, boolean) Description: Udemy: Online Courses for Skills, Careers & AI, Value: off
					308 tab (settable, boolean) Description: Submissions - Independent Talent, Value: off
					309 tab (settable, boolean) Description: Login - Full Sail University, Value: off
					310 tab (settable, boolean) Description: Full Sail University, Value: off
					311 tab (settable, boolean) Description: YouTube, Value: off
					312 tab (settable, boolean) Description: Oops, Value: off
					313 tab (settable, boolean) Description: (45) YouTube, Value: off
					314 tab (settable, boolean) Description: Channel content - YouTube Studio, Value: off
					315 tab (settable, boolean) Description: Channel dashboard - YouTube Studio, Value: off
					316 tab (settable, boolean) Description: Tabaahi - YouTube, Value: off
					317 tab (settable, boolean) Description: (66) Introducing Tutor LMS 4.0! - YouTube, Value: off
					318 tab (settable, boolean) Description: (66) Build and publish web apps directly in ChatGPT - YouTube, Value: off
					319 tab (settable, boolean) Description: How To Create Vox-Style AI Motion Graphics (Full Workflow) Prompt Pack - Google Docs, Value: off
					320 tab (settable, boolean) Description: Text Pack 2 (Free) - quang's Ko-fi Shop, Value: off
					321 tab (settable, boolean) Description: Magnifier for DaVinci Resolve – MONONODES, Value: off
					322 tab (settable, boolean) Description: Summary, Value: off
					323 tab (settable, boolean) Description: Full Sail Student Portal, Value: off
					324 tab (settable, boolean) Description: Account – Full Sail HangR, Value: off
					325 tab (settable, boolean) Description: Email - Fozan Khan - Outlook, Value: off
					326 tab (settable, boolean) Description: What type of user are you?, Value: off
					327 tab (settable, boolean) Description: Feed | Full Sail Alumni Network, Value: off
					328 tab (settable, boolean) Description: Document 1.docx, Value: off
					329 tab (settable, boolean) Description: Graduation : Live Stream - Full Sail University, Value: off
					330 tab (settable, boolean) Description: Portfolio | FINAL_Fozan_Khan, Value: off
					331 tab (settable, boolean) Description: Professional Lighting and Production Hardware Catalog - NotebookLM, Value: off
					332 tab (settable, boolean) Description: Welcome to the Free Music Archive - Free Music Archive, Value: off
					333 tab (settable, boolean) Description: Welcome | LinkedIn Learning, Value: off
					334 tab (settable, boolean) Description: (66) DCBS TV: CAMERA-TEAM ROUND TABLE - YouTube, Value: off
					335 tab (settable, boolean) Description: Welcome to LinkedIn Learning | LinkedIn Learning, Value: off
					336 tab (settable, boolean) Description: Login – FSO, Value: off
					337 tab (settable, boolean) Description: Suzanne Walking - Julian Opie — Google Arts & Culture, Value: off
					338 tab (settable, boolean) Description: Google Arts & Culture, Value: off
					339 tab (settable, boolean) Description: Young Virgin Auto-Sodomized by the Horns of Her Own Chastity by Salvador Dalí, Value: off
					340 tab (settable, boolean) Description: Full Sail University’s Videos on Vimeo, Value: off
					341 tab (settable, boolean) Description: Adobe Portfolio | Build your own personalized website, Value: off
					342 tab (settable, boolean) Description: Log in to your Figma account - fozankhan92@gmail.com - Gmail, Value: off
					343 tab (settable, boolean) Value: off, Description: Fozankhan92/prd-software: Custom all-in-one CRM, HR, ERP, POS, IMS, OMS, SCM, accounting, finance, cloud files, and MCP-ready business platform.
					344 tab (settable, boolean) Description: StarNow, Value: off
					345 tab (settable, boolean) Description: Join from Zoom Workplace app - Zoom, Value: off
					346 tab (settable, boolean) Description: work.mercor.com/earnings, Value: off
					347 tab (settable, boolean) Description: Recents – Figma, Value: off
					348 tab (settable, boolean) Description: AI Detector - Trusted AI Checker for ChatGPT, GPT5 & Gemini, Value: off
					349 tab (settable, boolean) Description: Log In to Your Wix Account - Wix.com, Value: off
					350 tab (settable, boolean) Description: 500 Error: Internal Server Error | Wix.com, Value: off
					351 tab (settable, boolean) Description: Log In to Your Wix Account - Wix.com, Value: off
					352 tab (settable, boolean) Description: Welcome to LinkedIn Learning | LinkedIn Learning, Value: off
					353 tab (settable, boolean) Description: ChatGPT, Value: off
					354 tab (settable, boolean) Description: PRD Software, Value: off
					355 tab (settable, boolean) Description: Installed GitHub Apps, Value: off
					356 tab (settable, boolean) Description: Best Cinematography Courses To Take In 2023, Value: off
					357 tab (settable, boolean) Description: MZed - Courses, Value: off
					358 tab (settable, boolean) Description: School of Motion | Explore our Motion Design Course Catalogue, Value: off
					359 tab (settable, boolean) Description: Directing Master Course - FilmSkills, Value: off
					360 tab (settable, boolean) Description: Course Catalog | Kadenze, Value: off
					361 tab (settable, boolean) Description: Fozan_Khan_ATS_CV.pdf, Value: off
					362 tab (settable, boolean) Description: CamScanner 12-10-2021 16.35 - SOPs-for-consumers.pdf, Value: off
					363 tab (settable, boolean) Description: (66) broadcast legal color premiere pro - YouTube, Value: off
					364 tab (settable, boolean) Description: How Salesforce Transformed Its Leadership Development Program, Value: off
					365 tab (settable, boolean) Description: 404: This page could not be found., Value: off
					366 tab (settable, boolean) Description: DeepSeek, Value: off
					367 tab (settable, boolean) Description: Filmmaking Certificate, Value: off
					368 tab (settable, boolean) Description: The French Masters and Classic Hollywood Cinema | Free Course | Alison, Value: off
					369 tab (settable, boolean) Description: How to get Adobe Certified | Step-by-Step Exam Guide, Value: off
					370 tab (settable, boolean) Description: Adobe Digital Experience Certification Program | Course Catalogue, Value: off
					371 tab (settable, boolean) Description: Universal Business Council - Professional Certification Body, Value: off
					372 tab (settable, boolean) Description: ChatGPT, Value: off
					373 tab (settable, boolean) Description: AI Voice Generator & Text to Speech v2 | ElevenLabs, Value: off
					374 tab (settable, boolean) Description: Qwen Studio, Value: off
					375 tab (settable, boolean) Description: Notion, Value: off
					376 tab (settable, boolean) Description: All Mail - fozankhan92@gmail.com - Gmail, Value: off
					377 tab (settable, boolean) Description: Mercor | Media Analysis Specialists, Value: off
					378 tab (settable, boolean) Description: Job tracker | LinkedIn, Value: off
					379 tab (settable, boolean) Description: Cinematographer, Value: off
					380 tab (settable, boolean) Description: Senior Producer, Video Job Details | Paramount, Value: off
					381 tab (settable, boolean) Description: YouTube Editor in Los Angeles, California | FOX Careers, Value: off
					382 tab (settable, boolean) Description: RGP ATS, Value: off
					383 tab (settable, boolean) Description: Careers at Netflix, Value: off
					384 tab (settable, boolean) Description: Production Assistant | Sydney,Australia | Netflix, Value: off
					385 tab (settable, boolean) Description: Photographer/Videographer II | Dayforce Jobs, Value: off
					386 tab (settable, boolean) Description: Magnific (formerly Freepik) | The AI Creative Platform, Value: off
					387 tab (settable, boolean) Description: Fozan Khan :: Designers, photographers, illustrators, typographers and artists :: Behance, Value: off
					388 tab (settable, boolean) Value: off, Description: Fozankhan92/prd-software: Custom all-in-one CRM, HR, ERP, POS, IMS, OMS, SCM, accounting, finance, cloud files, and MCP-ready business platform.
					389 tab (settable, boolean) Description: Google Account, Value: off
					390 tab (settable, boolean) Description: Upgrade - Claude, Value: off
					391 tab (settable, boolean) Description: Google Gemini, Value: off
					392 tab (settable, boolean) Description: Perplexity, Value: off
					393 tab (settable, boolean) Description: Log In | Binance, Value: off
					394 tab (settable, boolean) Description: Projects - Claude, Value: off
					395 tab (settable, boolean) Description: MovieBox - Watch Movies Free Online, Watch TV Series Online, Value: off
					396 tab (settable, boolean) Description: Google Sheets, Value: off
					397 tab (settable, boolean) Description: PRD SOFTWARE - ALL IN ONE SOLUTION - Google Docs, Value: off
					398 tab (settable, boolean) Description: Login, Value: off
					399 tab (selected, settable, boolean) Description: prd-software/apps/web/app/page.tsx at main · Fozankhan92/prd-software, Value: on
						400 button (settable, string) Close
			401 button (settable, string) New tab
			402 button (settable, string) Open Gemini in Chrome
	403 close button
	404 full screen button Help: this button also has an action to zoom the window, Secondary Actions: zoom the window
	405 minimise button
406 menu bar
	407 Chrome
	408 File
