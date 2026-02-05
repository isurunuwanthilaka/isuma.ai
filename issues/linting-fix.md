## Problem
The UI Build Validation workflow is failing at the linting step with the following error:

```
Invalid project directory provided, no such directory: /home/runner/work/isuma.ai/isuma.ai/lint
```

**Failing Job:** https://github.com/isurunuwanthilaka/isuma.ai/actions/runs/21655241581/job/62438461210

## Root Cause
The `npm run lint` command is executing `next lint` without specifying a valid project directory. By default, Next.js linter is looking for a `lint` directory which doesn't exist in the repository.

## Solution
Update the `lint` script in `package.json` to specify the correct source directory:

**Option 1:** If source code is in `src` directory:
```json
"lint": "next lint --dir ./src"
```

**Option 2:** If source code is in the project root:
```json
"lint": "next lint --dir ."
```

## Additional Context
- Workflow file: `.github/workflows/build-validation.yml` (line 39)
- Commit: d246fd943b0430cd326a7cf0bb516bd98c2188d0
- Affects both Node.js 18.x and 20.x matrix builds