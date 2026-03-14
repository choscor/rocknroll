---
description: Perform a structured code review of the current repository changes, summarizing issues, risks, and concrete improvement suggestions.
model: opus
---

# Code Review Command

Run a focused, tooling-aware code review of the user’s current work (diffs, changed files, or a specific area of the repo), then synthesize clear feedback and follow-up actions.

## Workflow

### Step 1: Clarify Review Scope (if needed)

- If the user’s request is ambiguous, use the AskUserQuestion tool to clarify what to review:
  - Options might include: “Only staged changes”, “Entire diff vs main”, “Specific files listed by user”.
- If the user already specified a clear scope (e.g. “review changes in `src/ui/chat`”), skip this step.

### Step 2: Gather Code Context

Use the Task tool to invoke a general-purpose agent that can read code and diffs:
- subagent_type: generalPurpose
- description: Gather code review context
- prompt: >
  Collect all relevant context for a code review of the selected scope:
  - Read the git status and diff for the scope.
  - Identify the primary languages and frameworks in the changed files.
  - Load the most important related files (types, shared utilities, tests).
  Summarize the key changes and any existing tests that touch this code.
- model: haiku

Wait for the agent to complete and capture its summary of what changed and which files/tests are involved.

### Step 3: Run the Code Review Agent

Use the Task tool again to perform the actual review:
- subagent_type: generalPurpose
- description: Perform structured code review
- prompt: >
  Based on the collected context, perform a structured code review of the selected changes.
  Focus on:
  - Correctness and potential bugs.
  - API and type contracts consistency.
  - Security and data handling concerns.
  - Performance or complexity hotspots.
  - Test coverage: whether existing tests are sufficient and what additional tests to add.
  - Code style, naming, and maintainability, following the project’s existing patterns.
  Return a structured report with sections for Strengths, Issues, Suggestions, and Testing Recommendations.
- model: haiku

Wait for the agent to complete and capture the structured review report.

### Step 4: (Optional) Propose Concrete Changes

If the user asked for help fixing issues (not just review), you may:

- Use the Skill tool to invoke relevant skills (for example `add-tests`, `refactor-service`, or `create-api-endpoint`) to draft concrete code changes and tests based on the review findings.
- Keep this step separate from the review itself so the user can distinguish between diagnosis and proposed fixes.

## Critical Requirements

1. **Respect the user’s scope**: Only review the files or diff ranges the user requested unless they explicitly allow expanding scope.
2. **Use Task Tool for analysis**: Do NOT use bash commands to run the review logic; use the Task tool for both context gathering and review analysis.
3. **Be stack-aware**: Infer languages and frameworks from the changed files and apply idiomatic review criteria for that stack (TypeScript/React, Rust, Python, etc.).
4. **Prioritize correctness and tests**: Always comment on potential bugs and whether tests are adequate; suggest specific new or updated tests when needed.
5. **Keep feedback actionable**: Phrase issues with concrete suggestions (what to change and why), not just high-level criticism.

## Output Summary

Provide a clear summary to the user showing:
- Scope of the review (files, diff range, or feature area).
- High-level assessment (overall risk and readiness to merge/ship).
- Key strengths of the changes.
- List of issues found, grouped by severity (high/medium/low).
- Concrete suggestions and refactors to consider.
- Testing recommendations (what tests exist, what to add or change).