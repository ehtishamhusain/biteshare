import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Keeps private admin and internal backend routes hidden from Google
    },
    sitemap: 'https://biteshare.in/sitemap.xml',
  };
}