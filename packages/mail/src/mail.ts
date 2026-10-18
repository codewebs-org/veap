import { mailContext } from "./context.js";
import type { MailMessage } from "./mail-message.js";

/**
 * Sends an email message through the configured transport.
 *
 * Transports deliver; application services, plugins, and domains decide
 * what is sent (subject, body, recipients, templates). Swapping the transport
 * never touches the caller.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  return mailContext().mailer.sendMail(message);
}
