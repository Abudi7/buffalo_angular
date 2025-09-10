# 🔒 Branch Protection Setup Guide

## Manual Setup Instructions

Since GitHub CLI is not installed, please follow these manual steps to set up branch protection rules:

### 1. Navigate to Repository Settings

1. Go to your GitHub repository: https://github.com/Abudi7/buffalo_angular
2. Click on **Settings** tab
3. Click on **Branches** in the left sidebar

### 2. Set Up Branch Protection Rules

#### 🌿 **dev** Branch Protection

1. Click **Add rule** or **Add branch protection rule**
2. In **Branch name pattern**, enter: `dev`
3. Configure the following settings:
   - ✅ **Require a pull request before merging**
     - ✅ **Require approvals**: 1
     - ✅ **Dismiss stale PR approvals when new commits are pushed**
   - ✅ **Require status checks to pass before merging**
     - ✅ **Require branches to be up to date before merging**
     - Add status checks: `ci-dev`
   - ✅ **Require conversation resolution before merging**
   - ✅ **Restrict pushes that create matching branches**
   - ✅ **Allow force pushes**: ❌ (unchecked)
   - ✅ **Allow deletions**: ❌ (unchecked)
   - ✅ **Allow squash merging**
   - ❌ **Allow merge commits** (unchecked)
   - ✅ **Allow rebase merging**
   - ✅ **Automatically delete head branches**

#### 🚀 **staging** Branch Protection

1. Click **Add rule** or **Add branch protection rule**
2. In **Branch name pattern**, enter: `staging`
3. Configure the following settings:
   - ✅ **Require a pull request before merging**
     - ✅ **Require approvals**: 2
     - ✅ **Dismiss stale PR approvals when new commits are pushed**
   - ✅ **Require status checks to pass before merging**
     - ✅ **Require branches to be up to date before merging**
     - Add status checks: `ci-staging`
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require linear history**
   - ✅ **Restrict pushes that create matching branches**
   - ✅ **Allow force pushes**: ❌ (unchecked)
   - ✅ **Allow deletions**: ❌ (unchecked)
   - ✅ **Allow squash merging**
   - ❌ **Allow merge commits** (unchecked)
   - ✅ **Allow rebase merging**
   - ✅ **Automatically delete head branches**

#### 🏭 **prod** Branch Protection

1. Click **Add rule** or **Add branch protection rule**
2. In **Branch name pattern**, enter: `prod`
3. Configure the following settings:
   - ✅ **Require a pull request before merging**
     - ✅ **Require approvals**: 2
     - ✅ **Dismiss stale PR approvals when new commits are pushed**
   - ✅ **Require status checks to pass before merging**
     - ✅ **Require branches to be up to date before merging**
     - Add status checks: `ci-prod`
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require linear history**
   - ✅ **Restrict pushes that create matching branches**
   - ✅ **Allow force pushes**: ❌ (unchecked)
   - ✅ **Allow deletions**: ❌ (unchecked)
   - ✅ **Allow squash merging**
   - ❌ **Allow merge commits** (unchecked)
   - ✅ **Allow rebase merging**
   - ✅ **Automatically delete head branches**

### 3. Save Settings

1. Click **Create** or **Save changes** for each branch rule
2. Verify all three branches have protection rules enabled

## Verification

After setting up the rules, verify by:

1. Trying to push directly to `dev`, `staging`, or `prod` branches
2. Creating a pull request and ensuring the required checks are enforced
3. Checking that force pushes are blocked

## Quick Reference

| Branch    | Approvals | Status Checks | Linear History | Force Push |
| --------- | --------- | ------------- | -------------- | ---------- |
| `dev`     | 1         | ✅            | ❌             | ❌         |
| `staging` | 2         | ✅            | ✅             | ❌         |
| `prod`    | 2         | ✅            | ✅             | ❌         |

## Troubleshooting

### If you can't see the branch protection options:

1. Make sure you have admin access to the repository
2. Check that the branches exist and have been pushed to GitHub
3. Ensure you're in the correct repository

### If status checks are not available:

1. Wait for the first CI/CD run to complete
2. The status check names will appear after the first workflow run
3. You can add them manually: `ci-dev`, `ci-staging`, `ci-prod`

## Next Steps

After setting up branch protection:

1. Test the workflow by creating a feature branch
2. Create a pull request to `dev`
3. Verify all checks are running
4. Test the promotion process: `dev` → `staging` → `prod`

## Support

If you encounter any issues:

1. Check GitHub's documentation on branch protection
2. Verify repository permissions
3. Contact the development team for assistance

---

**Note**: These settings ensure a professional, secure Git workflow that prevents accidental pushes and enforces code quality standards.
