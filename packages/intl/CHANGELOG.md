# @veap/intl

## 0.1.9

### Patch Changes

- chore: bump version
- Updated dependencies []:
  - @veap/kernel@0.2.2

## 0.1.8

### Patch Changes

- Framework-independent locale detection in `@veap/intl`:
  
  - **Decoupled from Framework Globals**: Updated `getCurrentLocale` and `detectLocale` to utilize `@veap/kernel` ports (`COOKIE_STORE`, `REQUEST_CONTEXT`) for cookie reading and request headers.
  - **IntlServiceProvider Registration**: Registered locale accessor factory within `IntlServiceProvider` using `@veap/kernel` ports.
- Updated dependencies [`a7f6a1f`]:
  - @veap/kernel@0.2.1

## 0.1.7

### Patch Changes

- Updated dependencies []:
  - @veap/kernel@0.2.0

## 0.1.6

### Patch Changes

- Updated dependencies []:
  - @veap/kernel@0.1.6

## 0.1.5

### Patch Changes

- fix: update versions and dependencies
- Updated dependencies []:
  - @veap/kernel@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies []:
  - @veap/kernel@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies []:
  - @veap/kernel@0.1.3

## 0.1.2

### Patch Changes

- Decouple `@veap/intl` from direct `next/headers` imports in favor of `@veap/kernel` transport ports (`COOKIE_STORE`, `REQUEST_CONTEXT`).
- Updated dependencies []:
  - @veap/kernel@0.1.2

## 0.1.1

### Patch Changes

- Fix native Node.js ESM module resolution, eliminate path traversal vulnerabilities in message loading, add DI tokens, augment VeapConfig, and expand test coverage:
  
  - Augment `VeapConfig` from `@veap/kernel` via TypeScript Module Augmentation to declare the `intl?: Partial<IntlConfig>` configuration schema.
  - Fix missing `.js` extensions across all relative module imports/exports in `src/` ensuring full compliance with native Node.js ESM loaders (`ERR_MODULE_NOT_FOUND` resolution).
  - Add explicit `.js` extensions to dynamic imports of core locales (`en.js`, `pl.js`) in `IntlService`.
  - Sanitize `locale` parameter in `IntlService.prototype.getMessages()` using `path.basename` and alphanumeric whitelist, preventing directory traversal attacks via crafted locale strings.
  - Export `INTL_SERVICE` DI injection token (`Token<IntlService>`) in `src/common/constants.ts` and register it in `IntlServiceProvider`.
  - Add autowiring and graceful fallback in `src/services/loader.ts` to ensure `getMessages()` and `registerMessages()` work reliably in test and standalone environments without prior manual service provider registration.
  - Strengthen date parsing validation in `coerceDate()` to guard against `NaN` timestamp errors and `RangeError: Invalid time value` in `Intl.DateTimeFormat`.
  - Expand unit test suites in `tests/translator.test.ts` and `tests/intl.service.test.ts` covering date formatting, relative time calculation, path traversal rejection, dot-containing translation keys, and IoC container binding (increasing test count from 7 to 12 passing tests).
- Updated dependencies []:
  - @veap/kernel@0.1.1

## 0.1.0

### Minor Changes

- Initial public scaffold of the Veap intl.
