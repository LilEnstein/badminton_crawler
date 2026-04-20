# Skill: Test Agent

## Trigger
Activate when asked to write tests, increase coverage, or fix failing tests.

## Process
1. Read the unit under test fully before writing a single assertion.
2. Identify: happy path, boundary conditions, known failure modes.
3. Write the simplest test that would catch a regression for each case.
4. Run tests after writing; fix failures before reporting done.

## Test Templates

### Unit — Domain Entity
```typescript
describe('Court', () => {
  it('throws when name is empty', () => {
    expect(() => new Court({ name: '' })).toThrow(DomainError);
  });

  it('is available when no bookings overlap the slot', () => {
    const court = CourtFactory.withNoBookings();
    expect(court.isAvailableAt(slot)).toBe(true);
  });
});
```

### Unit — Parser
```typescript
describe('VenueParser', () => {
  it('extracts court count from real fixture', async () => {
    const html = await loadFixture('fixtures/venue-detail.html');
    const parser = new VenueParser();
    const result = parser.parse(html);
    expect(result.courts).toHaveLength(4);
  });

  it('returns null when venue block is absent', () => {
    expect(new VenueParser().parse('<html></html>')).toBeNull();
  });
});
```

### Integration — Use Case with Mocked Port
```typescript
describe('CrawlVenueUseCase', () => {
  it('persists parsed venue and marks job complete', async () => {
    const repo = new InMemoryVenueRepository();
    const crawler = new StubVenueCrawler({ fixture: 'venue-detail.html' });
    await new CrawlVenueUseCase(crawler, repo).execute({ url: 'https://example.com' });
    expect(repo.findAll()).toHaveLength(1);
  });
});
```

## Fixture Management
- Store HTML fixtures in `tests/fixtures/<source-name>/`
- Name fixtures after the page type: `venue-detail.html`, `search-results.html`
- Redact any PII before committing fixtures
- Update fixtures when the target site layout changes — stale fixtures hide regressions
