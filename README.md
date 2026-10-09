# SpendWise Dashboard Shell — Week 4

The visual foundation of my SpendWise capstone project. This is a static dashboard layout built with CSS Grid, Flexbox, custom properties, and responsive design — no JavaScript yet.

## What's Inside
- **Sidebar** — Brand logo, name, and 5 navigation links arranged with Flexbox.
- **Header** — Welcome message with notification and profile buttons in a Flexbox row.
- **Six category cards** — Food, Transport, Rent, Entertainment, Savings, and Utilities, each showing a realistic static amount.

## Layout Techniques
- **CSS Grid** for the overall page structure (`.dashboard`) using `grid-template-areas` for a sidebar + header + main layout, and `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` for the card grid.
- **Flexbox** inside the sidebar, header, nav, and each card for one-dimensional alignment and spacing.
- **No absolute positioning** used anywhere for layout.

## Theming
All colors are defined as CSS custom properties on `:root`:
- `--brand-color` (teal), `--accent-color` (amber)
- `--surface-color`, `--bg-color`
- `--text-primary`, `--text-secondary`
- `--border-color`, plus spacing and shadow tokens

## Responsive Design
A `@media (max-width: 768px)` query collapses the layout to a single column:
- Sidebar moves below the header
- Nav items flow in a horizontal wrap
- Cards stack vertically

Verified with the browser's DevTools Device Toolbar.

## Card Micro-interactions
Cards lift and glow on both hover and keyboard focus:
- `transform: translateY(-4px)`
- `box-shadow` with brand-tinted depth
- Duration: `220ms` (under the 250ms limit)
- Also applied to nav items and icon buttons

## Stretch Goal: Dark Theme
A `@media (prefers-color-scheme: dark)` block overrides only the `:root` variables — no other CSS changes are needed, so the whole dashboard adapts automatically to the user's system preference.

## How to View
Open `index.html` in any modern browser. Try resizing the window or opening DevTools (F12) → Toggle Device Toolbar to see the responsive layout.