# AGENTS.md

Guidelines for autonomous coding agents working in this repository.

This file defines how agents should analyze, plan, and modify the
codebase.

Agents must read this file before making any code changes.

------------------------------------------------------------------------

# 1. Core Principles

Agents must follow these principles:

1.  Understand the system before making changes.
2.  Prefer minimal and safe modifications.
3.  Maintain consistency with existing architecture.
4.  Avoid unnecessary refactors.
5.  Do not introduce new dependencies unless required.
6.  Ensure code remains readable and maintainable.
7.  Always check for existing implementations before creating new ones.

------------------------------------------------------------------------

# 2. Required Workflow

Agents must follow this workflow for every task.

Step 1 --- Analyze - Explore the repository - Identify relevant
modules - Understand architecture and dependencies

Step 2 --- Plan - Break the task into smaller steps - Identify files
that must change - Avoid modifying unrelated components

Step 3 --- Implement - Apply minimal changes - Follow existing
patterns - Keep logic simple and clear

Step 4 --- Validate - Check that code compiles - Run tests if
available - Verify no breaking changes

Step 5 --- Explain - Provide a short explanation of the changes -
Describe the reason for each modification

------------------------------------------------------------------------

# 3. Repository Structure Awareness

Agents must respect the repository structure.

Example structure:

src/ controllers/ services/ repositories/ models/

tests/

config/

docs/

Guidelines:

Controllers\
Handle request and response logic.

Services\
Contain business logic.

Repositories\
Handle database access.

Models\
Represent data structures.

Agents must not mix responsibilities across layers.

------------------------------------------------------------------------

# 4. Code Modification Rules

Agents must follow these rules when editing code.

## Prefer editing existing files

Before creating a new file, check whether:

-   the feature already exists
-   logic can be extended
-   a helper function already exists

## Avoid duplicate logic

Do not duplicate:

-   validation
-   database queries
-   utility functions

Reuse existing implementations.

## Keep functions small

Functions should generally:

-   do one thing
-   be easy to read
-   avoid deeply nested logic

------------------------------------------------------------------------

# 5. Architecture Consistency

Agents must preserve architectural patterns already used in the project.

Examples:

-   MVC
-   Clean Architecture
-   Hexagonal Architecture
-   Service Repository pattern

Do not introduce a new pattern unless necessary.

------------------------------------------------------------------------

# 6. Naming Conventions

Agents must follow existing naming conventions.

Variables\
camelCase

Classes\
PascalCase

Constants\
UPPER_SNAKE_CASE

Files\
kebab-case or snake_case depending on project style.

Agents should inspect nearby files to determine the correct style.

------------------------------------------------------------------------

# 7. Dependency Rules

Agents must avoid introducing dependencies unless necessary.

Before adding a library:

1.  Check if the functionality already exists in the project
2.  Prefer built-in language tools
3.  Ensure the dependency is stable and widely used

If a dependency is required, explain why.

------------------------------------------------------------------------

# 8. Testing Rules

If the repository contains tests:

Agents must update or add tests when modifying logic.

Testing priorities:

1.  Business logic
2.  Critical paths
3.  Edge cases

Tests must remain deterministic.

------------------------------------------------------------------------

# 9. Git Behavior

Agents should treat commits as atomic tasks.

Each commit should:

-   address one logical change
-   include a clear message

Commit message format:

type(scope): short description

example: feat(auth): add JWT authentication middleware

Common types:

feat\
fix\
refactor\
test\
docs\
chore

------------------------------------------------------------------------

# 10. Security Guidelines

Agents must avoid introducing security risks.

Never:

-   expose secrets
-   commit API keys
-   log sensitive data
-   disable security checks

Always sanitize external input.

------------------------------------------------------------------------

# 11. Performance Awareness

Agents should avoid unnecessary performance degradation.

Examples:

Avoid:

-   N+1 database queries
-   redundant API calls
-   repeated heavy computations

Prefer:

-   batching
-   caching
-   efficient queries

------------------------------------------------------------------------

# 12. Documentation Responsibilities

Agents should update documentation when needed.

Update:

README.md\
API docs\
Architecture notes\
Comments for complex logic

Do not over-comment obvious code.

------------------------------------------------------------------------

# 13. Multi-Agent Collaboration

In multi-agent environments:

Planner Agent\
Breaks tasks into subtasks.

Coder Agent\
Implements the solution.

Reviewer Agent\
Checks correctness and code quality.

Tester Agent\
Generates and runs tests.

Agents must not overwrite each other's work without analysis.

------------------------------------------------------------------------

# 14. When Agents Are Uncertain

If an agent cannot confidently complete a task:

1.  Ask for clarification
2.  Provide assumptions
3.  Propose possible solutions

Do not guess blindly.

------------------------------------------------------------------------

# 15. Forbidden Actions

Agents must never:

-   delete large parts of the codebase without confirmation
-   rewrite core architecture without justification
-   introduce breaking changes without warning
-   modify environment or infrastructure files unnecessarily

------------------------------------------------------------------------

# 16. Preferred Development Strategy

Agents should prefer the following approach:

1.  Read code
2.  Understand design
3.  Identify minimal change
4.  Implement safely
5.  Verify correctness

This repository prioritizes stability and clarity over cleverness.

------------------------------------------------------------------------

# End of AGENTS.md
