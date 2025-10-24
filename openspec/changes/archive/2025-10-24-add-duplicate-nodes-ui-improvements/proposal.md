# Proposal: Allow Duplicate Node Types and UI Improvements

## Why

Currently, the production designer prevents adding multiple nodes of the same recipe type to the canvas. This limitation forces users to split output from a single node (e.g., one Copper Bar node with output split to both Copper Wire and Heat Sink production), rather than allowing dedicated production lines (e.g., one Copper Bar line feeding only Copper Wire, and a separate Copper Bar line feeding only Heat Sinks). This constraint reduces flexibility in designing production layouts that mirror real manufacturing setups where different production lines are kept separate for clarity and organization.

Additionally, the current UI lacks convenient features for managing nodes and edges, such as duplicating nodes, deleting edges directly, reconnecting edges to different handles, and visual feedback for connection status.

## What Changes

- Allow duplicate nodes for specific resource and material types: Coal, Copper Ore, Copper Bar, Iron Ore, Iron Bar
- Add "Use Dedicated Production Lines" setting to automatically create separate input chains for each consumer node (default true)
- Implement node duplication via NodeToolbar (duplicate button beside delete)
- Implement edge deletion via EdgeToolbar (delete button on selected edges)
- Implement edge reconnection (drag edge endpoints to reconnect to different handles)
- Add visual indicators for input connection status (red for disconnected, green for connected)
- Update Auto Build and Add Node On Edge Drop logic to respect dedicated production line settings

## Impact

### Affected specs

- `production-designer` - Multiple new requirements and modifications

### Affected code

- Node creation logic (allow duplicates for specific types)
- Settings panel (new dedicated production line toggles)
- Auto Build algorithm (respect dedicated line settings)
- Add Node On Edge Drop handler (respect dedicated line settings)
- Node components (add NodeToolbar with duplicate button)
- Edge components (add EdgeToolbar with delete button)
- ReactFlow configuration (enable edge reconnection via onReconnect handler)
- Handle components (add connection status color indicators)
- Type definitions (extend settings interface)

### Breaking changes

None - this is purely additive functionality with opt-in settings.
