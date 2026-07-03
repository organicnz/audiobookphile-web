# Web App Styling Guidelines

Aficionado follows a strict "Liquid Glass" design aesthetic.

## Tailwind CSS v4
We utilize Tailwind CSS v4 for all styling.
- **Utility-First:** Avoid custom CSS unless absolutely necessary (e.g., for highly complex animations).
- **CSS Variables:** Colors and spacing tokens are defined in our base CSS using CSS variables to ensure seamless theming and Dark Mode support.

## Shadcn UI
Our component library is built on top of [shadcn/ui](https://ui.shadcn.com/) (using Radix UI/base-ui primitives).
- Components are located in `src/components/ui`.
- All components are fully customizable. Do not wrap them in unnecessary abstractions unless creating a domain-specific composite component.

## Liquid Glass Aesthetic
- **Colors:** Dominant charcoal and matte black backgrounds (`#09090b`, `#18181b`) with muted gold/amber accents.
- **Translucency:** Use `backdrop-blur` utilities combined with low-opacity white/black backgrounds (`bg-white/5` or `bg-black/40`) to create glassmorphism effects.
- **Borders:** Subtle, low-contrast borders (`border-white/10` or `border-zinc-800`).
- **Motion:** Ensure all interactive elements have subtle micro-animations (e.g., `transition-all duration-200 hover:scale-[1.02]`).
