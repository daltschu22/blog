# Blog

A static, Markdown-driven project blog, built with Astro and published by GitHub
Pages. The source of every article lives in this repository.

The layout adapts [Bookworm Light](https://github.com/themefisher/bookworm-light-astro)
with compact photo cards, article typography, and tag pages. The dark mode
button follows the system preference until a reader chooses a mode, then
remembers that choice. Mulish fonts are served with the site, and Tailwind runs
only during the build. Small browser scripts handle dark mode, search, and analytics;
the rest of the site is static.

See [THIRD_PARTY.md](THIRD_PARTY.md) for the upstream version and licenses.

Site: **https://blog.daltschu.com/**

Without `SITE_URL`, local builds use `https://daltschu22.github.io/blog/`.

## Write a post

Add a file to `src/content/posts/`. Its filename becomes its permanent URL;
`my-project.md` becomes `/posts/my-project/`. Keep the filename stable when
updating an article.

```markdown
---
title: "My project"
description: "A short description for the homepage and RSS feed."
date: 2026-10-05
tags: [hardware]
draft: true
---

Write your article here.
```

Set `draft: false` when ready to publish. Posts default to draft if the field is
omitted. Drafts are excluded from article pages, the homepage, RSS, and sitemap.
This is a public repository: a draft file committed here is still publicly
readable. Keep private writing in a separate private checkout or repository.

Use `updated: YYYY-MM-DD` for a later substantive revision. Optional `project`
links the article to its software repository. Optional `image` is a path relative
to `public/`, for example `images/my-project/photo.jpg`.
Set `imageAlt`, `imageWidth`, and `imageHeight` for descriptive alternative text
and the photo's original pixel dimensions. Photos are displayed without cropping.

Put photos in `public/images/`, remove identifying labels and metadata, and
review them before updating the approved image hashes in
`scripts/check-publication.mjs`. Article image URLs can use `/images/...`;
the build prefixes the deployment path automatically.

## Preview and validate

Use Node 22.12 or newer:

```bash
npm ci
npm run dev
```

The development server shows published posts. To preview a draft, set
`draft: false` locally and review it before committing.

Before pushing:

```bash
npm run check
npm run build
npm run verify
```

Checks cover publication privacy, Astro/TypeScript, generated internal links,
image paths, canonical URLs, RSS, and sitemap.

## Publishing

Pull requests run checks and a build. Pushes to `main` run those same checks,
then deploy to GitHub Pages. There is no publication from a pull request and
no external cross-posting automation. The RSS feed is at `/rss.xml`.

GitHub Actions use the latest stable major-version tags and receive updates
within those majors automatically. npm installs use the committed lockfile.
Build output and local secrets stay ignored. No server, credentials, or live
inverter connection is needed to serve this site.

## Visitor statistics

The site uses [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/)
for visits and page views. Its site configuration is managed in the
[`home-tf` Cloudflare stack](https://github.com/daltschu22/home-tf/tree/main/cloudflare).
Set the blog repository's `CLOUDFLARE_WEB_ANALYTICS_TOKEN` Actions variable to
Terraform's `blog_web_analytics_token` output. This is a public beacon token,
not a Cloudflare API credential.

Production builds include Cloudflare's deferred beacon when the token is set.
Development previews and builds without the token do not collect analytics.
Statistics start after the beacon is deployed and are available in the
Cloudflare dashboard under Web Analytics → `blog.daltschu.com`.

## Connect the custom domain

The live site uses `blog.daltschu.com`. Its Cloudflare record is managed with
Terraform as a DNS-only CNAME to `daltschu22.github.io`.

To reproduce this setup:

Verify ownership of `daltschu.com` in your GitHub account's Settings → Pages
using the TXT record GitHub supplies. Then:

1. In this repository's Settings → Pages, set the custom domain to
   `blog.daltschu.com`.
2. In Cloudflare, add a **DNS-only CNAME**, name `blog`, target
   `daltschu22.github.io`. Replace conflicting records for that exact name if
   present. The target contains no repository path.
3. Set this repository's Actions variable `SITE_URL` to
   `https://blog.daltschu.com/`, then rerun **Publish blog**. This changes the
   deployment base, canonical URLs, RSS, and sitemap together.
4. Enable **Enforce HTTPS** in Pages after the certificate is ready.

The specific record for `blog` overrides the wildcard for that name. The site
is hosted by GitHub and does not depend on home servers.

For a local build matching the custom domain:

```bash
SITE_URL=https://blog.daltschu.com/ npm run build
SITE_URL=https://blog.daltschu.com/ npm run verify
```

## Content and photos

The first article is adapted from the SolarCity project write-up. The tested
hardware, protocol details, and compatibility limits are retained. Code and
installation instructions remain in
[SolarCity Inverter Radio](https://github.com/daltschu22/solar-city-inverter-radio).

The hardware photos were supplied by the project owner and reviewed with
metadata removed. The source check pins their reviewed bytes.
