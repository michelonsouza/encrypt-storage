---
name: Feature request
about: Suggest an improvement or new capability for encrypt-storage
title: "[feature]: "
labels: enhancement
assignees: ''
---

## Summary

Describe the feature request in one or two sentences.

## Problem

What limitation, friction, or missing capability are you hitting today?

Be specific about the workflow. For example:

- browser storage usage
- `noble` vs `web-crypto`
- TTL management
- cookies
- SSR-safe usage
- state management integrations
- framework-specific behavior

## Proposed solution

Describe the API or behavior you would like to have.

```ts
// Proposed usage example
```

## Why this belongs in encrypt-storage

Explain why this should live in the library instead of application code.

Useful signals:

- it affects encrypted storage behavior directly
- it improves consistency between engines
- it helps framework/runtime compatibility
- it reduces boilerplate around TTL, cookies, or persisters
- it improves safety, ergonomics, or migration paths

## Scope

Which area would this affect?

- [ ] Core storage API
- [ ] `noble` engine
- [ ] `web-crypto` engine
- [ ] `AsyncEncryptStorage`
- [ ] TTL API
- [ ] Cookie API
- [ ] State management integrations
- [ ] SSR / framework guidance
- [ ] TypeScript types
- [ ] Documentation

## Alternatives considered

Describe alternatives, workarounds, or competing API designs you considered.

## Compatibility notes

Please mention any concerns about:

- breaking changes
- engine parity
- browser support
- storage format compatibility
- migration from v2 or existing v3 data

## Additional context

Add any extra context, code samples, references, or related issues here.
