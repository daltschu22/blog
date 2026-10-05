import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';

// The same source works at GitHub's project URL or our custom domain.
// Change the SITE_URL repository variable when the custom domain is ready.
const deployment = new URL(process.env.SITE_URL || 'https://daltschu22.github.io/blog/');
const base = deployment.pathname.replace(/\/$/, '') || '/';

// Keep article image/link paths portable between /blog/ and a custom domain.
function contentURLs() {
  return (tree) => {
    function visit(node) {
      if (node.type === 'raw' && base !== '/') {
        node.value = node.value.replace(/(src|href)=(["'])\/(?!\/)/g, `$1=$2${base}/`);
      }
      for (const key of ['src', 'href']) {
        const value = node.properties?.[key];
        if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
          node.properties[key] = `${base === '/' ? '' : base}${value}`;
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

export default defineConfig({
  site: deployment.origin,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  fonts: [{
    name: 'Mulish',
    cssVariable: '--font-primary',
    provider: fontProviders.google(),
    weights: [400, 600, 700],
    display: 'swap',
    fallbacks: ['sans-serif'],
  }],
  markdown: {
    shikiConfig: { theme: 'one-dark-pro', wrap: true },
    processor: unified({ rehypePlugins: [contentURLs] }),
  },
});
