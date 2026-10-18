# Transports and custom drivers

`@veap/mail` selects its active mail driver (`IMailer`) based on environment variables and container bindings registered before `MailServiceProvider.boot()`.

## Environment variables

Configure SMTP delivery through environment variables in your `.env` file:

| Variable | Description |
| :--- | :--- |
| `MAIL_TRANSPORT` | Transport mode: `"smtp"`, `"console"`, or `"custom"`. |
| `MAIL_SERVICE` | Nodemailer service name (such as `"gmail"`). |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP authentication credentials. |
| `MAIL_FROM_ADDRESS` | Default sender `From` address. |

## Registering a custom mail driver (`CUSTOM_MAILER`)

To send transactional emails through an HTTP provider (such as Resend, Postmark, or AWS SES), implement `IMailer`, bind it to the `CUSTOM_MAILER` token in your composition root, and set `MAIL_TRANSPORT=custom`:

```ts
import { ServiceProvider } from "@veap/kernel";
import { CUSTOM_MAILER, type IMailer, type MailMessage } from "@veap/mail";

export class ResendMailer implements IMailer {
  async sendMail(message: MailMessage): Promise<void> {
    // Dispatch message via Resend HTTP API
  }
}

export class CustomMailProvider extends ServiceProvider {
  register(): void {
    this.container.register({
      token: CUSTOM_MAILER,
      useClass: ResendMailer,
      singleton: true,
    });
  }
}
```
