import { defineArrayMember, defineField, defineType } from 'sanity';

/** Fixed site pages — slug must match Astro route slug (e.g. about, train-with-a-pro). */
export const PAGE_SLUG_OPTIONS = [
  { title: 'Home', value: 'index' },
  { title: 'About', value: 'about' },
  { title: 'Contact', value: 'contact' },
  { title: 'Work With Us', value: 'train-for-a-living' },
  { title: 'Train With Us', value: 'train-with-a-pro' },
  { title: 'Specialist Services', value: 'pt-consultations' },
  { title: 'Shoreditch Gym', value: 'shoreditch-gym' },
  { title: 'Sports Specific Training', value: 'sports-specific-training' },
  { title: 'Nutrition', value: 'nutrition' },
  { title: 'Services — Personal Training', value: 'services-personal-training' },
  { title: 'Services — Boxing', value: 'services-boxing' },
  { title: 'Services — Heavy Weights', value: 'services-heavy-weights' },
  { title: 'Services — HYROX', value: 'services-hyrox' },
  { title: 'Services — Muay Thai', value: 'services-muay-thai' },
  { title: 'Services — Pilates', value: 'services-pilates' },
  { title: 'Services — Yoga', value: 'services-yoga' },
  { title: 'Services — Course Venues', value: 'services-course-venues' },
  { title: 'Terms', value: 'terms' },
  { title: 'Privacy Policy', value: 'privacy-policy' },
] as const;

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page name (Studio only)',
      type: 'string',
      description: 'Shown in the CMS list — e.g. About, Train With Us',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Page',
      type: 'string',
      options: {
        list: PAGE_SLUG_OPTIONS.map((o) => ({ title: o.title, value: o.value })),
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroBackgroundImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      description: 'Landscape, at least 1920×1080. Subject centred.',
    }),
    defineField({
      name: 'heroImagePath',
      title: 'Hero image path (legacy)',
      type: 'string',
      description:
        'Optional fallback if you keep an existing site path like /images/uploads/photo.jpg instead of uploading above.',
    }),
    defineField({
      name: 'heroOverlay',
      title: 'Hero overlay text',
      type: 'heroOverlay',
    }),
    defineField({
      name: 'paragraphColumns',
      title: 'Multi-column paragraphs',
      type: 'boolean',
      description: 'Lay consecutive paragraphs out in columns (About / Gym style).',
      initialValue: false,
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Main page text',
      type: 'array',
      of: [defineArrayMember({ type: 'contentBlock' })],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'pageSeo',
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug', media: 'heroBackgroundImage' },
    prepare({ title, slug, media }) {
      return {
        title: title || slug || 'Page',
        subtitle: slug ? `/${slug === 'index' ? '' : slug}` : '',
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
