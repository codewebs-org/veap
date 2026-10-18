"use client";

import { Button, cn } from "@veap/ui";
import * as React from "react";

export interface CommentFormProps {
  parentId?: string | null;
  onSubmit: (data: {
    content: string;
    authorName?: string;
    authorEmail?: string;
    parentId?: string | null;
  }) => Promise<void> | void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  submitLabel?: string;
  showAuthorFields?: boolean;
}

export function CommentForm({
  parentId = null,
  onSubmit,
  onCancel,
  placeholder = "Napisz komentarz...",
  className,
  submitLabel = "Wyślij komentarz",
  showAuthorFields = true,
}: CommentFormProps) {
  const [content, setContent] = React.useState("");
  const [authorName, setAuthorName] = React.useState("");
  const [authorEmail, setAuthorEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        content: trimmed,
        authorName: authorName.trim() || undefined,
        authorEmail: authorEmail.trim() || undefined,
        parentId,
      });
      setContent("");
      if (parentId && onCancel) {
        onCancel();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      {showAuthorFields && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Twoje imię / nick"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/20 w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-2"
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="Twój e-mail"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/20 w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-2"
          />
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/20 w-full resize-y rounded-xl border p-3 text-xs outline-none focus:ring-2"
        required
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-xs"
          >
            Anuluj
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
          className="text-xs"
        >
          {isSubmitting ? "Wysyłanie..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
