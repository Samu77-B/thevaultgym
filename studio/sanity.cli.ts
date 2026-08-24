import { defineCliConfig } from 'sanity/cli';

/**
 * After you create a Sanity project, set projectId here (or via env).
 * Dataset is usually `production`.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '7jggn04g',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
});
