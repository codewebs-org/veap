# Uploading files and custom cloud drivers

Use `StorageService` to validate, store, and delete uploaded files across local disk or custom cloud storage adapters.

## Uploading and deleting files in Server Actions

Resolve `StorageService` from the container inside a Next.js Server Action or Route Handler:

```ts
"use server";

import { app, AppError, handleActionError, ok } from "@veap/kernel";
import { StorageService } from "@veap/storage";
import { initializeSystem } from "@/lib/veap";

export async function uploadDocumentAction(formData: FormData) {
  try {
    await initializeSystem();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw AppError.BadRequest("Attach a valid file.");
    }

    const storage = await app(StorageService);
    const result = await storage.upload(file, "local");

    if ("error" in result) {
      throw AppError.Validation(result.error);
    }

    return ok({
      url: result.url,
      serviceId: result.serviceId,
      size: result.size,
    });
  } catch (e) {
    return handleActionError(e, "uploadDocumentAction");
  }
}
```

## Registering a custom cloud storage provider

To store uploads in AWS S3, Cloudflare R2, or Supabase Storage, implement `IStorageProvider` (`id`, `upload(file)`, and `delete(serviceId)`) and register it with `StorageService` during provider boot:

```ts
import { ServiceProvider } from "@veap/kernel";
import {
  type IStorageProvider,
  StorageService,
  type UploadResult,
} from "@veap/storage";

export class S3StorageProvider implements IStorageProvider {
  readonly id = "s3";

  async upload(file: File): Promise<UploadResult> {
    return {
      url: `https://cdn.example.com/${file.name}`,
      serviceId: file.name,
      size: file.size,
      mimeType: file.type,
    };
  }

  async delete(_serviceId: string): Promise<boolean> {
    return true;
  }
}

export class CloudStorageServiceProvider extends ServiceProvider {
  register(): void {}

  async boot(): Promise<void> {
    const storage = await this.container.resolve(StorageService);
    storage.registerProvider(new S3StorageProvider());
  }
}
```
