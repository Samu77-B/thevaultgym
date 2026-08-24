import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export function isSanityConfigured(): boolean {
  const id = (import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '').trim();
  return Boolean(id) && id !== 'YOUR_PROJECT_ID';
}

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;
  const projectId = (import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '').trim();
  const dataset = (import.meta.env.SANITY_DATASET || process.env.SANITY_DATASET || 'production').trim();
  const token = (import.meta.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_READ_TOKEN || '').trim();

  return createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    useCdn: true,
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
