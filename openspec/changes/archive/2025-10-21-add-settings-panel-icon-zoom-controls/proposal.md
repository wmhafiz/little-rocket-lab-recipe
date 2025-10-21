# Add Settings Panel with Icon Node and Zoom Controls

## Why

Users need more control over the visual display of their production diagrams. Currently, ResourceIconNode and MachineryIconNode are always displayed as compact icons, but users may prefer to see full card displays in some scenarios. Additionally, when working with large production trees and zooming out to see the overall structure, text becomes unreadable while the full card layout takes up unnecessary space. Users need the ability to automatically switch to icon-only display at specific zoom levels to maintain readability and visual clarity.

## What Changes

- Add a Settings button in the top-right Panel beside the Theme Toggle button
- Create a Settings dialog with configuration options for:
  - Toggle to show/hide ResourceIconNode (switch between icon-only and full card display)
  - Toggle to show/hide MachineryIconNode (switch between icon-only and full card display)
  - Toggle to enable automatic icon-only mode when zoomed out
  - Slider to configure the zoom threshold for automatic icon-only mode (default: 0.75)
- When icon node types are disabled, Resource and Machinery nodes SHALL render as full RecipeNode cards
- When automatic icon-only mode is enabled and zoom level is below threshold:
  - ALL nodes (Component, Material, Resource, Machinery) SHALL display as icon-only
  - Node size remains 64x64px (same as current icon nodes)
  - Display only the recipe icon filling the square
  - Show small badge with quantity in corner (e.g., production rate or consumption rate)
  - Maintain all connection handles in the same positions
- Settings SHALL be persisted in localStorage with key `lrl-designer-settings`
- Settings dialog SHALL be accessible from both desktop panel and mobile menu

## Impact

- Affected specs: production-designer
- Affected code:
  - `components/production-designer-view.tsx` - Add settings button, settings state management, zoom level tracking, node type determination based on settings
  - `components/settings-dialog.tsx` - New component for settings UI
  - `components/recipe-node.tsx` - Add icon-only display mode based on zoom level
  - `components/resource-icon-node.tsx` - Conditionally render based on settings
  - `components/machinery-icon-node.tsx` - Conditionally render based on settings
  - `components/mobile-menu-sheet.tsx` - Add settings button to mobile menu
  - `lib/types.ts` - Add DesignerSettings interface
  - `lib/settings-storage.ts` - New utility for settings persistence
