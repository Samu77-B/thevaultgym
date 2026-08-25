import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

function env(name: string): string {
  // Prefer process.env (Cloudflare Pages injects build env here).
  const fromProcess = (typeof process !== 'undefined' && process.env?.[name]) || '';
  const fromImport = (import.meta.env as Record<string, string | undefined>)?.[name] || '';
  return String(fromProcess || fromImport || '').trim();
}

export function isSanityConfigured(): boolean {
  const id = env('SANITY_PROJECT_ID');
  return Boolean(id) && id !== 'YOUR_PROJECT_ID';
}

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;
  const projectId = env('SANITY_PROJECT_ID');
  const dataset = env('SANITY_DATASET') || 'production';
  const token = env('SANITY_API_READ_TOKEN');

  return createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    // Fresh published content at build time (CDN can lag after Publish).
    useCdn: false,
    token: token || undefined,
  });
}

/** Build a CDN URL for a Sanity image field value. */
export function sanityImageUrl(source: unknown): string | null {
  const client = getSanityClient();
  if (!client || !source) return null;
  try {
    const builder = imageUrlBuilder(client);
    return builder.image(source as Parameters<typeof builder.image>[0]).width(2400).quality(80).auto('format').url();
  } catch {
    return null;
  }
}
