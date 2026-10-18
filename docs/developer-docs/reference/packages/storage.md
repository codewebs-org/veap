# `@veap/storage` API reference

`@veap/storage` provides a multi-driver file upload and deletion service (`StorageService`) with a built-in `LocalFileProvider` (`id: "local"`) and a pluggable `IStorageProvider` contract for cloud object storage adapters.

## Subpath exports

`@veap/storage` exposes three entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/storage` | `StorageService`, `StorageServiceProvider`, `LocalFileProvider`, and storage types. |
| `@veap/storage/providers/local` | `LocalFileProvider` implementation writing sanitized uploads to `FILE_STORAGE_FOLDER` (default `public/uploads`). |
| `@veap/storage/types` | `IStorageProvider`, `StorageData`, `StorageError`, and `StorageResult`. |

## `StorageService` and `IStorageProvider` API

Resolve `StorageService` from the container (`await app(StorageService)`) to upload or delete files, or register additional cloud storage providers:

| Member | Signature | Description |
| :--- | :--- | :--- |
| `storage.upload` | `upload(file: File, providerId?: string): Promise<StorageResult>` | Uploads a web `File` using the specified provider (defaults to `"local"`). Returns `StorageData` (`{ name, url, type, size, service, serviceId }`) or `StorageError` (`{ error: string }`). |
| `storage.delete` | `delete(serviceId: string, providerId?: string): Promise<boolean>` | Deletes a stored file by its `serviceId` from the specified provider. |
| `storage.registerProvider` | `registerProvider(provider: IStorageProvider): void` | Registers a custom storage driver (such as `"s3"` or `"r2"`) under `provider.id`. |
| `storage.getProvider` | `getProvider(id: string): IStorageProvider \| undefined` | Retrieves a registered storage provider by its `id`. |
