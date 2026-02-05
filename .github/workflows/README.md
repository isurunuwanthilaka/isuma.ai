# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Isuma.ai hiring platform.

## Workflows

### 1. UI Build Validation (`build-validation.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**
- Tests the build on Node.js 18.x and 20.x
- Runs TypeScript type checking
- Runs Next.js linter
- Builds the production application
- Uploads build artifacts for verification

**Duration:** ~3-5 minutes per Node.js version

### 2. PR Checks (`pr-checks.yml`)

**Triggers:**
- Pull requests to `main` or `develop` branches

**What it does:**
- Quick validation on Node.js 20.x
- TypeScript type checking
- ESLint checks
- Optional Prettier formatting check

**Duration:** ~2-3 minutes

## Status Badges

Add these badges to your README.md:

```markdown
![Build Status](https://github.com/isurunuwanthilaka/isuma.ai/workflows/UI%20Build%20Validation/badge.svg)
![PR Checks](https://github.com/isurunuwanthilaka/isuma.ai/workflows/PR%20Checks/badge.svg)
```

## Environment Variables Required for Build

The build workflow requires these environment variables:
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL
- `LLM_PROVIDER` - LLM provider (openai/ollama)
- `OPENAI_API_KEY` - OpenAI API key (or dummy value for build)

These are automatically set in the workflow files with test values.

## Local Testing

To test workflows locally, you can use [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflows locally
act pull_request  # Runs PR checks
act push          # Runs build validation
```

## Customization

### Adding More Node.js Versions

Edit the `matrix.node-version` in `build-validation.yml`:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 21.x]
```

### Adding Tests

When you add tests to the project, update workflows to include:

```yaml
- name: Run tests
  run: npm test
```

### Branch Protection

Consider enabling branch protection rules on GitHub:
1. Go to Settings > Branches
2. Add rule for `main` branch
3. Require status checks to pass:
   - Validate UI Build
   - Code Quality Checks
4. Require branches to be up to date before merging

## Troubleshooting

### Build fails with missing dependencies

Make sure `package-lock.json` is committed to the repository.

### TypeScript errors in CI but not locally

Ensure your local TypeScript version matches the one in `package.json`.

### Prisma client errors

The workflow generates Prisma client during `npm ci`. If issues persist, add an explicit generation step:

```yaml
- name: Generate Prisma Client
  run: npx prisma generate
```
