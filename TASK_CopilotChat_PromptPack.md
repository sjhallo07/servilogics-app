# Copilot Chat – Best Prompts Pack (Editor, CI, Devcontainers, Cost Optimization)

How to use
- Open Copilot Chat and paste any prompt below.
- Replace placeholders like <repo>, <path>, <goal>, <limit>.
- Keep messages short; ask for a plan first, then iterate.

## 1) Project analysis and plan
Prompt:
"You are my pair programmer. Analyze this workspace and identify tech stacks (Node/Python/Rust/Solidity), build/test commands, and CI/devcontainer gaps. Propose a step-by-step plan to:
- minimize GitHub Actions minutes and storage
- keep Codespaces cost at $0 with autosuspend
- add a minimal devcontainer
- add a cost‑efficient CI workflow with filtered paths, fetch-depth: 1, caching, and 10–15 min timeouts
Return: a prioritized checklist per repo with concrete file changes."

## 2) Minimal CI workflow per stack
Prompt:
"Generate a minimal GitHub Actions CI workflow for this project with:
- push/pull_request on branches [main, master]
- filtered paths for src/lib/app/backend/server/client/public
- concurrency cancellation
- shallow checkout (fetch-depth: 1)
- cache dependencies
- Node job if package.json exists (npm ci, build if present, tests if present)
- Python job if requirements.txt exists (pip cache, pytest -q || true)
- Rust job if Cargo.lock exists (cache cargo, build/test locked)
Keep total runtime under 15 minutes and provide the final YAML."

## 3) Devcontainer minimal
Prompt:
"Create a minimal devcontainer.json for this repo:
- base image (Node 20, Python 3.11, Rust stable, or Ubuntu base as appropriate)
- no heavy postCreate commands (use 'true')
- VS Code extensions only for the detected stack
- editor defaults: formatOnSave and autoSave on focus change
Return the final devcontainer.json."

## 4) VS Code editor smart settings
Prompt:
"Produce a .vscode/settings.json that:
- enables formatOnSave
- sets Prettier as default formatter for TS/JS
- organizes imports and fixAll on save
- enables basic Python type checking and pytest discovery
- enables inline Copilot suggestions
Return the final JSON."

## 5) Branch protection guidance (post GitHub Pro)
Prompt:
"Given we have GitHub Pro, outline exact steps in GitHub Settings to add branch protection rules on main/master:
- require PR before merging
- require status checks 'CI' to pass
- require code owner reviews
- dismiss stale approvals on new commits
Explain each click path in the UI and any caveats."

## 6) Cost optimization audit (use our CSV)
Prompt:
"I will paste a usage CSV. Analyze Actions minutes, storage, Codespaces compute/storage, and Copilot premium requests. Recommend specific changes (workflows, paths, caches, timeouts, autosuspend, weekly cleanup) to keep metered costs at $0. Return a prioritized action list."

## 7) Prompt to generate tests quickly
Prompt:
"Infer testing strategy from this project and generate fast, deterministic unit tests for the most critical modules. Prefer minimal dependencies, short runtime, and skip heavy integration steps. Return test files and commands to run them locally and in CI."

## 8) Security and dependency updates
Prompt:
"Scan this project for outdated or vulnerable dependencies and propose safe upgrades (pin exact versions). Explain risk, changelog highlights, and required code changes. Provide a small PR plan with test steps."

## 9) PR description template with checklists
Prompt:
"Write a PR description for 'Optimize CI/devcontainer/CODEOWNERS' including:
- summary
- changes list (files added/updated)
- cost impact (Actions minutes, Codespaces autosuspend)
- validation steps (CI passing or skipped appropriately)
- rollback plan
Return Markdown ready to paste."

## 10) Repo-wide refactor plan (low risk)
Prompt:
"Propose low-risk refactors to improve maintainability without changing public behavior:
- lint/format setup
- folder structure rationalization
- small performance wins
- documentation updates
Provide a 3–5 step plan with estimated effort and tests to confirm behavior."

## 11) Claude (via Continue) deep architecture prompt
Prompt:
"Analyze the full project architecture, list components and data flows, identify bottlenecks and test gaps, and propose CI/devcontainer improvements to reduce time and resource usage while keeping metered spend at $0. Suggest concrete file changes."

## 12) Multi-file change protocol
Prompt:
"When proposing changes, follow this protocol:
- Plan first (bullet list, files to edit/add)
- Show complete file contents for new files
- For existing files, show minimal diffs
- Keep Actions job timeouts ≤ 15 min, use fetch-depth: 1 and caches
- If uncertain, ask clarifying questions before finalizing
Confirm before proceeding."

## 13) Quick "fix" prompt for noisy CI
Prompt:
"Our CI is noisy or slow. Identify the slowest steps and propose:
- path filters
- concurrency cancellation strategy
- test sharding or skipping flaky integration tests
- smarter caching keys
Return a patch for the workflow."

## 14) Workspace extensions recommendation
Prompt:
"Generate a .vscode/extensions.json with recommended extensions based on detected languages (Copilot, Copilot Chat, ESLint/Prettier, Python/Pylance, Rust Analyzer, Solidity). Keep it minimal."

## 15) Budget & alerts checklist
Prompt:
"Write the steps to configure GitHub Budgets and alerts:
- Actions $0 budget, alert at $0.50
- Codespaces $0 budget, alert at $0.50
- Models/Spark $0 budget, alert at $0.10
Include navigation paths and verification of 'Metered usage'."
