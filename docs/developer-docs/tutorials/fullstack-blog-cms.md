# Building a full-stack multilingual blog CMS

This tutorial walks you step by step through building a complete multilingual blog and Content Management System (CMS) with Next.js App Router, `@veap/kernel`, `@veap/database`, `@veap/translatable`, `@veap/taggable`, `@veap/auth`, and `@veap/plugins`.

## Step 1: Scaffold the project and install packages

Initialize a new Veap application with `create-veap` and install the database, authentication, and polymorphic ORM trait packages:

```bash
bun create veap acme-blog
cd acme-blog
bun add @veap/database @veap/auth @veap/plugins @veap/translatable @veap/taggable
```

Generate an encryption key for `@veap/auth` and add it to `.env`:

```bash
echo "ENCRYPTION_KEY=$(openssl rand -base64 16)" >> .env
echo "DATABASE_URL=./dev.sqlite" >> .env
```

## Step 2: Create the `posts` migration and register trait migrations

Scaffold a database migration for the `posts` table:

```bash
bun veap make:migration create_posts_table
```

Update the generated migration file in `migrations/` so `posts` stores the non-translatable fields (`id`, `author_id`, `is_published`, and timestamps), while localized `title`, `slug`, and `content` values live in `@veap/translatable`:

```ts
// migrations/20261017000000_create_posts_table.ts
import { type Migration, Schema } from "@veap/database";

export const createPostsTable: Migration = {
  name: "20261017000000_create_posts_table",
  async up() {
    await Schema.create("posts", (table) => {
      table.increments("id").primary();
      table.integer("author_id").notNullable().index();
      table.boolean("is_published").notNullable().defaultTo(false);
      table.timestamps(true, true);
    });
  },
  async down() {
    await Schema.dropIfExists("posts");
  },
};
```

In `migrations/index.ts`, combine your `createPostsTable` migration with the migrations from `@veap/translatable/migrations` and `@veap/taggable/migrations`:

```ts
// migrations/index.ts
import { migrations as taggableMigrations } from "@veap/taggable/migrations";
import { migrations as translatableMigrations } from "@veap/translatable/migrations";
import { createPostsTable } from "./20261017000000_create_posts_table";

export const appMigrations = [
  ...translatableMigrations,
  ...taggableMigrations,
  createPostsTable,
];
```

## Step 3: Define the `Post` model with `Translatable` and `Taggable`

Create `lib/models/post.ts` and compose `Translatable` and `Taggable` around `@veap/database`'s `Model`:

```ts
// lib/models/post.ts
import { User } from "@veap/auth/models";
import { type BelongsTo, Model } from "@veap/database";
import { Taggable } from "@veap/taggable";
import { Translatable } from "@veap/translatable";

export class Post extends Taggable(Translatable(Model)) {
  static override table = "posts";
  static override translatable = ["title", "slug", "content"];

  declare id: number;
  declare author_id: number;
  declare is_published: boolean;
  declare title: string;
  declare slug: string;
  declare content: string;

  protected static override casts = {
    is_published: "boolean",
  } as const;

  public author(): BelongsTo<User> {
    return this.belongsTo(User, "author_id");
  }
}
```

## Step 4: Wire the composition root (`lib/veap.ts`)

Register `DatabaseServiceProvider`, `AuthServiceProvider`, `PluginsServiceProvider`, and `.withMigrations(appMigrations)` in `lib/veap.ts`:

```ts
// lib/veap.ts
import { AuthServiceProvider } from "@veap/auth";
import { DatabaseServiceProvider } from "@veap/database";
import { Application } from "@veap/kernel";
import { PluginsServiceProvider } from "@veap/plugins";
import { appMigrations } from "../migrations";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(AuthServiceProvider)
  .use(PluginsServiceProvider)
  .withMigrations(appMigrations)
  .create();

export async function initializeSystem(): Promise<void> {
  await app.bootstrap();
}
```

## Step 5: Create a Server Action to publish multilingual posts

Write a Server Action in `app/actions/posts.ts` that verifies the authenticated session via `getCurrentSession()`, creates a `Post` with English and German translations, and attaches tags inside a single database transaction:

```ts
// app/actions/posts.ts
"use server";

import { getCurrentSession } from "@veap/auth";
import { transaction } from "@veap/database";
import { AppError, handleActionError, ok } from "@veap/kernel";
import { initializeSystem } from "@/lib/veap";
import { Post } from "@/lib/models/post";

export interface CreatePostInput {
  translations: {
    en: { title: string; slug: string; content: string };
    de: { title: string; slug: string; content: string };
  };
  tags: string[];
}

export async function createPostAction(input: CreatePostInput) {
  try {
    await initializeSystem();
    const session = await getCurrentSession();

    if (!session?.user) {
      throw AppError.Unauthorized("You must sign in before publishing a post.");
    }

    const post = await transaction(async () => {
      const created = new Post({
        author_id: session.user.id,
        is_published: true,
      });
      created.fillTranslations(input.translations);
      await created.save();
      await created.syncTags(input.tags);
      return created;
    });

    return ok({ id: post.id, slug: post.slug });
  } catch (e) {
    return handleActionError(e, "createPostAction");
  }
}
```

## Step 6: Render the localized blog feed in a Server Component

In `app/page.tsx`, eager-load translations (`withTranslations`), author (`with("author")`), and tags (`with("tags")`) to render the published blog feed with zero N+1 queries:

```tsx
// app/page.tsx
import { withLocale } from "@veap/translatable";
import { initializeSystem } from "@/lib/veap";
import { Post } from "@/lib/models/post";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  await initializeSystem();

  const posts = await withLocale("en", async () =>
    Post.query()
      .where("is_published", true)
      .withTranslations(["en", "de"])
      .with("author", "tags")
      .orderBy("created_at", "desc")
      .get(),
  );

  return (
    <main className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-bold">Latest Articles</h1>
      <div className="mt-8 space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-muted-foreground">{post.content}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
```
