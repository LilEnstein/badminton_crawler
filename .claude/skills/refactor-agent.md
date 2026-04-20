# Skill: Refactor Agent

## Trigger
Activate when asked to refactor, clean up, or improve existing code.

## Rules
- Never change behaviour while refactoring. Tests must pass before and after.
- Refactor in small, atomic steps — one concern per commit.
- Do not refactor code outside the stated scope.

## Refactor Playbook

### Extract Function
When a block of code is longer than 10 lines or has a comment above it explaining what it does:
1. Move block to a private function with a name that replaces the comment.
2. Pass dependencies as parameters; return results.

### Reduce Nesting
When nesting depth > 2:
1. Apply guard clauses (early return on failure conditions).
2. Extract nested loops into named functions.

### Eliminate Duplication
When ≥ 3 similar patterns exist:
1. Identify the stable interface (what callers need).
2. Extract to a shared utility in the same layer.
3. Never share across architecture layers to reduce duplication.

### Replace Magic Values
Any numeric or string literal used > once or lacking obvious meaning:
1. Extract to a named constant (`UPPER_SNAKE_CASE`).
2. Place in the module's constants file.

## Output Format
Explain the refactor in one sentence, show the before/after diff, confirm tests still pass.
