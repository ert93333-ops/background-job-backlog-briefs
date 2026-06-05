const PRODUCT = "Background Job Backlog Briefs";
const STORAGE_PREFIX = "backgroundjobbacklogbriefs";
const ISSUE_URL = "https://github.com/ert93333-ops/background-job-backlog-briefs/issues/new?template=demo_request.md&labels=early-access%2Cpurchase-intent%2Cdemo-request&title=Early%20access%20request%3A%20Background%20Job%20Backlog%20Briefs";

const fields = {
  notes: document.querySelector("#backlog-notes"),
  scope: document.querySelector("#scope-notes"),
  backlog: document.querySelector("#volume-notes"),
  retry: document.querySelector("#retry-notes"),
  impact: document.querySelector("#impact-notes"),
  cause: document.querySelector("#cause-notes"),
  recovery: document.querySelector("#recovery-notes"),
  validation: document.querySelector("#validation-notes"),
  owner: document.querySelector("#owner-notes"),
  privacy: document.querySelector("#privacy-notes"),
};

const output = document.querySelector("#brief-output");
const outputStatus = document.querySelector("#output-status");
const workflowError = document.querySelector("#workflow-error");
const copyButton = document.querySelector("#copy-brief");
const copyStatus = document.querySelector("#copy-status");
const intentForm = document.querySelector("#intent-form");
const intentStatus = document.querySelector("#intent-status");
const remoteIntent = document.querySelector("#remote-intent");
const remoteIntentLink = document.querySelector("#remote-intent-link");
const remoteCopyButton = document.querySelector("#copy-remote-intent");
const remoteCopyStatus = document.querySelector("#remote-copy-status");

let lastBriefText = "";
let selectedPlan = "Starter";
let lastRemoteBody = "";

