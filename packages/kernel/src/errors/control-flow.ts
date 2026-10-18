/**
 * Checks whether an error is a framework control-flow signal.
 *
 * Frameworks like Next.js (or Remix/Astro) throw special errors to perform
 * client/server redirects (`NEXT_REDIRECT`) or display 404 pages (`NEXT_NOT_FOUND`).
 * These errors represent normal control flow and must never be swallowed or
 * masked as unhandled system errors.
 */
export function isControlFlowError(err: unknown): boolean {
  if (!err || typeof err !== "object") {
    return false;
  }

  const error = err as {
    message?: unknown;
    digest?: unknown;
  };

  if (
    error.message === "NEXT_REDIRECT" ||
    error.message === "NEXT_NOT_FOUND" ||
    error.digest === "NEXT_NOT_FOUND"
  ) {
    return true;
  }

  if (typeof error.digest === "string") {
    return (
      error.digest.startsWith("NEXT_REDIRECT") ||
      error.digest.startsWith("NEXT_NOT_FOUND")
    );
  }

  return false;
}
