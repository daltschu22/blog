# Blog repository conventions

- Posts live in `src/content/posts/` as Markdown. Keep published filenames stable.
- Drafts default to private on the website, but this Git repository is public.
  Never commit unpublished material that must remain private.
- Keep claims grounded in the linked project's documented behavior and limits.
  Leave out troubleshooting diaries, internal hostnames, radio identities,
  addresses, installation data, logs, and credentials.
- Write directly. Avoid slogans, motivational sign-offs, manufactured branding,
  and filler that announces why a fact matters instead of explaining it.
- Review photos and remove metadata before adding their approved hashes.
- Keep the site static, with minimal dependencies and no browser JavaScript
  unless a requested feature needs it.
- Changes must work both at `/blog/` and at the custom domain's `/`.
- Run `npm run check`, `npm run build`, and `npm run verify` before committing.
- Review tracked and untracked files before staging. Commit relevant source
  changes and push to `main` when requested work is complete and validated.
  Merging to `main` publishes the site.
- The live deployment URL comes from the `SITE_URL` GitHub Actions variable.
