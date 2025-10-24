# Production Designer Spec Deltas

## ADDED Requirements

### Requirement: Duplicate Node Types

The production designer SHALL allow multiple nodes of the same recipe type for specific resource and material types to enable dedicated production lines.

#### Scenario: Allow duplicate resource nodes

- **WHEN** user attempts to add a node for Coal, Copper Ore, or Iron Ore
- **AND** a node of that type already exists on the canvas
- **THEN** the system SHALL allow the duplicate node to be added
- **AND** the duplicate node SHALL function identically to the original

#### Scenario: Allow duplicate material nodes

- **WHEN** user attempts to add a node for Copper Bar or Iron Bar
- **AND** a node of that type already exists on the canvas
- **THEN** the system SHALL allow the duplicate node to be added
- **AND** the duplicate node SHALL function identically to the original

#### Scenario: Prevent duplicates for other types

- **WHEN** user attempts to add a node for any recipe type not in the allowed duplicate list
- **AND** a node of that type already exists on the canvas
- **THEN** the system SHALL prevent the duplicate node from being added
- **AND** maintain existing behavior for non-duplicatable types

#### Scenario: Duplicate validation list

- **WHEN** the system checks if a node type can be duplicated
- **THEN** the allowed duplicate types SHALL be: Coal, Copper Ore, Copper Bar, Iron Ore, Iron Bar, Iron Plate, Gear, Bearing, Heatsink, Copper Wire
- **AND** this list SHALL be configurable for future expansion

### Requirement: Dedicated Production Line Settings

The production designer SHALL provide settings to enable dedicated production lines where each consumer node receives its own complete input chain.

#### Scenario: Enable dedicated production lines

- **WHEN** user enables "Use Dedicated Production Lines" in settings
- **THEN** the setting SHALL be stored in localStorage
- **AND** auto-build and edge drop features SHALL create separate input chains for each consumer

#### Scenario: Configure consumer types for dedicated lines

- **WHEN** user views dedicated production line settings
- **THEN** individual toggles SHALL be available for: Gear, Bearing, Iron Plate, Heatsink, Copper Wire
- **AND** each toggle SHALL control whether that consumer type gets dedicated input lines
- **AND** toggle states SHALL be persisted to localStorage

#### Scenario: Default dedicated line settings

- **WHEN** user first accesses dedicated production line settings
- **THEN** all consumer type toggles SHALL default to disabled (false)
- **AND** the master "Use Dedicated Production Lines" toggle SHALL default to disabled (false)

#### Scenario: Settings UI organization

- **WHEN** user opens the settings dialog
- **THEN** a new section "Dedicated Production Lines" SHALL appear
- **AND** the section SHALL contain the master toggle and consumer type toggles
- **AND** consumer type toggles SHALL only be enabled when master toggle is on
- **AND** the section SHALL include explanatory text about dedicated production lines

### Requirement: Auto Build with Dedicated Production Lines

The production designer's auto-build feature SHALL respect dedicated production line settings when creating production chains.

#### Scenario: Auto-build with dedicated lines enabled

- **WHEN** user runs auto-build for a machinery node
- **AND** dedicated production lines are enabled for that machinery type
- **THEN** the system SHALL create a complete separate input chain for that node
- **AND** the input chain SHALL include dedicated Coal, Copper Ore/Bar, or Iron Ore/Bar nodes
- **AND** these dedicated nodes SHALL not be shared with other consumers

#### Scenario: Auto-build with dedicated lines disabled

- **WHEN** user runs auto-build for a machinery node
- **AND** dedicated production lines are disabled for that machinery type
- **THEN** the system SHALL use existing behavior (shared input nodes)
- **AND** output from resource/material nodes MAY be split to multiple consumers

#### Scenario: Mixed dedicated and shared lines

- **WHEN** some consumer types have dedicated lines enabled and others disabled
- **THEN** auto-build SHALL create dedicated chains only for enabled types
- **AND** disabled types SHALL share input nodes as before
- **AND** the system SHALL handle both patterns in the same graph

