# Implementation Tasks

## 1. Settings Storage and Types

- [x] 1.1 Create `lib/settings-storage.ts` with functions to save/load settings from localStorage
- [x] 1.2 Add `DesignerSettings` interface to `lib/types.ts` with fields: `showResourceIconNodes`, `showMachineryIconNodes`, `autoIconOnlyMode`, `iconOnlyZoomThreshold`
- [x] 1.3 Implement default settings values (all toggles true, threshold 0.75)
- [x] 1.4 Add migration logic for existing users (default to current behavior)

## 2. Settings Dialog Component

- [x] 2.1 Create `components/settings-dialog.tsx` with Dialog component from shadcn/ui
- [x] 2.2 Add toggle switches for ResourceIconNode and MachineryIconNode visibility
- [x] 2.3 Add toggle switch for automatic icon-only mode
- [x] 2.4 Add slider for zoom threshold configuration (range 0.25 to 1.0, step 0.05)
- [x] 2.5 Display current zoom level in the dialog for reference
- [x] 2.6 Add Save and Cancel buttons with proper state management
- [x] 2.7 Show visual preview or description of what each setting does

## 3. Settings Button Integration

- [x] 3.1 Add Settings button to desktop panel in `production-designer-view.tsx` (after Theme Toggle)
- [x] 3.2 Use Settings icon from lucide-react
- [x] 3.3 Add Settings button to mobile menu in `mobile-menu-sheet.tsx`
- [x] 3.4 Wire up button click to open settings dialog
- [x] 3.5 Ensure consistent styling with other panel buttons

## 4. Node Type Determination Logic

- [x] 4.1 Update node creation logic in `production-designer-view.tsx` to check settings
- [x] 4.2 When `showResourceIconNodes` is false, use `recipeNode` type for Resource recipes
- [x] 4.3 When `showMachineryIconNodes` is false, use `recipeNode` type for Machinery recipes
- [x] 4.4 Update auto-build logic to respect settings when creating nodes
- [x] 4.5 Add state management for settings in ProductionDesignerFlow component

## 5. Zoom Level Tracking

- [x] 5.1 Add zoom level state to `production-designer-view.tsx` using ReactFlow's `useViewport` hook
- [x] 5.2 Track current zoom level in component state
- [x] 5.3 Create helper function to determine if icon-only mode should be active based on zoom and settings
- [x] 5.4 Pass zoom state and icon-only mode flag to all node components via node data

## 6. Icon-Only Display Mode for RecipeNode

- [x] 6.1 Update `recipe-node.tsx` to accept `iconOnlyMode` prop in RecipeNodeData
- [x] 6.2 When `iconOnlyMode` is true, render compact 64x64px display
- [x] 6.3 Show only recipe icon (no card, no text details)
- [x] 6.4 Display small badge in corner with key metric (outputPerMin or total consumption)
- [x] 6.5 Maintain all connection handles in correct positions
- [x] 6.6 Ensure handles are still visible and functional at small size
- [x] 6.7 Keep tooltip with full details on hover

## 7. Icon-Only Display Mode for Icon Nodes

- [x] 7.1 Update `resource-icon-node.tsx` to accept `iconOnlyMode` prop
- [x] 7.2 When in zoom-triggered icon-only mode, simplify badge display (keep only number)
- [x] 7.3 Update `machinery-icon-node.tsx` to accept `iconOnlyMode` prop
- [x] 7.4 Ensure consistent sizing across all node types in icon-only mode

## 8. Settings Persistence

- [x] 8.1 Save settings to localStorage whenever changed
- [x] 8.2 Load settings on component mount
- [x] 8.3 Apply loaded settings to initial node rendering
- [x] 8.4 Handle settings changes and re-render affected nodes

## 9. Node Re-rendering on Settings Change

- [x] 9.1 When settings change, update all existing nodes' type property
- [x] 9.2 Preserve node positions, connections, and data
- [x] 9.3 Only change the node type (recipeNode vs resourceIconNode vs machineryIconNode)
- [x] 9.4 Ensure smooth transition without breaking connections

## 10. Testing and Polish

- [ ] 10.1 Test toggling ResourceIconNode on/off with existing nodes
- [ ] 10.2 Test toggling MachineryIconNode on/off with existing nodes
- [ ] 10.3 Test automatic icon-only mode at various zoom levels
- [ ] 10.4 Test zoom threshold slider and verify it affects display correctly
- [ ] 10.5 Test settings persistence across page reloads
- [ ] 10.6 Test mobile menu settings button
- [ ] 10.7 Verify all connection handles work correctly in all display modes
- [ ] 10.8 Test with saved/restored flows to ensure settings don't break existing data
- [ ] 10.9 Verify optimal production indicators display correctly in all modes
- [ ] 10.10 Check theme compatibility (dark/light mode)
