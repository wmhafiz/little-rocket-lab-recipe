# Add Optimal Production Indicators

## Why

Players need to understand how many input resource nodes are required to sustain optimal production rates for output machinery nodes. Currently, the production designer shows `quantityPerMin` and `outputPerMin` data but doesn't calculate or display the optimal quantity requirements for input nodes to satisfy downstream production chains. This makes it difficult to plan efficient production lines without manual calculations.

## What Changes

- Add visual indicators on input nodes showing the **number of nodes needed** to reach optimum output for connected downstream nodes
- Calculate optimal production rates based on the connection graph topology (all paths from input resources to output machinery)
- Display the calculated **node count** as a badge on resource and component nodes (e.g., "4" means 4 nodes needed)
- Update node styling to show when a node's production rate meets, exceeds, or falls short of optimal requirements
- Add tooltip information explaining the optimal production calculation with detailed breakdown
- Support aggregation when multiple downstream paths require the same input resource
- Show practical node counts instead of abstract deficit amounts for better planning

## Impact

- **Affected specs**: `production-designer`
- **Affected code**:
  - `components/production-designer-view.tsx` - Add calculation logic and state management
  - `components/resource-icon-node.tsx` - Display optimal production indicators
  - `components/recipe-node.tsx` - Display optimal production indicators
  - `components/machinery-icon-node.tsx` - Trigger calculations based on requirements
  - `lib/types.ts` - Add types for optimal production metadata
