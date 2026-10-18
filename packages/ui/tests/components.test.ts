import * as React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "../src/components/badge.js";
import { Button } from "../src/components/button.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/components/card.js";
import { Input } from "../src/components/input.js";
import { Separator } from "../src/components/separator.js";

describe("@veap/ui components", () => {
  describe("Button", () => {
    it("renders button element with default slot and variant attributes", () => {
      const html = renderToString(
        React.createElement(Button, null, "Save Changes"),
      );
      expect(html).toContain('data-slot="button"');
      expect(html).toContain('data-variant="default"');
      expect(html).toContain("Save Changes");
      expect(html).toContain("button");
    });

    it("applies custom variants and sizes correctly", () => {
      const html = renderToString(
        React.createElement(
          Button,
          { variant: "destructive", size: "lg", className: "custom-btn" },
          "Delete",
        ),
      );
      expect(html).toContain('data-variant="destructive"');
      expect(html).toContain('data-size="lg"');
      expect(html).toContain("custom-btn");
      expect(html).toContain("Delete");
    });

    it("renders disabled state properly", () => {
      const html = renderToString(
        React.createElement(Button, { disabled: true }, "Disabled Action"),
      );
      expect(html).toContain("disabled");
      expect(html).toContain("Disabled Action");
    });
  });

  describe("Badge", () => {
    it("renders badge with content and default slot", () => {
      const html = renderToString(
        React.createElement(Badge, null, "New Feature"),
      );
      expect(html).toContain('data-slot="badge"');
      expect(html).toContain("New Feature");
    });

    it("applies secondary and destructive variants", () => {
      const secHtml = renderToString(
        React.createElement(Badge, { variant: "secondary" }, "Draft"),
      );
      expect(secHtml).toContain('data-slot="badge"');
      expect(secHtml).toContain("Draft");

      const destHtml = renderToString(
        React.createElement(Badge, { variant: "destructive" }, "Failed"),
      );
      expect(destHtml).toContain('data-slot="badge"');
      expect(destHtml).toContain("Failed");
    });
  });

  describe("Card", () => {
    it("renders full card composition with header, content, and footer", () => {
      const html = renderToString(
        React.createElement(
          Card,
          { className: "my-card" },
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Settings Card"),
            React.createElement(
              CardDescription,
              null,
              "Manage your preferences",
            ),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement("p", null, "Main content area"),
          ),
          React.createElement(
            CardFooter,
            null,
            React.createElement(Button, null, "Submit"),
          ),
        ),
      );

      expect(html).toContain('data-slot="card"');
      expect(html).toContain('data-slot="card-header"');
      expect(html).toContain('data-slot="card-title"');
      expect(html).toContain("Settings Card");
      expect(html).toContain('data-slot="card-description"');
      expect(html).toContain("Manage your preferences");
      expect(html).toContain('data-slot="card-content"');
      expect(html).toContain("Main content area");
      expect(html).toContain('data-slot="card-footer"');
      expect(html).toContain('data-slot="button"');
    });
  });

  describe("Input", () => {
    it("renders input element with type, placeholder and disabled attributes", () => {
      const html = renderToString(
        React.createElement(Input, {
          type: "email",
          placeholder: "user@example.com",
          disabled: true,
        }),
      );
      expect(html).toContain('data-slot="input"');
      expect(html).toContain('type="email"');
      expect(html).toContain('placeholder="user@example.com"');
      expect(html).toContain("disabled");
    });
  });

  describe("Separator", () => {
    it("renders horizontal and vertical separators", () => {
      const hHtml = renderToString(React.createElement(Separator, null));
      expect(hHtml).toContain('data-slot="separator"');

      const vHtml = renderToString(
        React.createElement(Separator, { orientation: "vertical" }),
      );
      expect(vHtml).toContain('data-slot="separator"');
    });
  });
});
