# Post-PR Setup Instructions

After this PR is merged, the following manual steps need to be completed:

## 1. Create the Dev Branch

The `dev` branch has been prepared but needs to be pushed to the remote repository. Run:

```bash
# From the main branch (after merging this PR)
git checkout main
git pull origin main

# Create and push the dev branch
git checkout -b dev
git push origin dev
```

## 2. Update Default Branch for PRs (Optional)

In GitHub repository settings:

1. Go to **Settings** > **Branches**
2. Change the default branch to `dev`
3. This ensures new PRs target `dev` by default instead of `main`

## 3. Configure Branch Protection Rules (Recommended)

### For `main` branch:
1. Go to **Settings** > **Branches** > **Branch protection rules**
2. Add rule for `main`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
     - Select: `Test`, `Build` (from CI workflow)
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

### For `dev` branch:
1. Add rule for `dev`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
     - Select: `Test`, `Build` (from CI workflow)
   - ✅ Require branches to be up to date before merging

## 4. Enable Automatic Branch Deletion

In GitHub repository settings:

1. Go to **Settings** > **General** > **Pull Requests**
2. ✅ Enable "Automatically delete head branches"

This ensures merged feature branches are automatically cleaned up, keeping only `main` and `dev`.

## 5. Update Existing PRs and Workflows

- Update any existing open PRs to target `dev` instead of `main`
- Notify team members about the new branching strategy
- Review AGENTS.md for GitHub Copilot agent configuration

## Verification

After setup, verify:

```bash
# Check branches exist
git branch -r | grep -E "(main|dev)"

# Should show:
#   origin/dev
#   origin/main

# Check branch protection
# Go to Settings > Branches and verify both main and dev have rules
```

## Reference Documents

- `AGENTS.md` - GitHub Copilot agent configuration and development guidelines
- `DEVELOPMENT.md` - Detailed branching strategy and workflow
- `readme.md` - Updated contributing section with branching info
