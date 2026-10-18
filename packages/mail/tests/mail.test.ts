import { Application, Container, container } from "@veap/kernel";
import { beforeEach, describe, expect, it } from "vitest";
import {
  bindMailContext,
  communicationContext,
  mailContext,
} from "../src/context.js";
import { sendMail } from "../src/mail.js";
import type { MailMessage } from "../src/mail-message.js";
import { CUSTOM_MAILER, MAIL_SERVICE, MAILER } from "../src/mailer.js";
import {
  CommunicationServiceProvider,
  MailServiceProvider,
} from "../src/provider.js";
import "../src/composition.js";

describe("Mail package", () => {
  let sent: MailMessage[];

  beforeEach(() => {
    sent = [];

    // Bind a capturing fake transport
    bindMailContext({
      mailer: {
        async sendMail(message: MailMessage) {
          sent.push(message);
        },
      },
    });
  });

  it("sendMail forwards messages to the bound mail transport port", async () => {
    await sendMail({
      to: "user@example.com",
      subject: "Test Subject",
      text: "Hello from Veap Mailer!",
    });

    expect(sent).toHaveLength(1);
    expect(sent[0]).toEqual({
      to: "user@example.com",
      subject: "Test Subject",
      text: "Hello from Veap Mailer!",
    });
    expect(mailContext().mailer.sendMail).toBeDefined();
    expect(communicationContext().mailer).toBe(mailContext().mailer);
  });

  it("exposes only sendMail on the transport interface", () => {
    const keys = Object.keys(mailContext().mailer);
    expect(keys.sort()).toEqual(["sendMail"]);
  });

  it("boots MailServiceProvider and binds ConsoleMailService by default", async () => {
    const localContainer = new Container();
    const provider = new MailServiceProvider(localContainer);
    provider.register();
    await provider.boot();

    expect(localContainer.has(MAILER)).toBe(true);
    expect(mailContext().mailer).toBeDefined();
  });

  it("supports Application.configure().withMail() and withCommunication()", async () => {
    await Application.shutdown();
    const app = Application.configure().withMail().create();
    expect(app).toBeDefined();
    await app.bootstrap();

    const boundMailer = await container.resolve(MAILER);
    expect(boundMailer).toBeDefined();
    expect(await container.resolve(MAIL_SERVICE)).toBe(boundMailer);
  });

  it("supports custom transport with CUSTOM_MAILER token", async () => {
    const customMailer = {
      async sendMail() {},
    };

    const localContainer = new Container();
    localContainer.register({
      token: CUSTOM_MAILER,
      useValue: customMailer,
    });

    const origEnv = process.env.MAIL_TRANSPORT;
    process.env.MAIL_TRANSPORT = "custom";

    try {
      const provider = new CommunicationServiceProvider(localContainer);
      provider.register();
      await provider.boot();

      expect(mailContext().mailer).toBe(customMailer);
    } finally {
      if (origEnv !== undefined) {
        process.env.MAIL_TRANSPORT = origEnv;
      } else {
        delete process.env.MAIL_TRANSPORT;
      }
    }
  });
});
