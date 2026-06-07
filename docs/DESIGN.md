---
name: Arcane Quest
colors:
  surface: '#f4faff'
  surface-dim: '#d5dbe0'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4f9'
  surface-container: '#e9eff4'
  surface-container-high: '#e3e9ee'
  surface-container-highest: '#dde3e8'
  on-surface: '#161c20'
  on-surface-variant: '#40474f'
  inverse-surface: '#2b3135'
  inverse-on-surface: '#ebf1f6'
  outline: '#717880'
  outline-variant: '#c0c7d1'
  surface-tint: '#016398'
  primary: '#004a74'
  on-primary: '#ffffff'
  primary-container: '#006398'
  on-primary-container: '#b9dcff'
  inverse-primary: '#94ccff'
  secondary: '#006d37'
  on-secondary: '#ffffff'
  secondary-container: '#98f3af'
  on-secondary-container: '#0b723b'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c6a94e'
  on-tertiary-container: '#4e3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#94ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004b74'
  secondary-fixed: '#9bf6b2'
  secondary-fixed-dim: '#80d997'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffe085'
  tertiary-fixed-dim: '#e3c466'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f4faff'
  on-background: '#161c20'
  surface-variant: '#dde3e8'
  xp-glow: '#00aaff'
  mana-purple: '#a855f7'
  health-red: '#ba1a1a'
  gold-resource: '#ffe084'
  dungeon-flame: '#f97316'
typography:
  headline-xl:
    fontFamily: MedievalSharp
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: MedievalSharp
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  headline-md:
    fontFamily: MedievalSharp
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 20px
  container-max: 1200px
---

## Brand & Style
Arcane Quest is a high-fantasy, gamified dashboard that blends **modern Glassmorphism** with **Tactile/Skeuomorphic** gaming elements. The brand personality is adventurous, heroic, and vibrant, designed to evoke a sense of progression and wonder. 

The visual style utilizes deep atmospheric gradients, glowing interactive states (XP bars, card hovers), and a "physical" feel achieved through heavy bottom borders on buttons that simulate depth. It feels like a high-end RPG interface optimized for a clean, accessible web experience.

## Colors
The palette is rooted in a "Paladin Blue" (`primary`) and "Forest Green" (`secondary`), used to distinguish different game modes (Story vs. Side Quests). 

- **Primary & Containers:** The blue system handles core navigation and "Story" elements.
- **Secondary:** Green is reserved for growth, side quests, and positive progression.
- **Surface Strategy:** Uses a very light blue-tinted neutral (`#f4faff`) for the background to maintain the "Sky Realm" atmosphere. 
- **Functional Accents:** Vibrant "XP Glow" (`#00aaff`) is used for progress bars and interactive feedback.

## Typography
The system uses a high-contrast pairing of **MedievalSharp** for display/thematic elements and **Inter** for functional/UI data.

- **MedievalSharp:** Used for the logo, main quest titles, and "Story Mode" headers to reinforce the fantasy theme. It should always be used in uppercase or for primary branding.
- **Inter:** Provides clarity for menus, resource counts, and body text.
- **Styling:** Larger headlines often employ a "Text Shadow" or "Gradient Text" effect (`from-blue-200 to-cyan-400`) to stand out against rich image backgrounds.

## Layout & Spacing
The layout follows a **Fixed Grid** approach for the main content area (max-width 1200px) with a sidebar docked to the left on desktop.

- **Grid:** A 3-column bento grid is the primary layout for navigation/activity cards.
- **Breakpoints:** On mobile, the sidebar disappears in favor of a 5-item bottom navigation bar. Cards reflow to a single column.
- **Rhythm:** An 8px base unit is used. 24px gutters provide enough air between the high-density image cards.

## Elevation & Depth
Depth is expressed through **Tonal Layers** and **Tactile Offsets**:
- **Surfaces:** The background is the lowest layer. Sidebars and Nav headers use a slightly darker or "lowest" container white with a 4px solid bottom shadow (`shadow-[0px_4px_0px_rgba(0,0,0,0.05)]`).
- **Cards:** Use a standard `shadow-md` but transition to a `shadow-xl` on hover with a slight scale effect.
- **XP Bars:** Use an "Inner Glow" and a scanning "Sparkle" animation to simulate a physical light-up effect.
- **Interactive Elements:** Use a 2px-4px vertical translation on hover/active to simulate a physical button being pressed.

## Shapes
The shape language is "Generous & Organic." 
- **Large Cards:** Use `3xl` (24px or 1.5rem) rounded corners to feel approachable and soft.
- **Buttons & Chips:** Use `xl` (12px) for a modern, friendly feel.
- **Resource Bars:** Use `full` (pill) rounding to distinguish them as progress-tracking elements.
- **Avatars:** Use `xl` (12px) rather than circles to maintain the "Inventory Slot" aesthetic typical of RPGs.

## Components
### Buttons (Game Style)
Buttons are not flat. They feature a solid 2px or 4px bottom border in a darker shade of the button's background color. On click, the button translates down by 2px, "hiding" part of the border to simulate a physical press.

### Bento Cards
Cards are containers for immersive imagery. They must feature a `gradient-to-t` overlay (from the card's theme color to transparent) at the bottom to ensure text legibility. On hover, the background image should scale slightly (110%).

### Resource Bar
A floating pill-shaped container in the header. It houses icons (using Material Symbols) and bold labels. Dividers are subtle `outline-variant` lines.

### Progress Bars (XP)
Progress bars use a high-contrast fill (`primary-container`) and a specific `.xp-bar-glow` class that includes a CSS sparkle animation and a 10px outer glow.

### Side Navigation
Icons in the sidebar should use a "Filled" state when active and an "Outline" state when inactive. Active items receive a heavy bottom border and the same "pressed" translation as buttons.