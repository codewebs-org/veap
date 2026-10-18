# `@veap/mail` API reference

`@veap/mail` provides a unified email transport abstraction (`sendMail`, `IMailer`) supporting SMTP via Nodemailer, local terminal previews via `ConsoleMailService`, and custom third-party drivers via the `CUSTOM_MAILER` IoC token.

## Subpath exports

`@veap/mail` exports all symbols from its root entry point:

| Subpath | Description |
| :--- | :--- |
| `@veap/mail` | `MailServiceProvider`, `sendMail`, `CUSTOM_MAILER`, `MAILER`, `IMailer`, `MailMessage`, `ConsoleMailService`, and `NodemailerMailService`. |

## Core APIs and tokens

The table below summarizes the providers, tokens, functions, and interfaces exported by `@veap/mail`:

| Symbol | Kind | Signature / Type | Description |
| :--- | :--- | :--- | :--- |
| `MailServiceProvider` | `ServiceProvider` | `new MailServiceProvider(container)` | Inspects `ConfigService` / environment variables and binds the active mail driver (`NodemailerMailService`, `ConsoleMailService`, or `CUSTOM_MAILER`). |
| `sendMail` | Function | `sendMail(message: MailMessage): Promise<void>` | Sends an email message (`{ to, subject, text?, html? }`) through the active mail driver. |
| `CUSTOM_MAILER` | `Token<IMailer>` | `Symbol.for("veap:communication:custom-mailer")` | IoC token for registering a custom email provider (such as Resend, Postmark, or AWS SES). |
| `MAILER` | `Token<IMailer>` | `Symbol.for("veap:communication:mailer")` | Primary IoC token for resolving the active email transport. |
| `IMailer` | Interface | `{ sendMail(message: MailMessage): Promise<void> }` | Contract implemented by all mail drivers. |
