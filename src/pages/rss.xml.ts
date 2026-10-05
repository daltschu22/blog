import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publishedPosts, pathFor } from '../lib/posts';

export async function GET(context: APIContext) {
  return rss({
    title: 'Blog — daltschu22',
    description: 'Notes on solar hardware, radio protocols, and home automation.',
    site: context.site!,
    items: (await publishedPosts()).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: pathFor(`posts/${post.id}/`),
      categories: post.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
