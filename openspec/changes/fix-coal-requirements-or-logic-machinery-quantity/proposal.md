# Fix Coal Requirements, E-Waste Resource, and Machinery Quantity Display

## Why

Three issues need to be addressed in the production designer:

1. **Missing Coal Requirements**: Furnaces and other smelting recipes require coal as fuel (1 per minute), but coal is not currently displayed or calculated as a requirement in the production chain
2. **E-Waste Resource Consolidation**: The Plastic Scraps recipe shows Computer Tower AND Computer Monitor as separate resources, when they should be grouped as a single E-Waste resource that visually displays both icons
3. **Machinery Node Quantity Display**: Machinery icon nodes only show the icon without indicating how many machines are needed to meet production requirements, unlike resource nodes which show this information

These issues reduce the accuracy and usefulness of the production designer for planning efficient production chains.

## What Changes

- Add coal as a fuel requirement (1 quantityPerMin) to all smelting recipes (Copper Bar, Iron Bar)
- Create unified E-Waste resource that replaces Computer Tower and Computer Monitor as separate resources
- Display both Computer Tower and Computer Monitor icons in the E-Waste resource node
- Update Plastic Scraps recipe to use E-Waste as ingredient
- Add quantity/requirement badge display to MachineryIconNode component similar to ResourceIconNode
- Update ResourceIconNode and RecipeNode to show dual icons for E-Waste at all zoom levels

## Impact

- **Affected specs**: production-designer
- **Affected code**:
  - `lib/crafting-data.ts` - Recipe data for coal requirements and E-Waste resource
  - `components/machinery-icon-node.tsx` - Add quantity badge display
  - `components/resource-icon-node.tsx` - Dual-icon display for E-Waste
  - `components/recipe-node.tsx` - Dual-icon display for E-Waste in icon-only and card modes
