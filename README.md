<img width="1194" height="524" alt="image" src="https://github.com/user-attachments/assets/a0efec03-4408-449c-a3bf-e14c6f00171c" />

# Creative Workstation Readiness Checker

Creative Workstation Readiness Checker is a small IT support prototype for evaluating whether creative workstations are ready to hand off to designers, editors, motion artists, and 3D users.

The project combines a local Python diagnostics script with a Next.js dashboard. The script generates workstation readiness reports as JSON files, and the dashboard turns those reports into a fleet overview plus individual workstation detail pages.

## Why This Project Exists

Creative teams often need more than a generally healthy computer. A workstation may boot normally but still be unprepared for Adobe, Figma, Blender, Cinema 4D, or media-heavy production work.

This project helps IT support teams answer practical handoff questions:

- Does the machine have enough RAM for creative workflows?
- Is there enough free disk space for cache, exports, and project media?
- Is the network available for license checks and cloud collaboration?
- Are expected creative tools installed?
- What should IT fix before assigning this workstation to a user?

## Current State

The app currently works as a local, file-based prototype.

```text
Python diagnostics -> unique JSON reports -> local report folder -> Next.js dashboard
```

Each diagnostics run creates a unique report in:

```text
data/reports/
```

The latest report is also written to:

```text
data/report.json
```

The Next.js dashboard reads the report collection from `data/reports/` and renders:

- A fleet readiness dashboard
- A full workstation inventory table
- Individual workstation report pages
- Score breakdowns derived from report data
- System health cards
- Creative tools installed/missing sections
- IT action-item recommendations
- Device identity/fingerprint display
- Diagnostic pipeline summary
- Collapsible raw JSON report previews

<div align="center">
  <img src="https://github.com/user-attachments/assets/787302ef-f0c6-4475-828b-df1909347449" width="520" alt="Dashboard Fleet Overview" />
  <img src="https://github.com/user-attachments/assets/9b833fdf-7b25-455d-a49d-21769a34be88" width="338" alt="Workstation Detail Page" />
</div>

There is no database, login, cloud storage, or upload service yet. The local report folder intentionally stands in for the storage layer that would later be replaced by S3, Azure Blob, Supabase, Postgres, or another backend.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Python standard library diagnostics script
- Static JSON report files

## Setup

Install dependencies:

```bash
npm install
```

Start the dashboard:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Run Diagnostics

Generate a fresh report:

```bash
python diagnostics/diagnostics.py
```

The script uses only Python standard library modules. It collects:

- Hostname
- Operating system
- CPU information when available
- Total RAM
- Disk total/free
- Network connectivity
- Best-effort creative tool detection
- Readiness score
- Recommendations

If Python is not installed on a target workstation, install Python first or package the script later as an executable.

## How Reports Work

Each report has a unique ID generated from the hostname and timestamp.

Example:

```text
data/reports/creative-ws-01-20260616-000000z.json
```

The dashboard treats every JSON file in `data/reports/` as one workstation report. Clicking a workstation in the inventory table opens an individual detail page:

```text
/workstations/{reportId}
```

## Validation

Run lint:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```

## What Can Be Improved

The next meaningful improvements are:

- Add an upload endpoint so diagnostics can POST reports to the app.
- Replace local JSON files with S3, Azure Blob, Supabase, Postgres, or another persistent store.
- Add report history per workstation instead of treating every report as a standalone file.
- Add search, filtering, and sorting to the fleet table.
- Add stale-report warnings for machines that have not checked in recently.
- Add MDM integration with Jamf, Kandji, Intune, or similar tools.
- Add Adobe Creative Cloud license assignment checks.
- Improve software detection through package inventory instead of filesystem best-effort checks.
- Add exportable IT support reports for tickets or onboarding records.
- Add authentication and role-based access before exposing real workstation data.

## Production Direction

A production version would likely use this flow:

```text
diagnostics.py on each workstation
  -> POST /api/reports
  -> database or object storage
  -> Next.js dashboard fetches reports
  -> IT reviews fleet and individual workstation readiness
```

The current local architecture is intentionally close to that shape. The main missing bridge is replacing `data/reports/` with a real ingestion and storage layer.
