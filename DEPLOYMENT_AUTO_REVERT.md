# Deployment Auto-Revert System
**Last Updated:** 2025-12-12T10:36:00Z

## Overview
The deployment workflow now includes **automatic health checks** and **auto-revert** on failures, ensuring bad deployments never stay live.

## How It Works

### 1. Deployment Trigger
- **When:** On every push to `main` branch
- **Action:** Calls Coolify API to trigger deployment
- **Response:** Validates HTTP 200 status from Coolify

### 2. Stabilization Wait
- **Duration:** 60 seconds
- **Purpose:** Allow Docker Swarm to:
  - Pull new image
  - Start new containers
  - Run health checks
  - Route traffic to new replicas

### 3. Health Check (5 retries)
- **Endpoint:** http://196.251.100.142:3000
- **Success:** HTTP 200 response
- **Retries:** 5 attempts with 10-second intervals
- **Total time:** Up to 110 seconds (60s wait + 50s retries)

### 4. Auto-Revert on Failure
If health check fails after 5 attempts:
```bash
git revert --no-edit $FAILED_COMMIT
git push origin main
```
- Creates revert commit (undoes changes)
- Push triggers new deployment automatically
- Redeploys previous working version
- Zero manual intervention

## Complete Automation Flow

### Stage 1: Dependency Update (Dependabot)
- **Time:** 10:00 AM UTC daily
- **Action:** Dependabot creates PR for dependency update
- **Workflow:** `.github/workflows/auto-merge-dependabot.yml`

### Stage 2: Build Test (Auto-Merge)
- **Trigger:** Dependabot PR created/updated
- **Steps:**
  1. Install dependencies with DATABASE_URL
  2. Run `npm run build`
  3. If build passes → auto-merge PR
  4. If build fails:
     - Single package: attempt auto-downgrade
     - Grouped update: add PR comment, exit gracefully

### Stage 3: Deployment (Auto-Deploy)
- **Trigger:** Merge to `main` branch
- **Workflow:** `.github/workflows/deploy.yml`
- **Steps:**
  1. Get current and previous commit hashes
  2. Trigger Coolify deployment
  3. Wait 60 seconds for stabilization
  4. Health check with 5 retries
  5. **Success:** Notify and complete
  6. **Failure:** Auto-revert and redeploy

### Stage 4: Auto-Revert (if needed)
- **Trigger:** Health check fails
- **Action:** Revert merge commit
- **Result:** Automatic redeployment of previous version

## Safety Mechanisms

### 1. Build-Time Protection
- ✅ TypeScript compilation errors caught
- ✅ ESLint errors caught
- ✅ Missing dependencies caught
- ❌ Runtime errors NOT caught (need health check)

### 2. Deployment-Time Protection
- ✅ Application starts successfully
- ✅ HTTP server responds
- ✅ No immediate crashes
- ✅ Automatic rollback if unhealthy

## Example Scenarios

### Scenario 1: Successful Update
```
10:00 AM - Dependabot creates PR: "bump next from 14.2.32 to 14.2.35"
10:01 AM - Auto-merge workflow: Build passes ✅
10:02 AM - PR auto-merged to main
10:02 AM - Deploy workflow triggered
10:02 AM - Coolify deployment started
10:03 AM - Health check: HTTP 200 ✅
10:03 AM - Deployment complete ✅
```

### Scenario 2: Build Failure with Auto-Downgrade
```
10:00 AM - Dependabot creates PR: "bump package from 1.0.0 to 2.0.0"
10:01 AM - Auto-merge workflow: Build fails ❌
10:02 AM - Auto-downgrade: Testing 1.5.0... Build passes ✅
10:03 AM - Commit: "downgrade package to 1.5.0 (auto-downgrade)"
10:04 AM - Build passes ✅
10:04 AM - PR auto-merged to main
10:05 AM - Deployment successful ✅
```

### Scenario 3: Runtime Failure with Auto-Revert
```
10:00 AM - Dependabot creates PR: "bump database-driver from 5.0.0 to 6.0.0"
10:01 AM - Auto-merge workflow: Build passes ✅ (compiles fine)
10:02 AM - PR auto-merged to main
10:02 AM - Deploy workflow triggered
10:02 AM - Coolify deployment started
10:03 AM - Health check: HTTP 503 ❌ (app crashes at runtime)
10:03 AM - Health check retry 1: HTTP 503 ❌
10:03 AM - Health check retry 2: HTTP 503 ❌
10:03 AM - Health check retry 3: HTTP 503 ❌
10:03 AM - Health check retry 4: HTTP 503 ❌
10:04 AM - Health check retry 5: HTTP 503 ❌
10:04 AM - AUTO-REVERT initiated 🔄
10:04 AM - Revert commit created and pushed
10:04 AM - Deploy workflow triggered (by revert push)
10:05 AM - Deployment of previous version
10:06 AM - Health check: HTTP 200 ✅
10:06 AM - System restored to working state ✅
```

