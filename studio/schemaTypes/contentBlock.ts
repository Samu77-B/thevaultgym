import { defineArrayMember, defineField, defineType } from 'sanity';

export const contentBlock = defineType({
  name: 'contentBlock',
  title: 'Content block',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      title: 'Block type',
      type: 'string',
      options: {
        list: [
          { title: 'Main heading', value: 'heading' },
          { title: 'Tagline', value: 'tagline' },
          { title: 'Section title', value: 'sectionTitle' },
          { title: 'Paragraph', value: 'paragraph' },
          { title: 'Paragraph with links (HTML)', value: 'html' },
          { title: 'Bullet list', value: 'list' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 4,
      hidden: ({ parent }) => parent?.kind === 'html' || parent?.kind === 'list',
    }),
    defineField({
      name: 'href',
      title: 'Link (section title only)',
      type: 'string',
      description: 'Site path like /nutrition or full URL',
      hidden: ({ parent }) => parent?.kind !== 'sectionTitle',
    }),
    defineField({
      name: 'headingLevel',
      title: 'Heading level',
      type: 'string',
      options: {
        list: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      },
      initialValue: 'h1',
      hidden: ({ parent }) => parent?.kind !== 'heading',
    }),
    defineField({
      name: 'html',
      title: 'HTML',
      type: 'text',
      rows: 6,
      description: 'Use for paragraphs that need links or formatting',
      hidden: ({ parent }) => parent?.kind !== 'html',
    }),
    defineField({
      name: 'listText',
      title: 'Bullet list items',
      type: 'text',
      rows: 6,
      description: 'One item per line',
      hidden: ({ parent }) => parent?.kind !== 'list',
    }),
  ],
  preview: {
    select: { kind: 'kind', text: 'text', html: 'html', listText: 'listText' },
    prepare({ kind, text, html, listText }) {
      const snippet = (text || html || listText || '').toString().slice(0, 60);
      return {
        title: kind || 'block',
        subtitle: snippet,
      };
    },
  },
});

export const heroButton = defineType({
  name: 'heroButton',
  title: 'Hero button',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Button text', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'Site path like /train-with-a-pro or full URL',
      validation: (R) => R.required(),
    }),
  ],
});

export const heroOverlay = defineType({
  name: 'heroOverlay',
  title: 'Hero overlay',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'H1 heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'H2 subheading', type: 'string' }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      of: [defineArrayMember({ type: 'heroButton' })],
    }),
  ],
});

export const pageSeo = defineType({
  name: 'pageSeo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Meta description', type: 'text', rows: 3 }),
    defineField({
      name: 'ogImage',
      title: 'OG image path',
      type: 'string',
      description: 'Optional path like /images/uploads/share.jpg',
    }),
  ],
});
