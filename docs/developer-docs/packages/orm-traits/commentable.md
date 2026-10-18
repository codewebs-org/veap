# Threaded comments (`@veap/commentable`)

`@veap/commentable` attaches polymorphic, threaded comments and moderation workflows to any `@veap/database` model (`BlogPost`, `Product`, `IssueTicket`). All comments live in a shared `comments` table with parent-child reply nesting (`parentId`) and status tracking (`pending`, `approved`, `spam`, `rejected`, `trash`).

## Installation and migration

Install `@veap/commentable` alongside `@veap/database`:

```bash
bun add @veap/commentable @veap/database
```

Run the package migrations to create the `comments` table:

```ts
import { migrations as commentableMigrations } from "@veap/commentable/migrations";
import { runMigrations } from "@veap/database";

await runMigrations("@veap/commentable", commentableMigrations);
```

## Adding `Commentable` to a model

Apply the `Commentable` mixin to your model class or extend `CommentableModel`:

```ts
import { Commentable } from "@veap/commentable";
import { Model } from "@veap/database";

export class BlogPost extends Commentable(Model) {
  static override table = "blog_posts";
  static morphAlias = "post";

  declare id: string;
  declare title: string;
}
```

## Creating replies and moderating comments

Use `model.addComment(...)` to attach a top-level comment or a nested reply (via `parentId`), and use `approvedComments()` or the `Comment` model's moderation helpers to manage visibility:

```ts
// 1. Add a comment from an authenticated user
const rootComment = await post.addComment({
  content: "Clear walkthrough of the IoC lifecycle!",
  authorId: currentUser.id,
  status: "approved",
});

// 2. Add a guest comment (pending moderation by default)
const guestComment = await post.addComment({
  content: "Does this work with SQLite and PostgreSQL?",
  authorName: "Alex Rivera",
  authorEmail: "alex@example.com",
  status: "pending",
});

// 3. Reply to an existing comment
await post.addComment({
  content: "Yes, both SQLite and PostgreSQL are supported out of the box.",
  authorId: adminUser.id,
  parentId: guestComment.id,
  status: "approved",
});

// 4. Fetch approved comments for display
const visibleComments = await post.approvedComments();
```

## Query scopes and UI components

Filter models that have comments with `whereHasComments()` and eager-load comments via `withComments()`:

```ts
const discussedPosts = await BlogPost.query()
  .whereHasComments()
  .withComments()
  .get();
```

### Rendering `<CommentSection />`

`@veap/commentable/ui` provides `<CommentSection />` and `<CommentForm />` components for rendering nested discussion threads and handling new submissions:

```tsx
import { CommentSection } from "@veap/commentable/ui";

export function ArticleDiscussion({
  postId,
  comments,
  currentUserId,
}: {
  postId: string;
  comments: any[];
  currentUserId?: string;
}) {
  return (
    <CommentSection
      commentableId={postId}
      commentableType="post"
      comments={comments}
      currentUserId={currentUserId}
      onSubmitComment={async (payload) => {
        "use server";
        // Persist comment via post.addComment(payload)
      }}
    />
  );
}
```
