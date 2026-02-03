# Development Branch Setup

This document explains the branching strategy for the Anki SDK project.

## Overview

The project uses a two-branch strategy:

- **`main`**: Production-ready code that triggers releases
- **`dev`**: Active development branch for all feature work

## Creating the Dev Branch (One-Time Setup)

The `dev` branch should be created from the latest stable release on `main`:

```bash
# Ensure you have the latest main branch
git checkout main
git pull origin main

# Create and push the dev branch
git checkout -b dev
git push origin dev

# Set dev as the default branch for new PRs (optional, repository setting)
# This can be done in GitHub Settings > Branches > Default branch
```

## Branch Protection (Recommended)

Configure branch protection rules in GitHub:

### For `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass (tests, lint, build)
- ✅ Only allow merges from `dev` branch
- ✅ Do not allow direct pushes

### For `dev` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass (tests, lint, build)
- ✅ Allow feature branches to merge in
- ✅ Do not allow direct pushes

## Workflow

```
feature/* ──> dev ──> main ──> Release
   │         │         │
   └─ PR ────┘         │
             └─ PR ────┘
```

1. Create feature branches from `dev`
2. Open PRs targeting `dev`
3. After testing and review, merge to `dev`
4. Periodically (for releases), merge `dev` to `main`
5. Merges to `main` automatically trigger releases

## Branch Deletion Policy

After a branch is merged:

- ✅ **Keep**: `main` and `dev` branches
- ❌ **Delete**: All feature branches (e.g., `feature/*`, `fix/*`, `copilot/*`)

This can be automated in GitHub Settings > Pull Requests:
- ✅ Enable "Automatically delete head branches"

## Benefits

- **More meaningful releases**: Releases happen when features are ready, not at every PR merge
- **Better testing**: Multiple features can be tested together on `dev` before release
- **Stable main branch**: `main` always represents a production-ready state
- **Clear history**: Easier to track what went into each release
