import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  handleSoftNavigationClick,
  SoftNavigationInterceptor,
} from "../src/router/react/soft-navigation.js";

describe("SoftNavigationInterceptor", () => {
  it("renders children correctly", () => {
    const markup = renderToStaticMarkup(
      React.createElement(
        SoftNavigationInterceptor,
        null,
        React.createElement("div", { id: "child" }, "Hello world"),
      ),
    );

    expect(markup).toBe('<div id="child">Hello world</div>');
  });

  describe("handleSoftNavigationClick", () => {
    it("intercepts internal link clicks and triggers onNavigate", () => {
      const onNavigate = vi.fn();
      const preventDefault = vi.fn();

      const anchor = {
        tagName: "A",
        getAttribute: (attr: string) =>
          attr === "href" ? "/panel/settings" : null,
        hasAttribute: () => false,
        target: "",
        parentElement: null,
      };

      const event = {
        target: anchor,
        preventDefault,
        button: 0,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      } as unknown as MouseEvent;

      const intercepted = handleSoftNavigationClick(event, onNavigate);

      expect(intercepted).toBe(true);
      expect(preventDefault).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith("/panel/settings");
    });

    it("ignores clicks with modifier keys", () => {
      const onNavigate = vi.fn();
      const preventDefault = vi.fn();

      const anchor = {
        tagName: "A",
        getAttribute: (attr: string) =>
          attr === "href" ? "/panel/settings" : null,
        hasAttribute: () => false,
        target: "",
        parentElement: null,
      };

      const event = {
        target: anchor,
        preventDefault,
        button: 0,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      } as unknown as MouseEvent;

      const intercepted = handleSoftNavigationClick(event, onNavigate);

      expect(intercepted).toBe(false);
      expect(preventDefault).not.toHaveBeenCalled();
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it("ignores non-left clicks", () => {
      const onNavigate = vi.fn();
      const preventDefault = vi.fn();

      const anchor = {
        tagName: "A",
        getAttribute: (attr: string) =>
          attr === "href" ? "/panel/settings" : null,
        hasAttribute: () => false,
        target: "",
        parentElement: null,
      };

      const event = {
        target: anchor,
        preventDefault,
        button: 1, // middle click
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      } as unknown as MouseEvent;

      const intercepted = handleSoftNavigationClick(event, onNavigate);

      expect(intercepted).toBe(false);
      expect(preventDefault).not.toHaveBeenCalled();
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it("ignores external links", () => {
      const onNavigate = vi.fn();
      const preventDefault = vi.fn();

      const anchor = {
        tagName: "A",
        getAttribute: (attr: string) =>
          attr === "href" ? "https://google.com" : null,
        hasAttribute: () => false,
        target: "",
        parentElement: null,
      };

      const event = {
        target: anchor,
        preventDefault,
        button: 0,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      } as unknown as MouseEvent;

      const intercepted = handleSoftNavigationClick(event, onNavigate);

      expect(intercepted).toBe(false);
      expect(preventDefault).not.toHaveBeenCalled();
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it("ignores links with target=_blank", () => {
      const onNavigate = vi.fn();
      const preventDefault = vi.fn();

      const anchor = {
        tagName: "A",
        getAttribute: (attr: string) =>
          attr === "href" ? "/panel/settings" : null,
        hasAttribute: () => false,
        target: "_blank",
        parentElement: null,
      };

      const event = {
        target: anchor,
        preventDefault,
        button: 0,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
      } as unknown as MouseEvent;

      const intercepted = handleSoftNavigationClick(event, onNavigate);

      expect(intercepted).toBe(false);
      expect(preventDefault).not.toHaveBeenCalled();
      expect(onNavigate).not.toHaveBeenCalled();
    });
  });
});
