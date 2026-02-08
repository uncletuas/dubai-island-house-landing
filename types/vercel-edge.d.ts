/**
 * Minimal typings for Vercel Edge Functions.
 *
 * This keeps TypeScript happy without pulling in full Node typings.
 */
declare const process: {
  env: Record<string, string | undefined>;
};
