"use client";

import { Avatar, AvatarFallback, Badge, Button, cn, Icon } from "@veap/ui";
import * as React from "react";
import { CommentForm } from "./CommentForm.js";

export interface CommentItem {
  id: string;
  authorName?: string | null;
  authorEmail?: string | null;
  content: string;
  createdAt?: string | Date;
  parentId?: string | null;
  replies?: CommentItem[];
  status?: string;
}

export interface CommentSectionProps {
  comments: CommentItem[];
  onAddComment: (data: {
    content: string;
    authorName?: string;
    authorEmail?: string;
    parentId?: string | null;
  }) => Promise<void> | void;
  className?: string;
  allowReplies?: boolean;
}

export function CommentSection({
  comments = [],
  onAddComment,
  className,
  allowReplies = true,
}: CommentSectionProps) {
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderComment = (comment: CommentItem, depth = 0) => {
    const isReplying = replyingToId === comment.id;
    const replies = comment.replies || [];

    return (
      <div
        key={comment.id}
        className={cn(
          "flex flex-col gap-2 rounded-xl p-3 transition-colors",
          depth === 0
            ? "bg-muted/20 border-border/50 border"
            : "border-border/80 ml-6 border-l-2 pl-3",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">
                {getInitials(comment.authorName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1.5">
              <span className="text-foreground text-xs font-semibold">
                {comment.authorName || "Anonim"}
              </span>
              {comment.createdAt && (
                <span className="text-muted-foreground text-[10px]">
                  •{" "}
                  {typeof comment.createdAt === "string"
                    ? comment.createdAt
                    : comment.createdAt.toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {allowReplies && (
            <button
              type="button"
              onClick={() => setReplyingToId(isReplying ? null : comment.id)}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] transition-colors"
            >
              <Icon icon="solar:chat-round-dots-linear" className="size-3" />
              <span>{isReplying ? "Anuluj" : "Odpowiedz"}</span>
            </button>
          )}
        </div>

        <p className="text-foreground/90 pl-8 text-xs leading-relaxed whitespace-pre-line">
          {comment.content}
        </p>

        {isReplying && (
          <div className="mt-2 pl-8">
            <CommentForm
              parentId={comment.id}
              onSubmit={async (data) => {
                await onAddComment(data);
                setReplyingToId(null);
              }}
              onCancel={() => setReplyingToId(null)}
              submitLabel="Odpowiedz"
              placeholder="Napisz odpowiedź..."
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Icon icon="solar:chat-line-linear" className="size-4" />
          <span>Komentarze ({comments.length})</span>
        </h3>
        <CommentForm onSubmit={onAddComment} />
      </div>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-xs">
            Brak komentarzy. Bądź pierwszy!
          </p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
