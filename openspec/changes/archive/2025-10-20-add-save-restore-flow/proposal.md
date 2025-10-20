# Add Save and Restore Flow Functionality

## Why

Users need the ability to save their production line designs and restore them later. Currently, when users create complex production chains in the Designer tab, all work is lost when they refresh the page or navigate away. This creates friction for users who want to iterate on designs or share their production setups.

## What Changes

- Add "Save" button in the top-right panel beside the "Clear Canvas" button
- Add "Restore" button in the top-right panel beside the "Save" button
- Implement save functionality using browser localStorage to persist the flow state (nodes, edges, and viewport)
- Implement restore functionality to load saved flow state from localStorage
- Use ReactFlow's `toObject()` method to serialize the complete flow state
- Use ReactFlow's `setViewport()` to restore the exact viewport position and zoom level
- Store flow data with a unique key (`lrl-designer-flow`) in localStorage

## Impact

### Affected Specs

- `production-designer` (new capability)

### Affected Code

- `components/production-designer-view.tsx` - Add save/restore buttons and implement localStorage logic
  - Add save handler using `rfInstance.toObject()`
  - Add restore handler using `setNodes()`, `setEdges()`, and `setViewport()`
  - Add two new Button components in the Panel at line 744-758
  - Import `Save` and `FolderOpen` icons from lucide-react

### User Experience Changes

- Users can now save their production line designs
- Saved designs persist across browser sessions
- Users can restore their last saved design with a single click
- No breaking changes to existing functionality
