# Production Designer Specification

## ADDED Requirements

### Requirement: Flow State Persistence

The production designer SHALL provide the ability to save and restore the complete flow state including nodes, edges, and viewport configuration.

#### Scenario: Save current flow

- **WHEN** user clicks the "Save" button in the top-right panel
- **THEN** the current flow state (all nodes, edges, and viewport position/zoom) SHALL be serialized and stored in browser localStorage with the key `lrl-designer-flow`

#### Scenario: Restore saved flow

- **WHEN** user clicks the "Restore" button in the top-right panel
- **AND** a saved flow exists in localStorage
- **THEN** the saved nodes SHALL be restored to the canvas
- **AND** the saved edges SHALL be restored to the canvas
- **AND** the viewport SHALL be restored to the saved position and zoom level

#### Scenario: Restore with no saved flow

- **WHEN** user clicks the "Restore" button in the top-right panel
- **AND** no saved flow exists in localStorage
- **THEN** no action SHALL be taken (graceful no-op)

#### Scenario: Flow state includes viewport

- **WHEN** a flow is saved
- **THEN** the viewport x position, y position, and zoom level SHALL be included in the saved state
- **AND** these viewport properties SHALL be restored when the flow is loaded

### Requirement: Save and Restore UI Controls

The production designer SHALL provide intuitive UI controls for saving and restoring flows in the top-right control panel.

#### Scenario: Save button placement

- **WHEN** user views the Designer tab
- **THEN** a "Save" button SHALL be visible in the top-right Panel
- **AND** the button SHALL be positioned between the "Restore" button and "Clear Canvas" button
- **AND** the button SHALL display a Save icon from lucide-react
- **AND** the button SHALL use variant="secondary" and size="sm" styling

#### Scenario: Restore button placement

- **WHEN** user views the Designer tab
- **THEN** a "Restore" button SHALL be visible in the top-right Panel
- **AND** the button SHALL be positioned before the "Save" button
- **AND** the button SHALL display a FolderOpen icon from lucide-react
- **AND** the button SHALL use variant="secondary" and size="sm" styling

#### Scenario: Button visual consistency

- **WHEN** user views the control panel buttons
- **THEN** the Save and Restore buttons SHALL have consistent styling with existing panel buttons (Auto Build, Auto Layout, Clear Canvas, Theme Toggle)
- **AND** the buttons SHALL include both icon and text label for clarity

### Requirement: Flow Serialization Format

The production designer SHALL use ReactFlow's native serialization format for saving and restoring flows.

#### Scenario: Serialize using ReactFlow instance

- **WHEN** saving a flow
- **THEN** the system SHALL use the ReactFlow instance's `toObject()` method to serialize the flow
- **AND** the serialized object SHALL include nodes array, edges array, and viewport object

#### Scenario: Storage format

- **WHEN** storing the flow in localStorage
- **THEN** the flow object SHALL be converted to JSON string using `JSON.stringify()`
- **AND** the JSON string SHALL be stored with the key `lrl-designer-flow`

#### Scenario: Restore format parsing

- **WHEN** restoring a flow from localStorage
- **THEN** the JSON string SHALL be parsed using `JSON.parse()`
- **AND** the parsed object SHALL contain nodes, edges, and viewport properties
- **AND** default values SHALL be used if any property is missing (x=0, y=0, zoom=1)

### Requirement: State Management Integration

The save and restore functionality SHALL integrate seamlessly with existing ReactFlow state management hooks.

#### Scenario: Save uses ReactFlow instance

- **WHEN** implementing save functionality
- **THEN** the system SHALL use the `rfInstance` state variable obtained from ReactFlow's `onInit` callback
- **AND** the save operation SHALL only proceed if `rfInstance` exists

#### Scenario: Restore uses state setters

- **WHEN** implementing restore functionality
- **THEN** the system SHALL use `setNodes()` from `useNodesState` hook to restore nodes
- **AND** the system SHALL use `setEdges()` from `useEdgesState` hook to restore edges
- **AND** the system SHALL use `setViewport()` from `useReactFlow` hook to restore viewport

#### Scenario: Callback optimization

- **WHEN** defining save and restore functions
- **THEN** both functions SHALL be wrapped in `useCallback` hook for performance optimization
- **AND** appropriate dependencies SHALL be specified in the dependency array
