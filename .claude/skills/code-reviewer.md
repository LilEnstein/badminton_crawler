# Skill: Code Reviewer

## Trigger
Activate when asked to review a PR, diff, or specific file.

## Review Checklist
Run through every item. Report findings grouped by severity: **Blocker → Warning → Suggestion**.

### Correctness
- [ ] Does the logic match the stated intent?
- [ ] Are all error paths handled (null, empty, network failure)?
- [ ] Are there off-by-one errors or boundary condition bugs?
- [ ] Do async operations properly await / propagate errors?

### Architecture
- [ ] Does the change respect Clean Architecture layer boundaries?
- [ ] Is new logic placed in the correct layer (domain / application / infra)?
- [ ] No business logic leaking into crawlers, routes, or CLI commands?

### Naming & Style
- [ ] Names follow `.claude/rules/naming.md`?
- [ ] Functions stay under 30 lines, files under 300?
- [ ] No unnecessary comments describing *what* rather than *why*?

### Security
- [ ] No credentials, tokens, or PII in logs or URLs?
- [ ] Scraped content is sanitised before storage?
- [ ] No injection vectors (HTML, SQL, command) introduced?

### Tests
- [ ] New behaviour covered by tests?
- [ ] Tests test behaviour, not implementation?
- [ ] No `.skip` or commented-out assertions?

## Output Format
```
## Review: <file or PR>

**Blockers**
- <line ref> — <issue> — <fix>

**Warnings**
- <line ref> — <issue> — <suggested fix>

**Suggestions**
- <line ref> — <optional improvement>

**Verdict**: Approve / Request Changes
```
