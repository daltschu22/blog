# Theme sources

This blog adapts [Bookworm Light Astro v4.0.3](https://github.com/themefisher/bookworm-light-astro),
by Themefisher, from commit
[`b94f01efcf2296568902975118305cd0da9cd80e`](https://github.com/themefisher/bookworm-light-astro/tree/b94f01efcf2296568902975118305cd0da9cd80e).

The styles in `src/styles/`, theme configuration, and Tailwind theme/grid plugins
were copied from that revision and adapted for the site's palette and dark mode.
The header, footer, post cards, article, author, and tag layouts adapt the
corresponding Bookworm components to this repository's content schema and paths.
The approved photo is displayed without cropping, and its dimensions limit
layout movement as it loads.

The adaptation retains published post filenames and URLs, the default-private
draft policy, RSS, and GitHub Pages deployment. It serves Mulish fonts locally.
Dark mode and search use small browser scripts. The template's React runtime,
client routing, demo content/images, analytics, and cloud deployment tools are
omitted. No additional npm dependencies are required by the adaptation.

Visitor statistics use the externally hosted
[Cloudflare Web Analytics beacon](https://developers.cloudflare.com/web-analytics/),
enabled through a public build-time token. The beacon is loaded directly from
Cloudflare and is not copied into this repository.

Bookworm Light is licensed under MIT, copyright © 2023–Present Themefisher.
The full license is in [licenses/Bookworm-MIT.txt](licenses/Bookworm-MIT.txt).

The GitHub, calendar, and hash SVG icons come from
[Tabler Icons](https://github.com/tabler/tabler-icons), licensed under MIT,
copyright © 2020–2026 Paweł Kuna. The full license is in
[licenses/Tabler-MIT.txt](licenses/Tabler-MIT.txt).

Mulish is licensed under the SIL Open Font License 1.1. Its copyright notice
and license are distributed with the site in
[public/fonts/Mulish-OFL.txt](public/fonts/Mulish-OFL.txt).

## Post images

`public/images/hummingbird-project/phone-scene.jpg` is a still from
*The Hummingbird Project* (2018), sourced from the thumbnail of the
[clip discussed in the post](https://www.youtube.com/watch?v=tOLr1pkdr9Q).
The image illustrates the scene discussed in the article. It is third-party
film imagery and is not covered by the theme's MIT license. Metadata was
checked and stripped where present; the image was not cropped or recompressed.