### Requirement: Add Node On Edge Drop with Dedicated Lines

The production designer SHALL respect dedicated production line settings when adding nodes via edge drop.

#### Scenario: Edge drop with dedicated lines enabled

- **WHEN** user drops a new node onto an edge
- **AND** the consumer node has dedicated production lines enabled
- **THEN** the system SHALL maintain the dedicated line structure
- **AND** new intermediate nodes SHALL be part of the dedicated chain
- **AND** connections SHALL not be shared with other consumers

#### Scenario: Edge drop with dedicated lines disabled

- **WHEN** user drops a new node onto an edge
- **AND** dedicated production lines are disabled
- **THEN** the system SHALL use existing behavior
- **AND** connections MAY be shared between multiple consumers

### Requirement: Node Duplication via Toolbar

The production designer SHALL provide a duplicate button in the NodeToolbar to quickly copy nodes.

#### Scenario: Display duplicate button

- **WHEN** user selects a node
- **THEN** a NodeToolbar SHALL appear above the node
- **AND** the toolbar SHALL contain a duplicate button beside the delete button
- **AND** the duplicate button SHALL display a Copy icon from lucide-react

#### Scenario: Duplicate node action

- **WHEN** user clicks the duplicate button
- **THEN** a new node SHALL be created with identical data to the original
- **AND** the new node SHALL be positioned offset from the original (e.g., +50px x, +50px y)
- **AND** the new node SHALL not copy connections (edges)
- **AND** the new node SHALL be automatically selected

#### Scenario: Duplicate button availability

- **WHEN** a node is selected
- **THEN** the duplicate button SHALL be available for all node types
- **AND** the button SHALL respect duplicate validation rules (only certain types can be duplicated)
- **AND** if duplication is not allowed, the button SHALL be disabled with tooltip explanation

#### Scenario: Toolbar positioning

- **WHEN** NodeToolbar is displayed
- **THEN** the toolbar SHALL be positioned above the node by default
- **AND** the toolbar SHALL adjust position to remain visible in viewport
- **AND** the toolbar SHALL have consistent styling with other UI elements

### Requirement: Edge Deletion via Toolbar

The production designer SHALL provide a delete button in the EdgeToolbar for convenient edge removal.

#### Scenario: Display edge toolbar on selection

- **WHEN** user selects an edge (clicks on it)
- **THEN** an EdgeToolbar SHALL appear on the edge
- **AND** the toolbar SHALL contain a delete button
- **AND** the delete button SHALL display a Trash icon from lucide-react

#### Scenario: Delete edge action

- **WHEN** user clicks the delete button in the EdgeToolbar
- **THEN** the selected edge SHALL be removed from the canvas
- **AND** connected nodes SHALL remain on the canvas
- **AND** optimal production calculations SHALL update if applicable

#### Scenario: Edge toolbar positioning

- **WHEN** EdgeToolbar is displayed
- **THEN** the toolbar SHALL be positioned at the center of the edge
- **AND** the toolbar SHALL move with the edge if nodes are dragged
- **AND** the toolbar SHALL have consistent styling with NodeToolbar

#### Scenario: Edge toolbar visibility

- **WHEN** an edge is not selected
- **THEN** the EdgeToolbar SHALL not be visible
- **WHEN** user clicks elsewhere or selects another element
- **THEN** the EdgeToolbar SHALL disappear

### Requirement: Edge Reconnection

The production designer SHALL allow users to reconnect edges by dragging edge endpoints to different handles.

#### Scenario: Enable edge reconnection

- **WHEN** ReactFlow is initialized
- **THEN** the onReconnect handler SHALL be configured
- **AND** edges SHALL have reconnectable property set to true by default
- **AND** the reconnectEdge utility from @xyflow/react SHALL be used

#### Scenario: Reconnect edge source

- **WHEN** user drags the source end of an edge to a different output handle
- **THEN** the edge SHALL disconnect from the original source
- **AND** the edge SHALL connect to the new source handle
- **AND** the onReconnect handler SHALL update the edges state
- **AND** optimal production calculations SHALL update if applicable

