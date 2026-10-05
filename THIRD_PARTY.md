# Theme sources

This blog adapts [AstroPaper v6.1.0](https://github.com/satnaing/astro-paper),
by Sat Naing, from commit
[`35cfa7fbe0b897306d27670d3819e55d5205f3dd`](https://github.com/satnaing/astro-paper/tree/35cfa7fbe0b897306d27670d3819e55d5205f3dd).

The theme's `src/styles/global.css`, `theme.css`, and `typography.css`,
`src/components/LinkButton.astro`, and SVG icons were copied from that revision.
The header, footer, date, post card, tag, breadcrumb, homepage, post page, and
index layouts adapt its corresponding components and pages to this site's
content schema and deployment paths.

The adaptation uses system fonts and CSS media queries for light and dark
colors. Navigation stays visible on mobile. Search, client routing, dynamic
social images, and client scripts are omitted. Article photos retain the
existing grid styling. Published Markdown filenames, the draft policy, RSS,
and GitHub Pages deployment remain configured in this repository.

AstroPaper is licensed under MIT, copyright © 2023 Sat Naing.
The full license is in [licenses/AstroPaper-MIT.txt](licenses/AstroPaper-MIT.txt).

The SVG icons included by AstroPaper come from
[Tabler Icons](https://github.com/tabler/tabler-icons), also licensed under MIT,
copyright © 2020–2026 Paweł Kuna. The full license is in
[licenses/Tabler-MIT.txt](licenses/Tabler-MIT.txt).
