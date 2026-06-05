# Background Job Backlog Briefs

Static browser-local MVP for turning public-safe background job queue backlog notes or scrubbed job excerpts into a customer-ready recovery brief, missing-context checklist, validation path, owner handoff, and payload privacy flags.

## Public pages

- Landing: `https://ert93333-ops.github.io/background-job-backlog-briefs/`
- Checklist: `https://ert93333-ops.github.io/background-job-backlog-briefs/background-job-backlog-checklist.html`

## Scope

- No queue connection, retry execution, replay execution, job deletion, flush, drain execution, worker scaling, queue credentials, queue URLs, job payload upload, raw logs, customer IDs, backend, or external database.
- Shared marketing and notification credentials stay in the private root `.env` of the Hermes playbook, not in this public site directory.

## Verification

From the Hermes playbook root:

```powershell
npm run workflow:background-job-backlog
```
