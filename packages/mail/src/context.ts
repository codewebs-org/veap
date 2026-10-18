import { AppError } from "@veap/kernel";
import type { IMailer } from "./mailer.js";

/**
 * Typed boundary between the mail use cases and their consumers
 * (facades, application services).
 *
 * The composition root (`MailServiceProvider`) selects the mail
 * transport once at boot and binds it here.
 */
export interface MailContext {
  mailer: IMailer;
}

/**
 * @deprecated Use `MailContext` instead.
 */
export type CommunicationContext = MailContext;

const globalForMailContext = globalThis as unknown as {
  __VEAP_MAIL_CONTEXT__?: MailContext;
  __VEAP_COMMUNICATION_CONTEXT__?: MailContext;
};

/**
 * Binds the resolved mail services. Called once by the composition root.
 */
export function bindMailContext(context: MailContext): void {
  globalForMailContext.__VEAP_MAIL_CONTEXT__ = context;
  globalForMailContext.__VEAP_COMMUNICATION_CONTEXT__ = context;
}

/**
 * @deprecated Use `bindMailContext` instead.
 */
export const bindCommunicationContext = bindMailContext;

/**
 * Returns the bound mail services.
 *
 * @throws If the mail service provider has not booted yet.
 */
export function mailContext(): MailContext {
  const context =
    globalForMailContext.__VEAP_MAIL_CONTEXT__ ??
    globalForMailContext.__VEAP_COMMUNICATION_CONTEXT__;
  if (!context) {
    throw AppError.Internal(
      "[Mail] Context is not bound. MailServiceProvider must boot before the mail facades are used.",
    );
  }
  return context;
}

/**
 * @deprecated Use `mailContext` instead.
 */
export const communicationContext = mailContext;
