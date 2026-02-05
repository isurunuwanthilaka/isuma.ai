# CI/CD Guide for Isuma.ai

## Overview

This project uses GitHub Actions for continuous integration and deployment validation. All workflows are located in `.github/workflows/`.

## Workflows

### 1. UI Build Validation (`build-validation.yml`)

**Purpose:** Comprehensive build validation across multiple Node.js versions

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

**Jobs:**
- ✅ TypeScript type checking
- ✅ ESLint code quality checks
- ✅ Production build compilation
- ✅ Build artifact upload (for debugging)

**Matrix Testing:**
- Node.js 18.x
- Node.js 20.x

**Estimated Duration:** 3-5 minutes per Node.js version

### 2. PR Checks (`pr-checks.yml`)

**Purpose:** Fast quality checks for pull requests

**Triggers:**
- Pull requests targeting `main` or `develop`

**Jobs:**
- ✅ TypeScript type checking
- ✅ ESLint validation
- ✅ Optional Prettier formatting check

**Runtime:** Node.js 20.x only

**Estimated Duration:** 2-3 minutes

## Status Badges

The README includes badges showing the current status:

![Build Status](https://github.com/isurunuwanthilaka/isuma.ai/workflows/UI%20Build%20Validation/badge.svg)
![PR Checks](https://github.com/isurunuwanthilaka/isuma.ai/workflows/PR%20Checks/badge.svg)

## Environment Variables

The build workflow requires these environment variables (automatically set with test values):

```yaml
DATABASE_URL: "file:./dev.db"
NEXTAUTH_SECRET: "test-secret-for-build"
NEXTAUTH_URL: "http://localhost:3000"
LLM_PROVIDER: "openai"
OPENAI_API_KEY: "test-key"
```

## Local Validation

Before pushing, run these commands locally:

```bash
# Install dependencies
npm ci

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build
npm run build
```

## Branch Protection (Recommended)

To enforce quality checks:

1. Go to **Settings** → **Branches** in GitHub
2. Add a branch protection rule for `main`
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Select required checks:
   - ✅ Validate UI Build
   - ✅ Code Quality Checks

## Workflow Modifications

### Adding New Node.js Versions

Edit `build-validation.yml`:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 21.x]  # Add new versions here
```

### Adding Tests

When you add test scripts, update both workflows:

```yaml
- name: Run tests
  run: npm test
```

### Adding Database Migrations

If builds require database setup:

```yaml
- name: Setup database
  run: |
    npx prisma generate
    npx prisma db push
  env:
    DATABASE_URL: "file:./dev.db"
```

## Troubleshooting

### Build fails with "npm ci" errors

**Issue:** Missing or corrupted `package-lock.json`

**Solution:**
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

### TypeScript errors in CI but not locally

**Issue:** Different TypeScript versions

**Solution:**
```bash
# Use exact version from package.json
npm ci
```

### Prisma client errors

**Issue:** Prisma client not generated

**Solution:** Add explicit generation step to workflow:
```yaml
- name: Generate Prisma Client
  run: npx prisma generate
```

### Build timeout

**Issue:** Build takes too long (>6 hours)

**Solution:**
- Optimize build process
- Use caching more effectively
- Consider splitting into multiple jobs

## Monitoring

### View Workflow Runs

1. Go to **Actions** tab in GitHub
2. Select a workflow from the left sidebar
3. Click on a specific run to see details

### Download Artifacts

Build artifacts are kept for 7 days:

1. Go to workflow run page
2. Scroll to **Artifacts** section
3. Download `build-output-node-X.x`

### Workflow Logs

Click on any job step to expand and view detailed logs.

## Best Practices

1. **Always run checks locally** before pushing
2. **Keep workflows fast** - optimize where possible
3. **Use caching** - npm cache is enabled by default
4. **Monitor failures** - fix broken builds immediately
5. **Update dependencies** - keep actions up to date

## GitHub Actions Billing

- ✅ **Free** for public repositories (unlimited minutes)
- 💰 **Metered** for private repositories (2,000 minutes/month free)

Current workflows use approximately:
- Build Validation: ~6-10 minutes per run (2 Node.js versions)
- PR Checks: ~2-3 minutes per run

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Next.js CI/CD Best Practices](https://nextjs.org/docs/deployment#continuous-integration-ci)

---

**Last Updated:** February 4, 2026
**Maintained by:** Development Team
