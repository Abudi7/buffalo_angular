# 🌳 Git Branching Strategy

## Overview
This repository follows a professional Git branching strategy with three main branches and automated CI/CD pipelines.

## Branch Structure

### 🌿 **dev** (Development)
- **Purpose**: Active development branch
- **Source**: Feature branches
- **Target**: `staging`
- **Automation**: 
  - ✅ Linting and testing
  - ✅ Security scanning
  - ✅ Code quality checks
  - ✅ Build verification

### 🚀 **staging** (Pre-Production)
- **Purpose**: Pre-production testing and validation
- **Source**: `dev` branch
- **Target**: `prod`
- **Automation**:
  - ✅ Full test suite
  - ✅ E2E testing
  - ✅ Performance testing
  - ✅ Staging deployment
  - ✅ Integration testing

### 🏭 **prod** (Production)
- **Purpose**: Production-ready code
- **Source**: `staging` branch
- **Target**: None (final branch)
- **Automation**:
  - ✅ Production build
  - ✅ Security scanning
  - ✅ Production deployment
  - ✅ Health checks
  - ✅ Release creation

## Workflow

### 1. Development Process
```bash
# Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# Work on your feature
git add .
git commit -m "feat: add new feature"

# Push and create PR to dev
git push origin feature/your-feature-name
```

### 2. Promotion Process
```bash
# Dev → Staging
git checkout staging
git pull origin staging
git merge dev
git push origin staging

# Staging → Production
git checkout prod
git pull origin prod
git merge staging
git push origin prod
```

## Branch Protection Rules

### dev Branch
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes to the branch

### staging Branch
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes to the branch
- ✅ Require linear history

### prod Branch
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes to the branch
- ✅ Require linear history
- ✅ Require conversation resolution

## Automation Features

### CI/CD Pipelines
- **dev**: Fast feedback loop with basic testing
- **staging**: Comprehensive testing and staging deployment
- **prod**: Production deployment with security scanning

### Quality Gates
- Code linting and formatting
- Unit and integration tests
- Security vulnerability scanning
- Performance testing
- E2E testing

### Deployment
- **Staging**: Automatic deployment on merge
- **Production**: Manual approval required
- **Rollback**: Automated rollback on failure

## Best Practices

### Commit Messages
Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### Pull Requests
- Clear, descriptive titles
- Detailed descriptions
- Link to issues/tickets
- Request appropriate reviewers
- Ensure all checks pass

### Code Reviews
- Review code quality and logic
- Check for security issues
- Verify test coverage
- Ensure documentation is updated
- Approve only when confident

## Emergency Procedures

### Hotfixes
For critical production issues:
```bash
# Create hotfix from prod
git checkout prod
git checkout -b hotfix/critical-issue
# Fix the issue
git commit -m "fix: critical production issue"
git push origin hotfix/critical-issue
# Create PR to prod and staging
```

### Rollback
```bash
# Rollback to previous commit
git checkout prod
git reset --hard <previous-commit-hash>
git push --force-with-lease origin prod
```

## Monitoring

### Branch Status
- Monitor CI/CD pipeline status
- Check deployment health
- Review security scan results
- Track performance metrics

### Notifications
- Slack notifications for deployments
- Email alerts for failures
- GitHub notifications for PRs
- Security alerts for vulnerabilities

---

## Quick Reference

| Branch | Purpose | CI/CD | Deployment | Reviewers |
|--------|---------|-------|------------|-----------|
| `dev` | Development | ✅ Basic | ❌ | 1 |
| `staging` | Pre-production | ✅ Full | ✅ Auto | 2 |
| `prod` | Production | ✅ Full | ✅ Manual | 2 |

## Contact
For questions about this branching strategy, contact the development team.
