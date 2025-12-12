# Automated Update System
**Last Updated:** 2025-12-12T10:22:00Z

## Overview
Hand-2-Hand uses a fully automated update system for dependencies, backups, and server maintenance.

## Daily Schedule (UTC)

### 9:00 AM - Daily Backups
- **Workflow:** `.github/workflows/daily-backup.yml`
- **Script:** `scripts/daily-backup.sh`
- **Backs up:**
  - All Docker volumes
  - Application files (excluding node_modules, .next, .git)
  - SSL certificates (Traefik certs)
  - Configuration files (docker-stack.yml, .env.local, .bashrc)
- **Upload:** GoFile (Account Token: z9yW4VXg5Hu5qzNk7Rn0ywidKgvmTwsu)
- **Format:** `YYYY-MM-DD-server-snapshot.tar.gz`
- **Retention:** 30 days (manual cleanup via GoFile dashboard)
- **Manual trigger:** `gh workflow run daily-backup.yml`

### 10:00 AM - Dependabot Checks
- **Config:** `.github/dependabot.yml`
- **Workflow:** `.github/workflows/auto-merge-dependabot.yml`
- **Checks:** NPM packages and GitHub Actions
- **Policy:** Stable versions only (ignores alpha/beta/rc/canary/next)
- **Groups:**
  - `production-dependencies` (minor + patch)
  - `development-dependencies` (minor + patch)
- **Auto-merge:** Enabled if build passes
- **Auto-downgrade:** If build fails, finds latest working stable version

## Weekly Schedule (UTC)

### Monday 11:00 AM - Server Maintenance
- **Workflow:** `.github/workflows/weekly-server-updates.yml`
- **Script:** `scripts/server-auto-update.sh`
- **Safety check:** Only runs if all Dependabot PRs are merged
- **Updates:**
  - OS packages (apt-get upgrade)
  - Docker engine (latest stable)
  - Docker images (postgres:16-alpine, node:20-alpine)
  - Coolify CLI
- **Deployment:** Rolling update via Docker Swarm (zero downtime)
- **Manual trigger:** `gh workflow run weekly-server-updates.yml`

## How It Works

### 1. Dependabot Creates PRs
- Checks for updates daily at 10:00 AM UTC
- Creates PRs for stable versions only
- Groups related dependencies together
- Adds labels: `dependencies`, `npm` or `github-actions`, `automated`

### 2. Auto-Merge Workflow
- Triggers automatically on Dependabot PRs
- Checks out PR branch
- Installs dependencies with `--legacy-peer-deps`
- Runs `npm run build` to test
- **If build passes:**
  - Auto-merges PR with squash commit
  - Triggers deployment to server
- **If build fails:**
  - Runs auto-downgrade script
  - Finds latest working stable version between current and failed
  - Creates new commit with working version
  - Re-runs build
  - Auto-merges if successful

### 3. Deployment
- On merge to `main`, GitHub Actions deploys to server
- Docker Swarm performs rolling update (one replica at a time)
- Health checks ensure smooth transition
- Old replicas removed only after new replicas healthy

## GitHub Repository Settings

### Security Alerts
- ✅ Dependabot alerts enabled
- ✅ Dependabot security updates enabled
- ✅ Automated security fixes enabled

### Required Secrets
- `SERVER_SSH_KEY`: Private SSH key for server access (daily backups, weekly updates)
- `COOLIFY_API_TOKEN`: Coolify API token for deployments

### Branch Protection (Recommended)
For production deployments, consider enabling:
- Require pull request before merging
- Require status checks to pass (auto-merge workflow)
- Require branches to be up to date

## Monitoring

### Check Dependabot Status
```bash
# List open Dependabot PRs
gh pr list --author 'dependabot[bot]' --state open

# Check recent auto-merge runs
gh run list --workflow=auto-merge-dependabot.yml --limit 10

# View specific run details
gh run view <run-id> --log-failed
```

### Check Backup Status
```bash
# Check recent backup runs
gh run list --workflow=daily-backup.yml --limit 10

# Manually trigger backup
gh workflow run daily-backup.yml
```

### Check Server Update Status
```bash
# Check recent server update runs
gh run list --workflow=weekly-server-updates.yml --limit 10

# Manually trigger server updates
gh workflow run weekly-server-updates.yml
```

## Troubleshooting

### Auto-Merge Workflow Failing

**Issue:** "Missing required environment variable: DATABASE_URL"
- **Cause:** Prisma generate needs DATABASE_URL at build time
- **Solution:** Fixed in workflow (dummy DATABASE_URL for builds)
- **Status:** ✅ Resolved as of 2025-12-12

