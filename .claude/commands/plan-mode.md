---
description: Switch into structured Plan Mode to design an implementation approach before making code changes.
model: sonnet
---

# Plan Mode Command

Enter a read-only, high-level **planning** mode where the agent designs an implementation approach, breaks work into steps, and identifies trade-offs before editing code.

## Workflow

### Step 1: Clarify the Goal

- If the user’s request is vague or large (e.g. “add auth”, “optimize performance”), briefly restate your understanding.
- Optionally ask 1–2 targeted questions if the requirements are underspecified and answers are critical for a good plan (avoid long questionnaires).

### Step 2: Gather Context

Use the Task tool to invoke a general-purpose agent for exploration:
- subagent_type: explore
- description: Gather context for planning
- prompt: >
  Explore the repository to collect the minimum context needed to plan this work:
  - Locate relevant modules, services, and UI components.
  - Identify existing patterns, abstractions, and tests in this area.
  - Note any shared types, contracts, and cross-cutting concerns.
  Return a concise summary of the current architecture and key touch points.
- model: sonnet

Wait for the agent to complete and capture the architecture/context summary.

### Step 3: Draft the Plan

Using the gathered context, produce a concrete, step-by-step plan:

- Break the work into **sequenced steps** (3–10 steps is typical).
- For each step, include:
  - What files/areas are likely involved.
  - What tools will be needed (e.g. file edits, tests, shell commands, skills).
  - Any dependencies on earlier steps.
- Call out major **trade-offs** and design decisions (e.g. where to put new state, which abstractions to reuse).

### Step 4: Identify Risks and Validation

- List potential **risks or unknowns** (e.g. missing types, unclear API contracts, performance hotspots).
- Define a **validation plan**:
  - Which tests to run or add.
  - Manual checks if needed (UI flows, error paths).

### Step 5: Present the Plan to the User

- Present the plan in a clear, scannable format:
  - Short summary.
  - Numbered implementation steps.
  - Risks / open questions.
  - Validation strategy.
- Wait for user confirmation or edits before switching back to implementation mode.

## Critical Requirements

1. **Do not edit code in Plan Mode**: Only read and reason about the codebase; actual edits happen after the user approves the plan.
2. **Keep plans concrete**: Avoid vague statements like “wire everything up”; specify what to change and where.
3. **Respect project conventions**: Align proposals with existing patterns in this repository (naming, folder structure, state management, testing).
4. **Right-size the plan**: Large features need more detailed plans; small tasks may need only a brief 3–5 step outline.
5. **Always define validation**: Every plan must include how to verify correctness (tests and/or manual checks).

## Output Summary

Provide a clear summary to the user showing:
- A 1–2 sentence description of the proposed approach.
- A numbered list of implementation steps.
- Any key design decisions and trade-offs.
- Identified risks or unknowns.
- The test and validation plan for confirming success.

