# Project Context

## Purpose

Little Rocket Lab Designer is a crafting recipe visualizer and production line designer for the game "Little Rocket Lab". It helps players visualize complex crafting recipes, understand material requirements, and design efficient production chains through an interactive node-based flow diagram.

**Key Goals:**

- Visualize crafting recipes with their inputs/outputs
- Design production lines by connecting recipe nodes
- Calculate material requirements and production rates
- Provide an intuitive drag-and-drop interface for production planning

## Tech Stack

### Core Framework

- **Next.js 15.2.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript

### UI & Styling

- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **shadcn/ui** (New York style) - Component library built on Radix UI
- **Radix UI** - Headless UI primitives for accessibility
- **Lucide React** - Icon library
- **Geist Font** - Sans and Mono fonts

### Visualization & Interaction

- **@xyflow/react** (ReactFlow) - Node-based flow diagram library
- **elkjs** - Graph layout algorithm for auto-arranging nodes

### Forms & Validation

- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Integration between RHF and Zod

### Additional Libraries

- **next-themes** - Theme management (dark/light mode)
- **class-variance-authority** - Component variant styling
- **clsx** & **tailwind-merge** - Conditional className utilities
- **date-fns** - Date manipulation
- **sonner** - Toast notifications

### Development Tools

- **pnpm** - Package manager (based on lock file)
- **ESLint** - Linting
- **PostCSS** - CSS processing

### Deployment & Analytics

- **Vercel** - Hosting platform
- **@vercel/analytics** - Web analytics

## Project Conventions

### Code Style

**File Naming:**

- Components: kebab-case (e.g., `production-designer-view.tsx`)
- TypeScript files: kebab-case (e.g., `crafting-data.ts`)
- Types/interfaces: PascalCase within files

**Component Conventions:**

- Use `"use client"` directive for client components
- Prefer functional components with hooks
- Export interfaces for component props (e.g., `ProductionDesignerViewProps`)

**TypeScript:**

- Strict mode enabled
- Use explicit type annotations for function parameters and returns
- Define types in `lib/types.ts` for shared domain models
- Use `type` for unions/intersections, `interface` for object shapes

**Import Organization:**

- External packages first
- Internal components and utilities second
- Styles last
- Use path alias `@/` for absolute imports

**Naming Conventions:**

- Components: PascalCase (e.g., `ProductionDesignerView`)
- Functions/variables: camelCase (e.g., `fetchCraftingData`)
- Constants: UPPER_SNAKE_CASE for static data (e.g., `CRAFTING_RECIPES`)
- Types/interfaces: PascalCase (e.g., `CraftRecipe`, `RecipeNodeData`)

### Architecture Patterns

**App Structure:**

```
app/               # Next.js App Router pages
├── layout.tsx     # Root layout with theme provider
├── page.tsx       # Home page (server component)
└── globals.css    # Global styles

components/        # React components
├── ui/            # shadcn/ui components (primitives)
└── *.tsx          # Feature components

lib/               # Shared utilities and data
├── types.ts       # TypeScript type definitions
├── utils.ts       # Helper functions
├── crafting-data.ts  # Recipe data source
└── theme-provider.tsx  # Theme context

public/            # Static assets (recipe icons)
```

**Design Patterns:**

- **Server/Client Split**: Server components fetch data, client components handle interactivity
- **Component Composition**: UI primitives from shadcn/ui composed into feature components
- **Custom Hooks**: React Flow hooks for node/edge state management
- **Provider Pattern**: Theme provider wraps app for dark/light mode
- **Type Safety**: All data structures have explicit TypeScript interfaces

**State Management:**

- React Flow's built-in hooks (`useNodesState`, `useEdgesState`, `useReactFlow`)
- Local component state with `useState`
- Theme state via Context API (next-themes)

**Styling Approach:**

- Tailwind utility classes for most styling
- CSS variables for theming (defined in globals.css)
- `cn()` utility for conditional classes
- Component variants via `class-variance-authority`

### Testing Strategy

Currently no formal testing framework configured. Future considerations:

- Unit tests with Jest/Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

### Git Workflow

- Repository synced with v0.app deployments
- Vercel auto-deploys from main branch
- OpenSpec workflow for structured changes (see `openspec/AGENTS.md`)

## Domain Context

**Game Context:**
This tool is for "Little Rocket Lab," a crafting/factory-building game where players:

- Gather raw materials
- Process them through crafting recipes
- Build production chains to create complex items
- Optimize production rates and efficiency

**Recipe Structure:**
Each recipe has:

- **Type**: Category (Machinery, Material, Component, etc.)
- **Name**: Item being crafted
- **Output Rate**: Items produced per minute
- **Icon**: Visual representation
- **Ingredients**: List of input items with quantities and rates

**Production Designer Features:**

- Node-based graph where each node represents a recipe
- Edges connect outputs to inputs (material flow)
- Search and filter recipes
- Auto-layout for organizing production chains
- Calculate total material requirements
- Visual theme matching game aesthetics

**Key Materials/Categories:**
Common recipe types include Machinery, Materials (plates, wires), Components (circuits, frames), and advanced items.

## Important Constraints

**Technical Constraints:**

- Next.js App Router (not Pages Router)
- React Server Components as default, client components explicit
- No backend API - recipes loaded from static data file
- Recipe data stored as TypeScript constant (not database)
- Images must be in `/public/recipes/` directory

**Performance Considerations:**

- ReactFlow can handle hundreds of nodes but performance degrades with complexity
- No server-side graph layout (elkjs runs client-side)
- All recipe data loaded on initial page load

**Browser Compatibility:**

- Modern browsers with ES6+ support
- Requires JavaScript enabled
- Responsive design for desktop (primary) and tablet

**Deployment:**

- Vercel platform (serverless)
- Auto-deployments from v0.app
- No database or persistent storage
- Static asset optimization via Next.js

## External Dependencies

**Development Services:**

- **v0.app**: AI-assisted development and deployment sync
- **Vercel**: Hosting, CI/CD, and analytics
- **GitHub**: Version control (synced from v0.app)

**CDN/Assets:**

- Recipe icons served from `/public/recipes/` directory
- Next.js Image optimization for icon rendering

**Third-Party Libraries:**

- **ReactFlow**: Core graph visualization (see @xyflow/react docs)
- **Radix UI**: Accessible component primitives (see docs per component)
- **elkjs**: Auto-layout algorithm for node positioning

**No External APIs:**

- All data is static and bundled with application
- No authentication or user accounts
- No backend services or databases

**Font Dependencies:**

- Geist Sans and Geist Mono (imported from geist package)

**Analytics:**

- Vercel Analytics tracks page views and web vitals