**Issue:** Build fails with new dependency version
- **Cause:** Breaking changes in dependency
- **Solution:** Auto-downgrade script finds latest working version
- **Manual fix:** Check PR comments for downgrade details

**Issue:** PRs not auto-merging
- **Check:** `gh run list --workflow=auto-merge-dependabot.yml --limit 5`
- **Debug:** `gh run view <run-id> --log-failed`
- **Common causes:**
  - Build failures (TypeScript errors, ESLint errors)
  - Peer dependency conflicts
  - Breaking API changes

### Backup Failures

**Issue:** SSH connection fails
- **Check:** `SERVER_SSH_KEY` secret is set correctly
- **Fix:** Regenerate and update SSH key secret

**Issue:** GoFile upload fails
- **Check:** GoFile token is valid (z9yW4VXg5Hu5qzNk7Rn0ywidKgvmTwsu)
- **Fix:** Verify token at https://gofile.io/myProfile

**Issue:** Backup script fails on server
- **Check:** Docker daemon running
- **Check:** Sufficient disk space
- **Manual run:** `ssh root@196.251.100.142 '/root/Hand-2-Hand/scripts/daily-backup.sh'`

### Server Update Failures

**Issue:** "Cannot proceed - open Dependabot PRs"
- **Cause:** Safety check - won't update server with pending dependency changes
- **Solution:** Merge or close all Dependabot PRs first
- **Check:** `gh pr list --author 'dependabot[bot]' --state open`

**Issue:** Coolify deployment fails
- **Check:** `COOLIFY_API_TOKEN` secret is valid
- **Fix:** Regenerate token from Coolify dashboard (http://196.251.100.142:8000)

## Best Practices

### Reviewing Dependabot PRs
1. Check the changelog for breaking changes
2. Review the auto-merge workflow run logs
3. If build passes, PR will auto-merge
4. If build fails, check auto-downgrade results
5. For major version bumps, review manually before merge

### Backup Management
1. Monitor GoFile storage usage monthly
2. Delete backups older than 30 days manually
3. Test restore procedure quarterly
4. Keep at least 7 days of backups at all times

### Server Maintenance
1. Review server update logs after each run
2. Monitor application health after updates
3. Check Docker Swarm status: `ssh root@196.251.100.142 'docker service ls'`
4. Verify SSL certificates: `curl -I https://h2hmissions.com/`

## Emergency Procedures

### Disable Auto-Merge
```bash
# Temporarily disable by updating workflow
gh workflow disable auto-merge-dependabot.yml

# Re-enable when ready
gh workflow enable auto-merge-dependabot.yml
```

### Restore from Backup
1. Download latest backup from GoFile
2. SSH to server: `ssh root@196.251.100.142`
3. Extract backup: `tar xzf YYYY-MM-DD-server-snapshot.tar.gz`
4. Stop services: `docker stack rm hand2hand`
5. Restore volumes: `docker run --rm -v <volume>:/volume -v $(pwd)/volumes:/backup alpine sh -c "cd /volume && tar xzf /backup/<volume>.tar.gz"`
6. Redeploy: `docker stack deploy -c docker-stack.yml hand2hand`

### Rollback Deployment
```bash
# Via GitHub (revert merge commit)
gh pr create --title "Revert: <commit-message>" --body "Rolling back failed deployment"

# Via server (manual)
ssh root@196.251.100.142
cd /root/Hand-2-Hand
git reset --hard <previous-commit-hash>
docker build -t hand-2-hand:latest .
docker service update --image hand-2-hand:latest hand2hand_app
```

## Files Reference

### Configuration
- `.github/dependabot.yml` - Dependabot configuration
- `.github/workflows/auto-merge-dependabot.yml` - Auto-merge workflow
- `.github/workflows/daily-backup.yml` - Daily backup workflow
- `.github/workflows/weekly-server-updates.yml` - Weekly maintenance workflow
- `.github/workflows/deploy.yml` - Deployment workflow

### Scripts
- `scripts/daily-backup.sh` - Backup script (runs on server)
- `scripts/auto-downgrade.sh` - Auto-downgrade script (runs in GitHub Actions)
- `scripts/server-auto-update.sh` - Server maintenance script (runs on server)

### Documentation
- `AUTO_UPDATE_SYSTEM.md` - This file
- `WARP_AGENT_CONTEXT.md` - Complete agent context and rules
- `WARP.md` - Codebase documentation for Warp agents

## Contact

**Repository:** https://github.com/markb7258/Hand-2-Hand
**Server:** 196.251.100.142
**Coolify:** http://196.251.100.142:8000
**Website:** http://196.251.100.142:3000 (will be https://h2hmissions.com)
