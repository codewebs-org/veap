# `@veap/commentable` API reference

`@veap/commentable` provides polymorphic threaded discussion systems for
`@veap/database` Active Record models. It supports nested parent-child replies,
optional authenticated user links (`@veap/auth`), moderation statuses, query
builder scopes, factories, and UI conversation components.

## Subpath exports

`@veap/commentable` exposes four entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/commentable` | Core mixin (`Commentable`), base model (`CommentableModel`), `Comment` entity, and query builder (`CommentableQueryBuilder`). |
| `@veap/commentable/migrations` | Knex migrations creating the polymorphic `comments` table with moderation statuses. |
| `@veap/commentable/ui` | React UI discussion list and comment submission form components (`CommentSection`, `CommentForm`). |
| `@veap/commentable/testing` | Test utilities and model factory (`CommentFactory`) for testing environments. |

## Core APIs and classes

The table below summarizes the primary classes, mixins, and utilities exported
by `@veap/commentable`:

| Symbol | Kind | Signature / Props | Description |
| :--- | :--- | :--- | :--- |
| `Commentable` | Function | `Commentable<T extends Constructor<Model>>(Base: T)` | Class mixin adding polymorphic comment relationships and submission helpers. |
| `CommentableModel` | Class | `class CommentableModel extends Model` | Base Active Record class with built-in polymorphic commenting capabilities. |
| `Comment` | Class | `class Comment extends Model` | Entity representing a threaded comment with optional parent and user links. |
| `CommentableQueryBuilder` | Class | `class CommentableQueryBuilder extends ModelQueryBuilder` | Extends query builder with comment scopes (`whereHasComments`, `withComments`). |
| `CommentFactory` | Class | `defineFactory(Comment, ...)` | Model factory for generating realistic fake comments and replies in tests (exported from `@veap/commentable/testing`). |

## Model instance methods

Models extending `CommentableModel` or using `Commentable(Base)` expose the
following instance methods:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `comments` | `comments(): MorphMany<any, Comment>` | Defines the polymorphic one-to-many relationship to the `comments` table. |
| `approvedComments` | `approvedComments(): Promise<Comment[]>` | Returns only comments with `status: "approved"`, sorted chronologically. |
| `addComment` | `addComment(attributes: CommentInput): Promise<Comment>` | Creates and associates a new comment (or nested reply via `parentId`) with the model. |

## `Comment` entity methods and relations

The `Comment` Active Record model represents individual comments and supports
nested conversation threads:

| Method / Property | Signature / Type | Description |
| :--- | :--- | :--- |
| `author` | `author(): Relation<Comment, User>` | Belongs-to relation to the authenticated `User` model, if provided. |
| `parent` | `parent(): Relation<Comment, Comment>` | Belongs-to relation pointing to the parent comment for nested reply threads. |
| `replies` | `replies(): Relation<Comment, Comment>` | Has-many relation returning direct child replies to this comment. |
| `status` | `"pending" \| "approved" \| "spam" \| "rejected" \| "trash"` | Current moderation status governing public visibility. |

## Query builder scopes

`CommentableQueryBuilder` adds convenient filtering and eager-loading scopes:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `whereHasComments` | `whereHasComments(): this` | Filters models that have at least one associated comment. |
| `withComments` | `withComments(): this` | Preloads attached comments in a single database query. |
