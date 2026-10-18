# File storage (`@veap/storage`)

`@veap/storage` routes web `File` uploads to named storage providers (`IStorageProvider`). Out of the box, `StorageServiceProvider` registers `LocalFileProvider` (`id: "local"`), which validates MIME types and extensions, sanitizes filenames, prevents path traversal, and writes files to `FILE_STORAGE_FOLDER` (defaulting to `public/uploads`).

## Registering `StorageServiceProvider`

Register `StorageServiceProvider` in your `lib/veap.ts` composition root:

```ts
// lib/veap.ts
import { Application } from "@veap/kernel";
import { StorageServiceProvider } from "@veap/storage";

export const app = Application.configure()
  .use(StorageServiceProvider)
  .create();
```

## Next steps

Continue exploring `@veap/storage`:

- [Uploading files and custom cloud drivers](./uploads-and-drivers.md) — Handle `FormData` file uploads in Server Actions and register custom S3, R2, or Supabase storage providers.
