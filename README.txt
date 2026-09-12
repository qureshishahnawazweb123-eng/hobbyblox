HobbyBlox — Round 2 clickable prototype (static site)
=====================================================

Upload the whole folder to any static web host (or a subfolder such as /hobbyblox-r2/).
No build step, no server code. Open index.html.

Files
  index.html   all pages (routed by URL hash: #/ , #/about, #/brands, #/mountainblox,
               #/fingerblox, #/driftingblox, #/league, #/shop, #/product/basecamp-kit,
               #/instructions, #/gallery, #/reviews, #/venues, #/contact)
  style.css    design system (HobbyBlox brand guide palette + Raleway / Inter / JetBrains Mono)
  app.js       hero carousel (8 s per slide, prev/next/dots/pause, pauses on hover),
               brand mega-menu, mobile drawer, shop/gallery filters, tabs, toasts
  img/         optimised client assets (renders, real MountainBlox photos, layouts, logos)

Fonts load from Google Fonts. A "Round 2 notes" button (bottom-right) opens the
checklist of how Steve's feedback was addressed — remove the <aside class="notes">
block and the .notes-btn button in index.html before showing it to the client if you
prefer a clean view.

Placeholders to replace before launch
  - Reviews page cards are labelled "Sample"; connect Judge.me / Shopify Reviews.
  - Store/FEC photo (img/store-photo.jpg) is cropped from Steve's mock-up — request the original.
  - DriftingBlox, RailwayBlox, QuarryBlox card images are concept imagery from Steve's mark-up.
  - Prices are from mountainblox.com on 12 Sep 2026.
