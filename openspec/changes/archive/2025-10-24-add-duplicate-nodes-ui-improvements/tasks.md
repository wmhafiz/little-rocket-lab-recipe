# Implementation Tasks

## 1. Allow Duplicate Node Types

- [x] 1.1 Modify node creation validation to allow duplicates for Coal, Copper Ore, Copper Bar, Iron Ore, Iron Bar
- [x] 1.2 Update type checking logic to identify which node types can be duplicated
- [x] 1.3 Test manual node addition with duplicate types
- [x] 1.4 Test auto-build with duplicate types

## 2. Dedicated Production Line Settings

- [x] 2.1 Add `useDedicatedProductionLines` boolean to settings interface
- [x] 2.2 Add individual toggles for each consumer type (Gear, Bearing, Iron Plate, Heatsink, Copper Wire)
- [x] 2.3 Update settings dialog UI with new "Dedicated Production Lines" section
- [x] 2.4 Persist dedicated production line settings to localStorage
- [x] 2.5 Load and apply settings on mount

## 3. Auto Build Integration

- [x] 3.1 Modify auto-build algorithm to check dedicated production line settings
- [x] 3.2 When enabled, create separate input chains for each consumer node
- [x] 3.3 Ensure proper connection routing for dedicated lines
- [x] 3.4 Test auto-build with dedicated lines enabled and disabled

## 4. Add Node On Edge Drop Integration

- [x] 4.1 Update edge drop handler to respect dedicated production line settings
- [x] 4.2 When adding intermediate nodes, maintain or create dedicated lines as appropriate
- [x] 4.3 Test edge drop with various configurations

## 5. Node Toolbar with Duplicate Button

- [x] 5.1 Import and configure NodeToolbar component from @xyflow/react
- [x] 5.2 Add duplicate button beside delete button in toolbar
- [x] 5.3 Implement node duplication logic (copy node data, position offset)
- [x] 5.4 Style toolbar buttons consistently
- [x] 5.5 Test duplication for all node types

## 6. Edge Toolbar with Delete Button

- [x] 6.1 Import and configure EdgeToolbar component from @xyflow/react
- [x] 6.2 Add delete button to edge toolbar
- [x] 6.3 Implement edge deletion handler
- [x] 6.4 Style toolbar button consistently
- [x] 6.5 Test edge deletion via toolbar

## 7. Edge Reconnection

- [x] 7.1 Add onReconnect handler to ReactFlow component
- [x] 7.2 Import and use reconnectEdge utility from @xyflow/react
- [x] 7.3 Set reconnectable prop on edges (default true or per-edge configuration)
- [x] 7.4 Test edge reconnection by dragging endpoints

## 8. Input Connection Status Indicators

- [x] 8.1 Create utility function to determine connection status for each input handle
- [x] 8.2 Modify Handle components to accept connection status prop
- [x] 8.3 Apply red color for disconnected input handles
- [x] 8.4 Apply green color for connected input handles
- [x] 8.5 Ensure output handles maintain default color
- [x] 8.6 Test visual indicators with various connection states
- [x] 8.7 Ensure theme compatibility (dark/light mode)

## 9. Testing and Validation

- [x] 9.1 Test all features together in various combinations
- [x] 9.2 Verify settings persistence across sessions
- [x] 9.3 Test with existing saved flows
- [x] 9.4 Validate performance with large graphs
- [x] 9.5 Test responsive behavior on mobile

## 10. Documentation

- [x] 10.1 Update any relevant comments in code
- [x] 10.2 Ensure settings tooltips explain dedicated production lines clearly