#### Scenario: Reconnect edge target

- **WHEN** user drags the target end of an edge to a different input handle
- **THEN** the edge SHALL disconnect from the original target
- **AND** the edge SHALL connect to the new target handle
- **AND** the onReconnect handler SHALL update the edges state
- **AND** optimal production calculations SHALL update if applicable

#### Scenario: Reconnection validation

- **WHEN** user attempts to reconnect an edge
- **THEN** the system SHALL validate the new connection
- **AND** invalid connections SHALL be rejected (e.g., incompatible types)
- **AND** valid connections SHALL be established
- **AND** visual feedback SHALL indicate valid/invalid drop targets

#### Scenario: Reconnection visual feedback

- **WHEN** user is dragging an edge endpoint
- **THEN** valid target handles SHALL be highlighted
- **AND** invalid target handles SHALL be dimmed or show error indicator
- **AND** the dragged connection line SHALL follow the cursor
- **AND** the connection line SHALL snap to handles when near

### Requirement: Input Connection Status Indicators

The production designer SHALL display visual indicators on input handles showing whether they are connected or disconnected.

#### Scenario: Disconnected input handle indicator

- **WHEN** a node has an input handle with no incoming edge
- **THEN** that input handle SHALL be displayed in RED color
- **AND** the red color indicates that input requires a connection
- **AND** the indicator SHALL be visible at all zoom levels

#### Scenario: Connected input handle indicator

- **WHEN** a node has an input handle with at least one incoming edge
- **THEN** that input handle SHALL be displayed in GREEN color
- **AND** the green color indicates that input has a valid connection
- **AND** the indicator SHALL be visible at all zoom levels

#### Scenario: Output handle color

- **WHEN** rendering output handles
- **THEN** output handles SHALL maintain their default color
- **AND** no connection status indicator is needed for outputs
- **AND** output handles SHALL remain visually distinct from input handles

#### Scenario: Connection status updates

- **WHEN** an edge is added or removed
- **THEN** affected input handle colors SHALL update immediately
- **AND** the update SHALL reflect the new connection status
- **AND** the transition SHALL be smooth (CSS transition if applicable)

#### Scenario: Theme compatibility for status indicators

- **WHEN** user switches between dark and light themes
- **THEN** red and green status colors SHALL adapt for sufficient contrast
- **AND** disconnected handles SHALL use red shades: #ef4444 (light) or #dc2626 (dark)
- **AND** connected handles SHALL use green shades: #22c55e (light) or #16a34a (dark)
- **AND** colors SHALL meet WCAG contrast requirements

#### Scenario: Status indicator styling

- **WHEN** rendering connection status indicators
- **THEN** the handle background color SHALL change based on status
- **AND** the handle border MAY also change to reinforce the status
- **AND** the handle size SHALL remain consistent (12px)
- **AND** the indicator SHALL not interfere with connection interactions

#### Scenario: Multiple connections to same handle

- **WHEN** an input handle has multiple incoming edges
- **THEN** the handle SHALL be displayed in GREEN color
- **AND** the status SHALL be "connected" regardless of connection count
- **AND** the handle SHALL function normally for all connections

## MODIFIED Requirements

### Requirement: Settings Panel

The production designer SHALL provide a settings panel for configuring node display preferences, zoom-based behavior, and dedicated production line options.

#### Scenario: Settings button placement on desktop

- **WHEN** user views the Designer tab on desktop
- **THEN** a "Settings" button SHALL be visible in the top-right Panel
- **AND** the button SHALL be positioned immediately after the Theme Toggle button
- **AND** the button SHALL display a Settings icon from lucide-react
- **AND** the button SHALL use variant="outline" and size="icon" styling
- **AND** clicking it SHALL open the settings dialog

#### Scenario: Settings button placement on mobile

- **WHEN** user views the Designer tab on mobile (viewport width < 1024px)
- **THEN** a "Settings" button SHALL be available in the mobile hamburger menu
- **AND** the button SHALL be positioned after the Theme section
- **AND** clicking it SHALL open the settings dialog

