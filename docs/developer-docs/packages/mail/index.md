# Email delivery (`@veap/mail`)

`@veap/mail` decouples transactional email sending from transport protocols. In local development (when no SMTP credentials are set), it defaults automatically to `ConsoleMailService`, printing formatted email previews to the terminal.

## Configuring `MailServiceProvider` and sending mail

Register `MailServiceProvider` in `lib/veap.ts` and call `sendMail(message)` in your Server Actions or event listeners:

```ts
// lib/veap.ts
import { Application } from "@veap/kernel";
import { MailServiceProvider } from "@veap/mail";

export const app = Application.configure()
  .use(MailServiceProvider)
  .create();
```

Send an email from any Server Action or domain service using `sendMail`:

```ts
import { sendMail } from "@veap/mail";

await sendMail({
  to: "ada@example.com",
  subject: "Your invoice is ready",
  text: "View your invoice at https://example.com/invoices/1042",
  html: "<p>View your invoice at <a href='https://example.com/invoices/1042'>#1042</a>.</p>",
});
```

## Next steps

Continue exploring `@veap/mail`:

- [Transports and custom drivers](./transports-and-drivers.md) — Configure SMTP environment variables or bind a custom `IMailer` adapter (`CUSTOM_MAILER`).
