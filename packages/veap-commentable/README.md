# @veap/commentable (Veap Commentable)

Polymorphic threaded comment and review package for the **Veap ORM**, inspired by modern discussion and review systems.

`@veap/commentable` provides a universal commenting system for any model (`BlogPost`, `ProductReview`, `IssueTicket`, etc.) with nested reply trees, author associations, moderation workflows, and ready-made UI components.

---

## Features

- 💬 **100% Polymorphic**: Attach threaded discussions to any model using the `morphMany` relation without changing target tables.
- 🌲 **Nested Replies**: Built-in support for parent-child threaded replies (`parent`, `replies`).
- 🛡️ **Moderation Statuses**: Status tracking (`pending`, `approved`, `spam`, `rejected`, `trash`).
- 👤 **Flexible Authorship**: Support for logged-in user relations (`author`) or guest comments (`author_name`, `author_email`).
- 🔍 **Query Scopes**: `whereHasComments()` and eager-loading `withComments()`.
- 🎨 **Ready-to-Use UI**: Includes `<CommentSection />` and `<CommentForm />` in `@veap/commentable/ui`.

---

## Installation

Install `@veap/commentable` alongside `@veap/database`:

```bash
bun add @veap/commentable @veap/database
```

Run migrations to create the `comments` table:

```ts
import { runMigrations } from "@veap/database";
import { migrations } from "@veap/commentable/migrations";

await runMigrations("@veap/commentable", migrations);
```

---

## Usage

### 1. Adding `Commentable` to Your Model

```ts
import { Model } from "@veap/database";
import { Commentable } from "@veap/commentable";

export class BlogPost extends Commentable(Model) {
  static override table = "blog_posts";
  static morphAlias = "post"; // optional explicit polymorphic type alias
}
```

Or inherit directly from `CommentableModel`:

```ts
import { CommentableModel } from "@veap/commentable";

export class BlogPost extends CommentableModel {
  static override table = "blog_posts";
}
```

### 2. Adding & Fetching Comments

```ts
// Add a comment to an article
await post.addComment({
  content: "Great article!",
  authorId: user.id,
  status: "approved",
});

// Add a guest comment
await post.addComment({
  content: "Thanks for sharing!",
  authorName: "John Doe",
  authorEmail: "john@example.com",
});

// Reply to an existing comment
await post.addComment({
  content: "Glad you found it useful!",
  authorId: adminUser.id,
  parentId: parentComment.id,
});

// Retrieve only approved comments
const approved = await post.approvedComments();
```

---

## UI Component (`@veap/commentable/ui`)

```tsx
import { CommentSection } from "@veap/commentable/ui";

export function PostDetail({ post, comments, currentUserId }) {
  return (
    <CommentSection
      commentableId={post.id}
      commentableType="post"
      comments={comments}
      currentUserId={currentUserId}
      onSubmitComment={async (data) => {
        "use server";
        // handle server-side comment submission
      }}
    />
  );
}
```
