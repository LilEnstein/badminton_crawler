# Template: New Domain Component (Entity / Value Object / Repository)

Use this when adding a new domain concept.

## Checklist

### Entity
- [ ] File: `src/domain/<noun>.entity.ts`
- [ ] Constructor validates all invariants; throws `DomainError` on violation
- [ ] No external dependencies (no imports from infrastructure or application)
- [ ] Pure methods only — no async, no I/O

### Value Object
- [ ] File: `src/domain/value-objects/<noun>.ts`
- [ ] Immutable (readonly properties)
- [ ] Equality by value, not reference — implement `.equals()` if needed
- [ ] Named constructor pattern preferred over `new`: `CourtId.from('...')`

### Repository Port
- [ ] File: `src/application/ports/<noun>.repository.port.ts`
- [ ] Interface only — no implementation
- [ ] Methods return domain entities, not raw DB rows
- [ ] No framework-specific types in the interface signature

### Repository Implementation
- [ ] File: `src/infrastructure/repositories/<noun>.repository.ts`
- [ ] Implements the port interface
- [ ] Maps DB rows → domain entities in a private `toDomain()` method
- [ ] Maps domain entities → DB rows in a private `toPersistence()` method

## Entity Skeleton
```typescript
export class Venue {
  constructor(
    public readonly id: VenueId,
    public readonly name: string,
    public readonly address: Address,
  ) {
    if (!name.trim()) throw new DomainError('Venue name cannot be empty');
  }
}
```

## Repository Port Skeleton
```typescript
export interface IVenueRepository {
  findById(id: VenueId): Promise<Venue | null>;
  findBySourceUrl(url: string): Promise<Venue | null>;
  save(venue: Venue): Promise<void>;
}
```
