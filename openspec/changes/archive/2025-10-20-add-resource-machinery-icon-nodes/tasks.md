# Implementation Tasks

## 1. Data Model Updates

- [x] 1.1 Add resource definitions to `lib/crafting-data.ts`
  - [x] 1.1.1 Add Coal resource with type="Resource", icon, outputPerMin, empty ingredients
  - [x] 1.1.2 Add Iron Ore resource
  - [x] 1.1.3 Add Copper Ore resource
  - [x] 1.1.4 Add Stone resource
  - [x] 1.1.5 Add Wood resource
  - [x] 1.1.6 Add Quartz resource
  - [x] 1.1.7 Add Computer Tower resource
  - [x] 1.1.8 Add Computer Monitor resource
- [x] 1.2 Update `lib/types.ts` to include "Resource" in recipe type union if needed

## 2. Create ResourceIconNode Component

- [x] 2.1 Create `components/resource-icon-node.tsx`
- [x] 2.2 Implement basic component structure extending NodeProps<RecipeNodeData>
- [x] 2.3 Add 64x64px rounded container with border and shadow
- [x] 2.4 Render resource icon using Next.js Image component
- [x] 2.5 Add error handling for missing images
- [x] 2.6 Add single Handle component (type="source", position="right", id="output")
- [x] 2.7 Add NodeToolbar with Delete button
- [x] 2.8 Implement hover state styling
- [x] 2.9 Add tooltip with resource name and output rate
- [x] 2.10 Add memo optimization
- [x] 2.11 Set displayName for debugging

## 3. Create MachineryIconNode Component

- [x] 3.1 Create `components/machinery-icon-node.tsx`
- [x] 3.2 Implement basic component structure extending NodeProps<RecipeNodeData>
- [x] 3.3 Add 64x64px rounded container with border and shadow
- [x] 3.4 Render machinery icon using Next.js Image component
- [x] 3.5 Add error handling for missing images
- [x] 3.6 Calculate number of ingredients from recipe data
- [x] 3.7 Generate Handle components for each ingredient (type="target", position="left")
- [x] 3.8 Distribute handles vertically using calculated spacing
- [x] 3.9 Add NodeToolbar with Delete button
- [x] 3.10 Implement hover state styling
- [x] 3.11 Add tooltip with machinery name and ingredients
- [x] 3.12 Add memo optimization
- [x] 3.13 Set displayName for debugging

## 4. Update Production Designer

- [x] 4.1 Import ResourceIconNode and MachineryIconNode in `components/production-designer-view.tsx`
- [x] 4.2 Update nodeTypes object to include:
  - [x] 4.2.1 `resourceIconNode: ResourceIconNode`
  - [x] 4.2.2 `machineryIconNode: MachineryIconNode`
- [x] 4.3 Create helper function `getNodeTypeForRecipe(recipe: CraftRecipe): string`
  - [x] 4.3.1 Return "resourceIconNode" for type="Resource"
  - [x] 4.3.2 Return "machineryIconNode" for type="Machinery"
  - [x] 4.3.3 Return "recipeNode" for all other types
- [x] 4.4 Update `addRecipeNode` function to use `getNodeTypeForRecipe`
- [x] 4.5 Update auto-build logic to use `getNodeTypeForRecipe` when creating nodes
- [x] 4.6 Update `categorizeRecipes` function to handle "Resource" category

## 5. Update Auto Layout Algorithm

- [x] 5.1 Modify `getLayoutedElements` function in `components/production-designer-view.tsx`
- [x] 5.2 Add logic to determine node dimensions based on node type
  - [x] 5.2.1 Use 64x64 for resourceIconNode and machineryIconNode
  - [x] 5.2.2 Use 280x200 for recipeNode
- [x] 5.3 Update spacing calculations to accommodate mixed node sizes
- [x] 5.4 Test auto-layout with mixed node types

## 6. Resource Icons

- [x] 6.1 Verify icon files exist in `/public/recipes/` for all resources:
  - [x] 6.1.1 Coal.png
  - [x] 6.1.2 Iron Ore.png
  - [x] 6.1.3 Copper Ore.png
  - [x] 6.1.4 Stone.png
  - [x] 6.1.5 Wood.png
  - [x] 6.1.6 Quartz.png
  - [x] 6.1.7 Computer Tower.png
  - [x] 6.1.8 Computer Monitor.png
- [x] 6.2 Create placeholder icons if any are missing

## 7. Testing

- [x] 7.1 Test adding resource nodes manually from sidebar
- [x] 7.2 Test adding machinery nodes manually from sidebar
- [x] 7.3 Test connecting resource nodes to component nodes
- [x] 7.4 Test connecting component nodes to machinery nodes
- [x] 7.5 Test auto-build with resource and machinery nodes
- [x] 7.6 Test node selection on icon nodes
- [x] 7.7 Test node deletion on icon nodes
- [x] 7.8 Test node dragging on icon nodes
- [x] 7.9 Test tooltips on hover for icon nodes
- [x] 7.10 Test auto-layout with mixed node types
- [x] 7.11 Test save and restore with icon nodes
- [x] 7.12 Verify theme compatibility (light and dark mode)

## 8. Polish and Documentation

- [x] 8.1 Review visual consistency across all node types
- [x] 8.2 Ensure responsive behavior on mobile/tablet
- [x] 8.3 Check accessibility (keyboard navigation, screen readers)
- [x] 8.4 Update any relevant code comments
- [x] 8.5 Add JSDoc comments to new components