#### Scenario: Settings button visual consistency

- **WHEN** user views the Settings button
- **THEN** the button SHALL have consistent styling with the Theme Toggle button
- **AND** the button SHALL be easily discoverable
- **AND** the button SHALL include appropriate hover and focus states

### Requirement: Settings Dialog UI

The production designer SHALL provide a settings dialog with intuitive controls for all configuration options including dedicated production lines.

#### Scenario: Settings dialog structure

- **WHEN** user opens the settings dialog
- **THEN** the dialog SHALL display a title "Settings"
- **AND** the dialog SHALL be organized into clear sections: "Node Display", "Zoom Behavior", and "Dedicated Production Lines"
- **AND** the dialog SHALL include Save and Cancel buttons
- **AND** the dialog SHALL use shadcn/ui Dialog component

#### Scenario: Node display settings section

- **WHEN** user views the Node Display section
- **THEN** a toggle switch SHALL be displayed for "Show Resource nodes as icons"
- **AND** a toggle switch SHALL be displayed for "Show Machinery nodes as icons"
- **AND** each toggle SHALL have a descriptive label explaining what it controls
- **AND** toggles SHALL show current state (on/off)

#### Scenario: Zoom behavior settings section

- **WHEN** user views the Zoom Behavior section
- **THEN** a toggle switch SHALL be displayed for "Auto icon-only mode when zoomed out"
- **AND** a slider SHALL be displayed for "Zoom threshold"
- **AND** the slider SHALL have range 0.25 to 1.0 with step 0.05
- **AND** the current slider value SHALL be displayed numerically
- **AND** the current zoom level SHALL be displayed for reference
- **AND** the zoom threshold slider SHALL only be enabled when auto icon-only mode is toggled on

#### Scenario: Dedicated production lines settings section

- **WHEN** user views the Dedicated Production Lines section
- **THEN** a master toggle switch SHALL be displayed for "Use Dedicated Production Lines"
- **AND** explanatory text SHALL describe what dedicated production lines means
- **AND** individual toggles SHALL be displayed for each consumer type: Gear, Bearing, Iron Plate, Heatsink, Copper Wire
- **AND** consumer type toggles SHALL only be enabled when master toggle is on
- **AND** each toggle SHALL show current state (on/off)

#### Scenario: Save settings

- **WHEN** user clicks the Save button in the settings dialog
- **THEN** all settings SHALL be persisted to localStorage
- **AND** the dialog SHALL close
- **AND** node display SHALL update immediately to reflect new settings
- **AND** a toast notification SHALL confirm settings were saved

#### Scenario: Cancel settings

- **WHEN** user clicks the Cancel button or closes the settings dialog
- **THEN** no settings changes SHALL be saved
- **AND** the dialog SHALL close
- **AND** node display SHALL remain unchanged

### Requirement: Settings Persistence

The production designer SHALL persist user settings across sessions using browser localStorage, including dedicated production line preferences.

#### Scenario: Save settings to localStorage

- **WHEN** user saves settings in the settings dialog
- **THEN** the settings SHALL be serialized to JSON
- **AND** stored in localStorage with key `lrl-designer-settings`
- **AND** the stored object SHALL contain: `showResourceIconNodes`, `showMachineryIconNodes`, `autoIconOnlyMode`, `iconOnlyZoomThreshold`, `useDedicatedProductionLines`, and individual consumer type toggles

#### Scenario: Load settings on mount

- **WHEN** the production designer initializes
- **THEN** the system SHALL attempt to load settings from localStorage key `lrl-designer-settings`
- **AND** if settings exist, they SHALL be parsed and applied
- **AND** if settings do not exist, default values SHALL be used
- **AND** default values SHALL include: `useDedicatedProductionLines: false`, and all consumer type toggles set to `false`

#### Scenario: Settings format

- **WHEN** storing or loading settings
- **THEN** the settings object SHALL conform to the DesignerSettings interface
- **AND** invalid or corrupted settings SHALL be ignored and defaults used instead
- **AND** missing properties SHALL be filled with default values
