# Add Resource and Machinery Icon-Only Nodes

## Why

The production designer currently displays all nodes with full cards showing inputs, outputs, and details. However, resource nodes (Coal, Iron Ore, Copper Ore, Stone, Wood, Quartz, etc.) are source materials that only produce output, and Machinery nodes are end products that only consume input. These special node types should be displayed as compact icon-only nodes to reduce visual clutter and make the production flow diagram cleaner and easier to understand.

## What Changes

- Add a new "Resource" node type category for raw materials (Coal, Iron Ore, Copper Ore, Stone, Wood, Quartz, Computer Tower, Computer Monitor)
- Create a new `ResourceIconNode` component that displays only the resource icon with output handle
- Create a new `MachineryIconNode` component that displays only the machinery icon with input handles
- Update the crafting data to categorize resource nodes
- Update the production designer to use icon-only rendering for Resource and Machinery node types
- Resource nodes SHALL only display an output handle (right side)
- Machinery nodes SHALL only display input handles (left side)
- Both node types SHALL display as compact circular/square icons (64x64px) instead of full cards
- Node tooltips SHALL show the node name on hover

## Impact

- Affected specs: production-designer
- Affected code:
  - `lib/crafting-data.ts` - Add resource node definitions
  - `components/recipe-node.tsx` - Update to handle icon-only rendering mode or create new node components
  - `components/resource-icon-node.tsx` - New component for resource nodes
  - `components/machinery-icon-node.tsx` - New component for machinery nodes
  - `components/production-designer-view.tsx` - Register new node types and update node creation logic
  - `lib/types.ts` - Update types to include new node categories
