# Testing Rules

## Philosophy
- Tests document *intended behaviour*, not implementation details.
- A test that passes after the wrong refactor is worse than no test.
- If it's hard to test, the design is wrong — fix the design, not the test strategy.

## Coverage Requirements
| Layer | Type | Minimum |
|-------|------|---------|
| Domain | Unit | 100% of business rules |
| Application (use cases) | Unit + integration | All happy paths + known failure modes |
| Infrastructure (crawlers, parsers) | Integration | Real HTML fixtures, no live network in CI |
| Interface (routes, CLI) | E2E / smoke | Critical user journeys |

## Test Structure — AAA
```
// Arrange
const crawler = new VenueCrawler({ timeout: 5000 });
const html = loadFixture('venue-page.html');

// Act
const result = await crawler.parse(html);

// Assert
expect(result.name).toBe('Sport Hall A');
expect(result.courts).toHaveLength(3);
```

## Naming
- `describe` block = unit under test: `describe('VenueCrawler')`
- `it` / `test` block = behaviour: `it('returns null when venue block is missing')`
- No `test1`, `testFoo`, `shouldWork`

## What to Test
- Every public method on domain entities and use cases
- Every parser against at least one real HTML fixture
- Every error path that has a recovery strategy
- All retry logic with simulated failures

## What NOT to Test
- Framework internals (ORM queries, HTTP library behaviour)
- Private methods — test via the public interface
- Implementation details that will change with refactoring

## Mocking Rules
- Mock at the *port boundary* (interfaces/adapters), never inside the domain
- Prefer real fixtures (saved HTML, JSON responses) over mocked HTTP calls in parser tests
- Never mock the unit under test itself

## CI Requirements
- All tests must pass before merge
- No `.skip`, `.only`, or commented-out tests in committed code
- Flaky tests must be fixed or deleted — not retried