function track(event, detail = {}) {
  const payload = {
    event,
    detail,
    product: PRODUCT,
    page: window.location.pathname,
    utm: Object.fromEntries(new URLSearchParams(window.location.search)),
    at: new Date().toISOString(),
  };
  const key = `${STORAGE_PREFIX}_analytics_events`;
  const events = JSON.parse(localStorage.getItem(key) || "[]");
  events.push(payload);
  localStorage.setItem(key, JSON.stringify(events.slice(-200)));
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function fieldText() {
  return Object.fromEntries(Object.entries(fields).map(([key, element]) => [key, element.value.trim()]));
}

function combinedText(values) {
  return Object.values(values).join("\n").toLowerCase();
}

function missingChecks(values) {
  const all = combinedText(values);
  const scopeText = `${values.notes} ${values.scope}`.toLowerCase();
  const backlogText = `${values.notes} ${values.backlog}`.toLowerCase();
  const retryText = `${values.notes} ${values.retry}`.toLowerCase();
  const impactText = `${values.notes} ${values.impact}`.toLowerCase();
  const causeText = `${values.notes} ${values.cause}`.toLowerCase();
  const recoveryText = `${values.notes} ${values.recovery}`.toLowerCase();
  const validationText = `${values.notes} ${values.validation}`.toLowerCase();
  const ownerText = `${values.notes} ${values.owner}`.toLowerCase();

  const checks = [
    {
      label: "missing framework, queue, job, worker, backend, priority, or environment scope:",
      ok: hasAny(scopeText, [/\bsidekiq\b/, /\bbullmq\b/, /\blaravel\b/, /\bcelery\b/, /\bhorizon\b/, /\bflower\b/, /\bqueue\b/, /\bjob\b/, /\bworker\b/, /\bredis\b/, /\bsqs\b/, /\brabbitmq\b/, /\bamqp\b/, /\bbackend\b/, /\bpriority\b/, /\bproduction\b/, /\bstaging\b/, /\benvironment\b/, /\bjob class\b/, /\bqueue name\b/, /\bconnection\b/]),
    },
    {
      label: "missing backlog count, oldest age, throughput, latency, failure-rate, retry, or dead-letter state:",
      ok: hasAny(backlogText, [/\bbacklog\b/, /\bqueue depth\b/, /\bqueued\b/, /\bwaiting\b/, /\bpending\b/, /\bdelayed\b/, /\boldest\b/, /\bage\b/, /\bthroughput\b/, /\blatency\b/, /\bfailure rate\b/, /\berror rate\b/, /\bretry count\b/, /\bretries\b/, /\bdead set\b/, /\bdead[- ]letter\b/, /\bdlq\b/, /\bfailed_jobs\b/, /\bfailed jobs\b/, /\bstuck\b/, /\blag\b/, /\b\d+\s*(jobs|queued|pending|failed)\b/]),
    },
    {
      label: "missing retry, backoff, jitter, attempts, timeout, visibility, expiration, delay, or ETA context:",
      ok: hasAny(retryText, [/\bretry\b/, /\bretries\b/, /\bbackoff\b/, /\bjitter\b/, /\battempts?\b/, /\btimeout\b/, /\bvisibility\b/, /\bvisibility timeout\b/, /\bexpiration\b/, /\bdelay\b/, /\beta\b/, /\bcountdown\b/, /\bmax retries\b/, /\bexponential\b/, /\bfixed backoff\b/, /\bidempotent\b/]),
    },
    {
      label: "missing customer impact, affected workflow, SLA, billing, email, import, export, webhook, reporting, or urgency context:",
      ok: hasAny(impactText, [/\bcustomer\b/, /\buser\b/, /\bimpact\b/, /\baffected\b/, /\bworkflow\b/, /\bsla\b/, /\bbilling\b/, /\bemail\b/, /\bimport\b/, /\bexport\b/, /\bwebhook\b/, /\breport\b/, /\breporting\b/, /\bsupport\b/, /\bincident\b/, /\burgent\b/, /\bdelayed customer\b/]),
    },
    {
      label: "missing external dependency, rate limit, database, memory, worker crash, deploy, scheduler, or payload-size cause:",
      ok: hasAny(causeText, [/\bdependency\b/, /\bprovider\b/, /\bexternal api\b/, /\brate limit\b/, /\b429\b/, /\bdatabase\b/, /\bdb\b/, /\bmemory\b/, /\boom\b/, /\bworker crash\b/, /\bcrash\b/, /\bdeploy\b/, /\brelease\b/, /\bscheduler\b/, /\bcron\b/, /\bpayload size\b/, /\blarge payload\b/, /\bredis\b/, /\bsqs\b/, /\brabbitmq\b/, /\btimeout\b/, /\block\b/]),
    },
    {
      label: "missing safe recovery action such as pause, drain, scale, retry selected, replay safely, drop stale, or contact provider:",
      ok: hasAny(recoveryText, [/\bpause\b/, /\bdrain\b/, /\bscale\b/, /\bworker concurrency\b/, /\bconcurrency\b/, /\bretry selected\b/, /\bselected failed\b/, /\breplay\b/, /\bsafe replay\b/, /\bdrop stale\b/, /\bdiscard stale\b/, /\bcontact provider\b/, /\bthrottle\b/, /\bidempotenc(y|t)\b/, /\breschedule\b/, /\bbackfill\b/]),
    },
    {
      label: "missing validation, monitor, queue depth, error-rate, dead set, failed_jobs, dashboard, alert, or next-update path:",
      ok: hasAny(validationText, [/\bvalidate\b/, /\bvalidation\b/, /\bmonitor\b/, /\bqueue depth\b/, /\bdashboard\b/, /\bmetrics\b/, /\berror rate\b/, /\bfailure rate\b/, /\bdead set\b/, /\bfailed_jobs\b/, /\bfailed jobs\b/, /\bsidekiq web\b/, /\bhorizon\b/, /\bflower\b/, /\balert\b/, /\bnext update\b/, /\bsmoke test\b/]),
    },
    {
      label: "missing owner, reviewer, escalation, comms owner, on-call, or next update:",
      ok: hasAny(ownerText, [/\bowner\b/, /\breviewer\b/, /\bescalat(e|ion)\b/, /\bcomms owner\b/, /\bcommunications owner\b/, /\bon[- ]call\b/, /\bnext update\b/, /\bby \d{1,2}:\d{2}\b/, /\butc\b/, /\blead\b/, /\bsupport owner\b/]),
    },
  ];

  const unsafeWording = hasAny(all, [/\bretry all\b/, /\bretry-all\b/, /\bjust retry\b/, /\bflush\b/, /\bdelete all\b/, /\bdelete jobs\b/, /\bpurge\b/, /\bclear queue\b/, /\bdrop all\b/, /\bdiscard silently\b/, /\bsilent discard\b/, /\bduplicate side effect\b/, /\bduplicate charge\b/, /\bno impact\b/, /\bno customer impact\b/, /\bignore side effects\b/, /\brun blindly\b/, /\bblame customer\b/]);
  const privateRiskText = all.replace(/\b(?:no|without)\s+[^.;\n]*(?:payloads?|tokens?|queue urls?|raw logs?|customer ids?|user emails?|credentials?|pii|production data)[^.;\n]*/g, "");
  const privateRisk = hasAny(privateRiskText, [/\bpayload\b/, /\btoken\b/, /\baccess key\b/, /\bapi key\b/, /\bbearer\b/, /\bsecret\b/, /\bpassword\b/, /\bcredential\b/, /\buser email\b/, /\bpersonal email\b/, /\bcustomer id\b/, /\bcustomer_id\b/, /\braw log\b/, /\bqueue url\b/, /\bredis:\/\/\b/, /\bamqp:\/\/\b/, /\bsqs url\b/, /\bpii\b/, /\bproduction data\b/, /\bssn\b/, /\bcredit card\b/]);

  const warnings = checks.filter((check) => !check.ok).map((check) => check.label);
  if (unsafeWording) warnings.push("unsafe retry-all, flush/delete, duplicate side-effect, silent discard, no-impact, or blame wording:");
  if (privateRisk) warnings.push("private payload, token, email, customer ID, raw log, queue URL, credential, PII, or production-data risk:");
  return warnings;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function line(label, value, fallback) {
  return `<li><strong>${label}:</strong> ${escapeHtml(value || fallback)}</li>`;
}

function buildBrief(values) {
  const warnings = missingChecks(values);
  const outline = [
    "Name framework, queue, job class, worker pool, backend, priority, environment, and customer-facing workflow.",
    "State backlog count, oldest job age, throughput, latency, failure rate, retry count, and dead-letter or failed-job state.",
    "Document retry/backoff/jitter/attempts/timeout/delay context and whether the job is idempotent before replay.",
    "Separate root cause from recovery action: dependency, rate limit, database, worker crash, deploy, scheduler, payload size, or capacity.",
    "List safe recovery, validation dashboard, owner, reviewer, comms owner, next update, and payload privacy guardrails.",
  ];

  output.innerHTML = `
    <h3>Background job backlog brief ready</h3>
    <h4>Queue scope summary</h4>
    <ul>
      ${line("Queue and worker scope", values.scope, "Needs framework, queue, job class/name, worker, backend, priority, and environment scope.")}
      ${line("Backlog state", values.backlog, "Needs backlog count, oldest job age, throughput, latency, failure rate, retry count, and dead-letter state.")}
      ${line("Retry timing", values.retry, "Needs retry/backoff/jitter/attempts/timeout/visibility/expiration/delay/ETA context.")}
      ${line("Customer impact", values.impact, "Needs affected workflow, SLA, billing/email/import/export/webhook/reporting scope, and urgency.")}
      ${line("Suspected cause", values.cause, "Needs dependency, rate limit, database, memory, worker crash, deploy, scheduler, or payload-size cause.")}
    </ul>
    <h4>Missing context and risk warnings</h4>
    ${warnings.length ? `<ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>` : "<p>No major missing context detected in the public-safe fields.</p>"}
    <h4>Recovery and validation checklist</h4>
    <ol>${outline.map((item) => `<li>${item}</li>`).join("")}</ol>
    <h4>Recovery action</h4>
    <p>${escapeHtml(values.recovery || "Add pause/drain/scale/retry-selected/replay/drop-stale/contact-provider action, plus idempotency and duplicate side-effect caveats.")}</p>
    <h4>Validation and owner handoff</h4>
    <p>${escapeHtml(values.validation || "Add queue depth, dead set or failed_jobs review, dashboard, error-rate monitor, smoke test, and next-update path.")}</p>
    <p>${escapeHtml(values.owner || "Set a named backend/platform/SRE owner, reviewer, escalation path, comms owner, and next-update time.")}</p>
  `;

  lastBriefText = output.innerText;
  outputStatus.textContent = warnings.length ? `${warnings.length} issue(s) to review` : "Brief ready";
  copyButton.disabled = false;
  track("brief_generated", { warningCount: warnings.length });
  track("core_action_completed", { warningCount: warnings.length });
}

function generateBrief() {
  workflowError.textContent = "";
  const values = fieldText();
  if (!values.notes) {
    workflowError.textContent = "Paste public-safe background job backlog notes first.";
    track("brief_generation_failed", { reason: "empty_backlog_notes" });
    return;
  }
  track("core_action_started", { triggerSource: "generate_button" });
  buildBrief(values);
}

async function copyText(text, statusElement, success) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  statusElement.textContent = success;
}

function loadSample() {
  fields.notes.value = "Sidekiq production backlog for BillingSyncJob on critical queue after provider 429s.";
  fields.scope.value = "Framework Sidekiq; queue critical; job BillingSyncJob; worker pool billing-workers; Redis backend; high priority; production.";
  fields.backlog.value = "2,480 queued jobs; oldest age 74 minutes; throughput 520 jobs/hour; latency 18 minutes; failure rate 12%; retry count 1,120; 43 jobs in Dead set.";
  fields.retry.value = "Retries use exponential backoff with jitter, max 10 attempts, 30 second timeout, delayed ETA windows, and idempotency key per invoice sync.";
  fields.impact.value = "Customer billing sync and invoice export workflows delayed; SLA risk for finance admins; support can tell customers next update by 10:30 UTC.";
  fields.cause.value = "External billing provider rate limit and deploy-related worker concurrency increase created retry storm; database healthy and memory stable.";
  fields.recovery.value = "Pause new noncritical sync jobs, drain critical queue, reduce concurrency, retry selected Dead set jobs after provider confirms quota, and drop stale duplicate exports only after owner review.";
  fields.validation.value = "Monitor Sidekiq Web queue depth, Dead set, error-rate dashboard, provider 429 count, billing export smoke test, and next update path.";
  fields.owner.value = "Backend on-call owns recovery; SRE reviewer approves retry batch; support comms owner sends update by 10:30 UTC.";
  fields.privacy.value = "Public-safe notes only; no payloads, tokens, queue URLs, raw logs, customer IDs, user emails, credentials, or production data.";
  track("sample_loaded", { sample: "billing_sync_backlog" });
}

const pathName = window.location.pathname;
track("page_view");
if (pathName === "/" || pathName.endsWith("/") || pathName.endsWith("/index.html")) track("landing_viewed");
if (pathName.endsWith("background-job-backlog-checklist.html")) {
  track("template_opened");
  track("seo_page_viewed");
}

if (document.querySelector("#generate-button")) {
  document.querySelector("#generate-button").addEventListener("click", generateBrief);
  document.querySelector("#sample-button").addEventListener("click", loadSample);
  copyButton.addEventListener("click", () => {
    copyText(lastBriefText, copyStatus, "Copied backlog recovery brief.");
    track("copy_brief_clicked");
  });

  document.querySelectorAll(".plan-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedPlan = button.dataset.plan;
      document.querySelector("#plan-interest").value = selectedPlan;
      track("plan_selected", { plan: selectedPlan });
      track("pricing_viewed", { plan: selectedPlan });
      intentForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  intentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    track("signup_started", { plan: selectedPlan });
    const intent = {
      email: document.querySelector("#intent-email").value.trim(),
      role: document.querySelector("#intent-role").value.trim(),
      volume: document.querySelector("#backlog-volume").value.trim(),
      process: document.querySelector("#current-process").value.trim(),
      plan: document.querySelector("#plan-interest").value,
      willingness: document.querySelector("#willingness").value.trim(),
      at: new Date().toISOString(),
    };
    const key = `${STORAGE_PREFIX}_purchase_intents`;
    const intents = JSON.parse(localStorage.getItem(key) || "[]");
    intents.push(intent);
    localStorage.setItem(key, JSON.stringify(intents.slice(-50)));
    lastRemoteBody = [
      "Public early access request for Background Job Backlog Briefs.",
      "",
      `Role/team: ${intent.role || "[not provided]"}`,
      `Queue/backlog review volume: ${intent.volume || "[not provided]"}`,
      `Current queue incident review process: ${intent.process || "[not provided]"}`,
      `Plan interest: ${intent.plan}`,
      `Willingness to pay: ${intent.willingness || "[not provided]"}`,
      "",
      "Do not include queue credentials, queue URLs, job payloads, tokens, customer IDs, user emails, raw logs, PII, production data, or email addresses in this public issue.",
    ].join("\n");
    remoteIntentLink.href = `${ISSUE_URL}&body=${encodeURIComponent(lastRemoteBody)}`;
    remoteIntent.hidden = false;
    intentStatus.textContent = "You are on the early access list. Open or copy the public request if you want remote follow-up.";
    track("purchase_intent_submitted", { plan: intent.plan, hasEmail: Boolean(intent.email) });
    track("waitlist_submitted", { plan: intent.plan });
    track("signup_completed", { plan: intent.plan });
    track("remote_intent_ready", { includesEmail: false });
  });

  remoteCopyButton.addEventListener("click", () => {
    copyText(lastRemoteBody, remoteCopyStatus, "Copied request details.");
    track("remote_intent_copied");
  });

  document.querySelectorAll('a[href="#workflow"]').forEach((link) => {
    link.addEventListener("click", () => track("cta_clicked", { triggerSource: "workflow_anchor" }));
  });
}