### Scenario 4: Grouped Update Failure
```
10:00 AM - Dependabot creates PR: "bump react and @types/react"
10:01 AM - Auto-merge workflow: Build fails ❌
10:01 AM - Detected grouped update (no version numbers)
10:01 AM - PR comment added: "Manual review required"
10:01 AM - Workflow exits gracefully (no error emails) ✅
```

## Monitoring

### Check Recent Deployments
```bash
# List recent deploy workflow runs
gh run list --workflow=deploy.yml --limit 10

# View specific deployment details
gh run view <run-id>

# View deployment logs
gh run view <run-id> --log
```

### Check Auto-Merge Status
```bash
# List recent auto-merge runs
gh run list --workflow=auto-merge-dependabot.yml --limit 10

# Check for failed builds
gh run list --workflow=auto-merge-dependabot.yml --status failure
```

### Check for Reverts
```bash
# View recent commits (look for revert commits)
git log --oneline --graph -20

# Search for revert commits
git log --grep="Revert" --oneline
```

### Application Health
```bash
# Check application status
curl -I http://196.251.100.142:3000

# Monitor Docker Swarm services
ssh root@196.251.100.142 'docker service ls'
ssh root@196.251.100.142 'docker service ps hand2hand_app'
```

## Troubleshooting

### Issue: Deployment trigger fails
**Symptom:** "❌ Deployment trigger failed with status XXX"

**Causes:**
- Coolify API token expired
- Coolify server unreachable
- Application UUID changed

**Solutions:**
```bash
# Verify Coolify API token
gh secret set COOLIFY_API_TOKEN --body '<new-token>'

# Test Coolify API manually
curl -X GET "http://196.251.100.142:8000/api/v1/deploy?uuid=dw4040kw4ok440w48o4k4880&force=false" \
  -H "Authorization: Bearer <token>"
```

### Issue: Health check always fails
**Symptom:** All deployments revert, even for working code

**Causes:**
- Application takes longer than 110 seconds to start
- Wrong health check URL
- Firewall blocking health check

**Solutions:**
```bash
# Increase wait time in deploy.yml (line ~55)
sleep 120  # Instead of 60

# Verify application is accessible
curl -v http://196.251.100.142:3000

# Check Docker Swarm service logs
ssh root@196.251.100.142 'docker service logs hand2hand_app --tail 100'
```

### Issue: Revert loop (keeps reverting back and forth)
**Symptom:** Multiple revert commits in a row

**Causes:**
- Both current and previous commits are broken
- Health check itself is broken

**Solutions:**
```bash
# Manually deploy known good commit
git checkout <known-good-commit>
git push origin main --force

# Or disable auto-revert temporarily
gh workflow disable deploy.yml
# Fix the issue manually
gh workflow enable deploy.yml
```

### Issue: Auto-downgrade not working
**Symptom:** PRs fail but don't downgrade

**Causes:**
- Grouped dependency update (no version numbers)
- Auto-downgrade script missing
- No working version found between current and failed

**Check:**
```bash
# View PR title to check if grouped
gh pr view <pr-number>

# Check if auto-downgrade script exists
ls -la scripts/auto-downgrade.sh

# Check workflow logs for downgrade attempt
gh run view <run-id> --log
```

## Best Practices

### 1. Monitor Daily
- Check deployment workflow status each morning
- Review any revert commits
- Investigate recurring failures

### 2. Test Major Updates Locally
- Major version updates (e.g., Next 14 → 16)
- Breaking changes documented in changelogs
- Test locally before merging manually

### 3. Review Grouped Updates Manually
- "bump the production-dependencies group"
- "bump react and @types/react"
- Multiple packages = higher risk

### 4. Keep Backups Current
- Daily backups run at 9:00 AM UTC
- Verify GoFile uploads succeed
- Test restore procedure quarterly

### 5. Health Check Tuning
- Adjust wait time if app slow to start
- Increase retry count for flaky health checks
- Add custom /api/health endpoint for more robust checks

## Files Reference

### Workflows
- `.github/workflows/auto-merge-dependabot.yml` - Auto-merge with downgrade
- `.github/workflows/deploy.yml` - Deploy with health check and revert
- `.github/workflows/daily-backup.yml` - Daily backups (9 AM UTC)
- `.github/workflows/weekly-server-updates.yml` - Weekly maintenance (11 AM Monday)

### Scripts
- `scripts/auto-downgrade.sh` - Find latest working version
- `scripts/daily-backup.sh` - Server backup to GoFile
- `scripts/server-auto-update.sh` - Weekly server maintenance

### Documentation
- `DEPLOYMENT_AUTO_REVERT.md` - This file
- `AUTO_UPDATE_SYSTEM.md` - Complete automation documentation
- `WARP_AGENT_CONTEXT.md` - Agent context with Rules 44-46
- `WARP.md` - Codebase documentation

## Contact

**Repository:** https://github.com/markb7258/Hand-2-Hand
**Server:** 196.251.100.142
**Application:** http://196.251.100.142:3000
