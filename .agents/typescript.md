# TypeScript Conventions

## Prefer Inference From the Source

Derive types from the schema or API that defines the data, such as a Drizzle schema, a validation schema, or a function return type. Keep types close to their source instead of maintaining duplicate shapes. When a type is wrong, fix the schema or function signature rather than asserting a different type at the point of use.

Validate data at boundaries where TypeScript cannot establish its runtime shape, such as user input and external responses. A type assertion does not validate data.

## Use TypeScript's Checks Intentionally

- Avoid `as` when it only silences a type error. Use it when a boundary or library contract cannot express a fact already established by the code, and keep the assertion close to that evidence.
- Use `satisfies` when a value should be checked against a contract while retaining its inferred type, especially for configuration objects.
- Let TypeScript infer generic arguments when it can. Supply them when the type cannot be inferred from the arguments or when an API requires the caller to define it, such as a route context type.

Prefer simple types that describe the current behavior. Introduce custom generic utilities only when they solve a concrete need.

## Checking Changes

Use `vpr lint` for TypeScript validation. It runs Oxlint with type-aware linting and type checking. Do not run `tsc --noEmit` separately; it is unnecessary. See [Workflow](./workflow.md) for the full validation guidance.
