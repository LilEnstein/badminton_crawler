# Template: New Feature

Use this template when adding a new user-facing capability (e.g., "search courts by city", "filter by availability").

## Checklist

### 1. Domain
- [ ] Identify or create the relevant entity / value object in `src/domain/`
- [ ] Add invariant checks to the entity constructor
- [ ] Write domain unit tests

### 2. Application (Use Case)
- [ ] Create `src/application/use-cases/<verb>-<noun>.use-case.ts`
- [ ] Define the input/output types (DTOs)
- [ ] Define any new port interface in `src/application/ports/`
- [ ] Write use case unit tests with stubbed ports

### 3. Infrastructure
- [ ] Implement any new port in `src/infrastructure/`
- [ ] Write integration tests with real fixtures or a test DB

### 4. Interface
- [ ] Add route / CLI command in `src/interfaces/`
- [ ] Validate input with Zod schema before calling use case
- [ ] Return consistent response envelope

### 5. Documentation
- [ ] Update API docs if a new endpoint was added
- [ ] Add example request/response to Postman collection or README

## File Naming
```
src/
├── domain/              <noun>.entity.ts
├── application/
│   ├── use-cases/       <verb>-<noun>.use-case.ts
│   └── ports/           <noun>.repository.port.ts
├── infrastructure/      <noun>.repository.ts
└── interfaces/
    └── http/routes/     <noun>.routes.ts
```
