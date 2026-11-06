import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

/**
 * Videos for the landing page: either an uploaded file (best: no third-party cookies, plays inline)
 * or a link to YouTube / Vimeo / Instagram / TikTok.
 */
export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'orientation', 'featured', 'order', 'active'],
    group: 'Content',
    description:
      'Upload a video file (MP4 recommended, under ~30 MB) or paste a link. Vertical phone videos work best.',
  },
  access: {
    read: ({ req: { user } }) => user?.collection === 'users' || { active: { equals: true } },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    staticDir: 'videos',
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    // a video can be just a link, without a file
    filesRequiredOnCreate: false,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'caption', type: 'text', admin: { description: 'One short line shown under the title' } },
    {
      name: 'externalUrl',
      label: 'Or a link (YouTube, Vimeo, Instagram, TikTok)',
      type: 'text',
      admin: { description: 'Used when no file is uploaded' },
    },
    {
      name: 'poster',
      label: 'Cover image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. Without it the first frame of the video is used.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'orientation',
          type: 'select',
          defaultValue: 'portrait',
          options: [
            { label: 'Vertical (phone, 9:16)', value: 'portrait' },
            { label: 'Horizontal (16:9)', value: 'landscape' },
          ],
        },
        { name: 'order', type: 'number', defaultValue: 0 },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Shown large above the others' },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req, originalDoc }) => {
        const hasFile = Boolean(req.file || data?.filename || originalDoc?.filename)
        if (!hasFile && !data?.externalUrl) {
          throw new Error('Upload a video file or add a link.')
        }
        return data
      },
    ],
  },
}
