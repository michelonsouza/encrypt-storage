---
name: Bug report
about: Report a reproducible problem in encrypt-storage
title: "[bug]: "
labels: bug
assignees: ''
---

## Summary

Describe the bug clearly and directly.

## Affected API

Which part of the library is affected?

- Engine: `noble` / `web-crypto` / `AsyncEncryptStorage`
- Feature: `storage` / `cookies` / `TTL` / `hash` / `encryptValue` / `decryptValue` / `stateManagementUse` / `SSR`

## Environment

Please complete the relevant details:

- Package version:
- Runtime: Browser / Next.js / Nuxt / Astro / Vite / other
- Browser:
- Browser version:
- OS:
- Storage type: `localStorage` / `sessionStorage` / cookies
- Encryption algorithm: `AES-GCM` / `AES-CBC` / `AES-CTR`

## Configuration

Share the instance configuration you are using.

```ts
EncryptStorage.create('secret-key-value', {
  engine: 'noble',
  storageType: 'localStorage',
  prefix: '@app',
  encAlgorithm: 'AES-GCM',
});
```

If relevant, also mention:

- `stateManagementUse`
- `doNotEncryptValues`
- `doNotParseValues`
- `validation`
- `notifyHandler`

## Reproduction

Provide the smallest possible reproduction.

```ts
// Minimal reproduction here
```

Steps:

1. Create the instance with the configuration above.
2. Call the relevant method(s).
3. Observe the result.

## Expected behavior

Describe what you expected to happen.

## Actual behavior

Describe what actually happened.

Include exact errors, returned values, or incorrect storage behavior.

```txt
Paste stack trace or console output here
```

## Storage details

If relevant, include the exact key/value behavior you observed:

- Stored key:
- Stored value shape:
- Expected stored/read value:
- Actual stored/read value:

## Special cases

Mark any that apply:

- [ ] Happens only with `web-crypto`
- [ ] Happens only with `noble`
- [ ] Happens only in SSR or hydration flows
- [ ] Happens only with TTL methods
- [ ] Happens only with cookies
- [ ] Happens only with persisters such as Redux Persist, Zustand, Vuex, or Pinia
- [ ] Happens only when using prefixes or multiple instances

## Additional context

Add anything else that helps reproduce or explain the bug, including repository links, screenshots, or notes about framework behavior.
