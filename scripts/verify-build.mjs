import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

const deployment = new URL(process.env.SITE_URL || 'https://daltschu22.github.io/blog/');
const base = deployment.pathname.replace(/\/$/, '');
const dist = join(process.cwd(), 'dist');
const failures = [];
function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)]);
}
const files = walk(dist);
const home = readFileSync(join(dist, 'index.html'), 'utf8');
const feed = readFileSync(join(dist, 'rss.xml'), 'utf8');
const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
for (const file of files.filter((file) => file.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const page = `${base}/${relative(dist, file).replace(/index\.html$/, '')}`;
  const expected = new URL(page, deployment.origin);
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
  if (file.endsWith('/404.html')) {
    if (!html.includes('name="robots" content="noindex"')) failures.push('404 page must be excluded from search');
  } else if (!canonical || canonical[1] !== expected.href) failures.push(`${page}: incorrect canonical URL`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replace(/&amp;/g, '&');
    if (/^(?:#|mailto:|tel:|data:)/.test(value)) continue;
    const url = new URL(value, expected);
    if (url.origin !== deployment.origin) continue;
    if (base && !url.pathname.startsWith(`${base}/`)) {
      failures.push(`${page}: local link escapes deployment base`);
      continue;
    }
    const target = join(dist, decodeURIComponent(url.pathname.slice(base.length)));
    if (!(existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html'))))) failures.push(`${page}: missing local target ${url.pathname}`);
  }
}
const postsRoot = join(process.cwd(), 'src/content/posts');
for (const file of walk(postsRoot).filter((file) => file.endsWith('.md'))) {
  const frontmatter = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error(`Missing frontmatter: ${relative(postsRoot, file)}`);
  const post = parse(frontmatter[1]);
  const slug = relative(postsRoot, file).replace(/\.md$/, '').toLowerCase().replace(/ /g, '-');
  const expectedArticle = new URL(`${base}/posts/${slug}/`, deployment.origin).href;
  if (post.draft === false) {
    if (!existsSync(join(dist, 'posts', slug, 'index.html'))) failures.push(`${slug}: published article page is missing`);
    if (!home.includes(expectedArticle.replace(deployment.origin, ''))) failures.push(`${slug}: homepage link is missing`);
    if (!feed.includes(expectedArticle)) failures.push(`${slug}: RSS item is missing`);
    if (!sitemap.includes(expectedArticle)) failures.push(`${slug}: sitemap item is missing`);
  } else {
    if (existsSync(join(dist, 'posts', slug, 'index.html'))) failures.push(`${slug}: draft article was published`);
    if (home.includes(post.title) || feed.includes(post.title) || sitemap.includes(expectedArticle)) failures.push(`${slug}: draft leaked into an index or feed`);
  }
}
if (failures.length) throw new Error(`Build checks failed:\n${failures.join('\n')}`);
console.log(`Build checks passed (${files.filter((file) => file.endsWith('.html')).length} pages; links, images, canonical URLs, RSS, sitemap).`);
