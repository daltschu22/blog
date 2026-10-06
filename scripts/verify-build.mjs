import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

const deployment = new URL(process.env.SITE_URL || 'https://daltschu22.github.io/blog/');
const base = deployment.pathname.replace(/\/$/, '');
const dist = join(process.cwd(), 'dist');
const failures = [];
const analyticsToken = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();
if (analyticsToken && !/^[a-f0-9]{32}$/.test(analyticsToken)) {
  throw new Error('CLOUDFLARE_WEB_ANALYTICS_TOKEN must be a 32-character public beacon token.');
}
const analyticsScript = analyticsToken
  ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;:&quot;${analyticsToken}&quot;}" data-site-script="analytics"></script>`
  : null;
const allowedScripts = new Map(['theme', 'search'].map(name => {
  const component = name === 'theme' ? 'ThemeMode' : 'SearchController';
  const source = readFileSync(join(process.cwd(), 'src/components', `${component}.astro`), 'utf8');
  return [name, source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1].trim()];
}));
function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)]);
}
const files = walk(dist);
const archive = readFileSync(join(dist, 'posts/index.html'), 'utf8');
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
  const scripts = new Map();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/ld\+json"/.test(match[1])) continue;
    const name = match[1].match(/data-site-script="([^"]+)"/)?.[1];
    if (name === 'analytics') {
      if (match[0] !== analyticsScript) {
        failures.push(`${page}: unexpected analytics script`);
      } else scripts.set(name, (scripts.get(name) || 0) + 1);
      continue;
    }
    if (!allowedScripts.has(name) || allowedScripts.get(name) !== match[2].trim() || /\bsrc=/.test(match[1])) failures.push(`${page}: unexpected browser JavaScript`);
    else scripts.set(name, (scripts.get(name) || 0) + 1);
  }
  if (scripts.get('theme') !== 1) failures.push(`${page}: missing or duplicate theme script`);
  if ((scripts.get('analytics') || 0) !== (analyticsToken ? 1 : 0)) failures.push(`${page}: incorrect analytics script placement`);
  const isSearch = relative(dist, file) === 'search/index.html';
  if ((scripts.get('search') || 0) !== (isSearch ? 1 : 0)) failures.push(`${page}: incorrect search script placement`);
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
    if (!archive.includes(expectedArticle.replace(deployment.origin, ''))) failures.push(`${slug}: post archive link is missing`);
    if (!feed.includes(expectedArticle)) failures.push(`${slug}: RSS item is missing`);
    if (!sitemap.includes(expectedArticle)) failures.push(`${slug}: sitemap item is missing`);
  } else {
    if (existsSync(join(dist, 'posts', slug, 'index.html'))) failures.push(`${slug}: draft article was published`);
    if (files.filter(file => file.endsWith('.html')).some(file => readFileSync(file, 'utf8').includes(post.title)) || feed.includes(post.title) || sitemap.includes(expectedArticle)) failures.push(`${slug}: draft leaked into a page or feed`);
  }
}
if (failures.length) throw new Error(`Build checks failed:\n${failures.join('\n')}`);
console.log(`Build checks passed (${files.filter((file) => file.endsWith('.html')).length} pages; links, images, canonical URLs, RSS, sitemap).`);
