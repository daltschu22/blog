import { getCollection } from 'astro:content';

export async function publishedPosts() {
  return (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function pathFor(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function shortDate(date: Date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
  return `${day} ${month}, ${date.getUTCFullYear()}`;
}

export function humanize(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/^./, character => character.toUpperCase());
}
