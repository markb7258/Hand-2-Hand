# Automatic Dependency Update System (Rule 60)

This document describes the fully automated update system that keeps NPM dependencies, GitHub Actions, and the Server System (OS, Docker, Coolify) up-to-date with zero manual intervention and a guarantee of stability.

## Overview
The system consists of three parts:

1. Dependabot configuration for daily updates of NPM packages and GitHub Actions.
2. Auto-Downgrade system that automatically finds the latest working version when an update breaks the build.
3. Weekly server maintenance that updates OS packages, Docker, Coolify CLI, and redeploys the application.

## Schedule
- NPM + GitHub Actions updates: Daily at 10:00 AM UTC
- Weekly server updates: Monday at 10:00 AM UTC (only if no open Dependabot PRs)

## Files Added
- `.github/dependabot.yml` – Daily checks for npm and github-actions
- `.github/workflows/auto-merge-dependabot.yml` – Tests PRs, auto-downgrades on failure, merges on success
- `.github/workflows/weekly-server-updates.yml` – Weekly server updates via SSH
- `scripts/auto-downgrade.sh` – Tries versions between current and failed to find a passing build
- `scripts/server-auto-update.sh` – Performs OS/Docker/Coolify maintenance and redeploys app

## Auto-Downgrade System
When a Dependabot PR fails to build, the workflow calls `scripts/auto-downgrade.sh` with:

```
<package-name> <current-version> <failed-version>
```

The script:
- Fetches all versions of the package from npm
- Filters versions between current and failed (exclusive)
- Tests each version (newest first):
  - `npm install --legacy-peer-deps <pkg>@<version>`
  - `npm run build`
- On the first success, writes the version to `/tmp/working-version.txt`
- The workflow commits/pushes that version and re-runs the build, then merges the PR

## Weekly Server Updates
The weekly workflow performs:
1. Safety check: Ensures there are no open Dependabot PRs (using `gh pr list`)
2. SSH into the server (root@196.251.100.142) using the `SERVER_SSH_KEY` secret
3. Copies and runs `scripts/server-auto-update.sh` remotely, which:
   - Updates OS packages (apt/yum)
   - Updates Docker/Coolify related components
   - Updates Coolify CLI
   - Triggers a redeploy via Coolify API

## Required GitHub Secrets
Set these secrets in the repository:
- `COOLIFY_API_TOKEN` – Token for Coolify API calls (already used by deploy workflow)
- `SERVER_SSH_KEY` – Private SSH key for root access to `196.251.100.142`

### Generating and adding SERVER_SSH_KEY
1. On your local machine, generate a key (ed25519 recommended):
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/hand2hand-ci -N '' -C 'hand2hand-ci'
   ```
2. Add the public key to the server's `~/.ssh/authorized_keys` for `root` on 196.251.100.142.
3. In GitHub, go to Settings → Secrets and variables → Actions → New repository secret:
   - Name: `SERVER_SSH_KEY`
   - Value: contents of `~/.ssh/hand2hand-ci` (private key)

## Notes
- The auto-downgrade script uses `jq` and standard UNIX tools. Ensure the GitHub runner has `jq` (Ubuntu images include it).
- NPM installs use `--legacy-peer-deps` to avoid peer conflicts (per project rules).
- The weekly job uses `gh` to check Dependabot PRs; GitHub-hosted runners come with `gh` preinstalled.
- Server maintenance script expects Coolify at `http://localhost:8000` on the server and uses the `COOLIFY_API_TOKEN`.

## Verification
- Scripts are made executable by CI via `chmod +x` before execution.
- After merge, pushes to `main` will continue to auto-deploy via existing `deploy.yml`.

## Troubleshooting
- If auto-downgrade cannot find a working version, the job fails and will not merge. Review logs and adjust dependency ranges.
- If weekly maintenance fails due to open Dependabot PRs, merge or close them and re-run the job manually via `workflow_dispatch`.
