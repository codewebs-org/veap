# Official plugins catalog

The Veap ecosystem features a collection of officially maintained, modular plugins that provide user-facing capabilities, administrative interfaces, and third-party integrations.

Plugins are installed through the `veap` CLI runner, which configures dependencies and registers the plugin in `lib/plugins.gen.ts`:

```bash
bun veap add @veap/<plugin-name>
```

<!-- prettier-ignore -->
> [!NOTE]
> When installed, plugins automatically apply their database migrations on startup and mount virtual routes and UI extension points into your host application.

---

## Content and publishing

### `@veap/blog-plugin`

A comprehensive blog and content publishing plugin featuring Markdown and MDX editing, drafts, categories, tags, comments, and media integration.

- **Installation**: `bun veap add @veap/blog-plugin`
- **Dependencies**: `@veap/media-plugin`, `@veap/categorizable`, `@veap/taggable`, `@veap/commentable`, `@veap/translatable`
- **Virtual routes**:
  - Public blog: `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]`
  - Administration: `/admin/blog` (post editor, list view, publishing controls)
- **Extension slots**: Injects navigation items into the admin sidebar and dashboard widgets into `/admin`.

---

## Security and authentication

### `@veap/auth-plugin`

Enterprise-grade multi-strategy authentication, session management, and identity orchestrator with pre-styled client forms and type-safe Server Actions.

- **Installation**: `bun veap add @veap/auth-plugin`
- **Required environment**: `ENCRYPTION_KEY` (base64-encoded key for credential encryption)
- **Virtual routes**: `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`
- **Client components**: `LoginForm`, `SignUpForm`, `ForgotPasswordForm` exported from `@veap/auth-plugin/client`
- **Sub-plugins**: Orchestrates `@veap/auth-google-plugin`, `@veap/auth-passkey-plugin`, and `@veap/auth-totp-plugin` via pluggable form slots.

### `@veap/auth-google-plugin`

Google OAuth 2.0 and OpenID Connect single sign-on (SSO) sub-plugin for `@veap/auth-plugin`.

- **Installation**: `bun veap add @veap/auth-google-plugin`
- **Required environment**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Integration**: Injects a "Sign in with Google" button slot into `@veap/auth-plugin`'s login form.

### `@veap/auth-passkey-plugin`

Biometric WebAuthn Passkeys authentication supporting Apple Touch ID, Face ID, Windows Hello, and YubiKeys.

- **Installation**: `bun veap add @veap/auth-passkey-plugin`
- **Integration**: Injects biometric sign-in buttons and passkey management settings in user profiles.

### `@veap/auth-totp-plugin`

Time-based One-Time Password (TOTP) two-factor authentication compatible with Google Authenticator, 1Password, and Authy.

- **Installation**: `bun veap add @veap/auth-totp-plugin`
- **Integration**: QR code generator for 2FA enrollment and challenge dialog during sign-in.

### `@veap/rbac-plugin`

Visual Role-Based Access Control matrix and permissions manager for administrators.

- **Installation**: `bun veap add @veap/rbac-plugin`
- **Virtual routes**: `/admin/rbac` (roles, permissions, and assignment matrix)

---

## Administration and dashboard

### `@veap/panel-plugin`

The core administration panel shell for Veap applications.

- **Installation**: `bun veap add @veap/panel-plugin`
- **Features**: Responsive admin layout, collapsible sidebar, breadcrumb integration, dark/light theme switcher, and dynamic widget dashboard.
- **Virtual routes**: `/admin`
- **Extension points**: Provides `admin:sidebar`, `admin:dashboard`, `admin:header` extension slots consumed by other plugins.

### `@veap/manager-plugin`

Visual plugin and extension manager embedded in the admin panel.

- **Installation**: `bun veap add @veap/manager-plugin`
- **Features**: In-browser plugin gallery, one-click plugin enablement/disablement, and version checking against the registry.
- **Virtual routes**: `/admin/plugins`

### `@veap/action-confirm-plugin`

Biometric and password re-authentication challenges for high-risk operations (such as data export, account deletion, or permission updates).

- **Installation**: `bun veap add @veap/action-confirm-plugin`
- **Integration**: Implements the backend handler for the `useConfirmAction()` hook from `@veap/plugins/client`.

---

## Media and storage

### `@veap/media-plugin`

Centralized media library with drag-and-drop file uploads, image preview, folder organization, and metadata tagging.

- **Installation**: `bun veap add @veap/media-plugin`
- **Dependencies**: `@veap/storage`
- **Virtual routes**: `/admin/media` (media gallery modal and file picker dialog)
- **Extension points**: Provides the `MediaPicker` dialog slot for post editors and profile avatars.

### `@veap/vercel-blob-plugin`

Cloud object storage provider integrating Vercel Blob with `@veap/storage`.

- **Installation**: `bun veap add @veap/vercel-blob-plugin`
- **Required environment**: `BLOB_READ_WRITE_TOKEN`
- **Provider ID**: Registers as `"vercel-blob"` on `StorageService`.

---

## System and developer tools

### `@veap/notifications-plugin`

In-app notification center with real-time bell badge, dropdown feed, and mark-as-read workflows.

- **Installation**: `bun veap add @veap/notifications-plugin`
- **Extension points**: Injects the `<NotificationBell />` widget into `site:header` and `admin:header`.

### `@veap/activity-plugin`

Audit log tracker recording administrative mutations, user logins, and critical entity changes.

- **Installation**: `bun veap add @veap/activity-plugin`
- **Virtual routes**: `/admin/activity` (filterable audit log table)

### `@veap/installer-plugin`

Initial setup wizard for new application deployments.

- **Installation**: `bun veap add @veap/installer-plugin`
- **Virtual routes**: `/install` (database connection verification, administrator account creation, site title setup)

### `@veap/devtools-plugin`

In-browser development toolbar providing real-time database query inspection, IoC container exploration, and route debugging during development.

- **Installation**: `bun veap add @veap/devtools-plugin`
- **Features**: Automatically disabled in production (`NODE_ENV === "production"`).
