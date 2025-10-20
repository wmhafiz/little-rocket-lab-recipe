# production-designer Specification

## Purpose
TBD - created by archiving change add-save-restore-flow. Update Purpose after archive.
## Requirements
### Requirement: Flow State Persistence

The production designer SHALL provide the ability to save and restore the complete flow state including nodes, edges, and viewport configuration using a slot-based system.

#### Scenario: Save current flow

- **WHEN** user clicks the "Save" button in the top-right panel
- **THEN** the current flow state (all nodes, edges, and viewport position/zoom) SHALL be serialized and stored in browser localStorage with the key `lrl-designer-slot-{N}` where N is the current active slot index
- **AND** the slot metadata SHALL be updated with current timestamp

#### Scenario: Restore saved flow

- **WHEN** user clicks the "Restore" button in the top-right panel
- **AND** the current active slot has saved flow data
- **THEN** the saved nodes SHALL be restored to the canvas
- **AND** the saved edges SHALL be restored to the canvas
- **AND** the viewport SHALL be restored to the saved position and zoom level

#### Scenario: Restore with no saved flow

- **WHEN** user clicks the "Restore" button in the top-right panel
- **AND** the current active slot is empty
- **THEN** no action SHALL be taken (graceful no-op)

#### Scenario: Flow state includes viewport

- **WHEN** a flow is saved to any slot
- **THEN** the viewport x position, y position, and zoom level SHALL be included in the saved state
- **AND** these viewport properties SHALL be restored when the flow is loaded

### Requirement: Save and Restore UI Controls

The production designer SHALL provide intuitive UI controls for saving and restoring flows in the top-right control panel, with quick-access buttons and explicit slot management buttons.

#### Scenario: Save button placement

- **WHEN** user views the Designer tab on desktop
- **THEN** a "Save" button SHALL be visible in the top-right Panel
- **AND** the button SHALL be positioned after the "Restore" button
- **AND** the button SHALL display a Save icon from lucide-react
- **AND** the button SHALL use variant="secondary" and size="sm" styling
- **AND** clicking it SHALL save to the current active slot without showing a dialog

#### Scenario: Restore button placement

- **WHEN** user views the Designer tab on desktop
- **THEN** a "Restore" button SHALL be visible in the top-right Panel
- **AND** the button SHALL be positioned after the "Auto Layout" button
- **AND** the button SHALL display a FolderOpen icon from lucide-react
- **AND** the button SHALL use variant="secondary" and size="sm" styling
- **AND** clicking it SHALL restore from the current active slot without showing a dialog

#### Scenario: Button visual consistency

- **WHEN** user views the control panel buttons
- **THEN** the Save, Restore, Save As, and Load buttons SHALL have consistent styling with existing panel buttons (Auto Build, Auto Layout, Clear Canvas, Theme Toggle)
- **AND** the buttons SHALL include both icon and text label for clarity on desktop
- **AND** on mobile menu, buttons SHALL be full-width with left-aligned icon and text

### Requirement: Flow Serialization Format

The production designer SHALL use ReactFlow's native serialization format for saving and restoring flows across all slots.

#### Scenario: Serialize using ReactFlow instance

- **WHEN** saving a flow to any slot
- **THEN** the system SHALL use the ReactFlow instance's `toObject()` method to serialize the flow
- **AND** the serialized object SHALL include nodes array, edges array, and viewport object

#### Scenario: Storage format

- **WHEN** storing the flow in localStorage
- **THEN** the flow object SHALL be converted to JSON string using `JSON.stringify()`
- **AND** the JSON string SHALL be stored with the key `lrl-designer-slot-{N}` where N is the slot index

#### Scenario: Restore format parsing

- **WHEN** restoring a flow from any slot
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

### Requirement: Multiple Save Slots

The production designer SHALL provide multiple save slots (up to 10) for storing different production line designs, each with a title and optional description.

#### Scenario: Save to specific slot

- **WHEN** user saves a flow to a specific slot
- **THEN** the flow state SHALL be stored in localStorage with key `lrl-designer-slot-{N}` where N is the slot index (0-9)
- **AND** the slot metadata SHALL include title, description, last modified timestamp, and viewport state

#### Scenario: List available slots

- **WHEN** user opens slot selection dialog
- **THEN** all slots (0-9) SHALL be displayed
- **AND** empty slots SHALL be shown as "Empty Slot" with option to save
- **AND** occupied slots SHALL display their title, description preview (first 50 chars), and last modified date

#### Scenario: Slot metadata storage

- **WHEN** saving or loading slots
- **THEN** slot metadata SHALL be stored in localStorage with key `lrl-designer-slot-metadata`
- **AND** metadata SHALL be a JSON object containing an array of slot info objects
- **AND** each slot info object SHALL contain: `index`, `title`, `description`, `lastModified` (ISO 8601 timestamp), `isEmpty` (boolean)

#### Scenario: Slot title validation

- **WHEN** user enters a slot title
- **THEN** the title SHALL be required and cannot be empty
- **AND** the title SHALL be limited to 50 characters
- **AND** the description SHALL be optional and limited to 200 characters

#### Scenario: Overwrite confirmation

- **WHEN** user attempts to save to an occupied slot
- **THEN** the system SHALL display a confirmation dialog
- **AND** the dialog SHALL show the existing slot's title and last modified date
- **AND** user SHALL be able to confirm overwrite or cancel

### Requirement: Slot Management

The production designer SHALL provide the ability to delete slots and edit slot metadata (title and description) without changing the saved flow data.

#### Scenario: Delete slot

- **WHEN** user selects delete option for an occupied slot
- **THEN** the system SHALL display a confirmation dialog with the slot title
- **AND** upon confirmation, the slot data SHALL be removed from localStorage (key `lrl-designer-slot-{N}`)
- **AND** the slot metadata SHALL be updated to mark the slot as empty
- **AND** if the deleted slot was the current active slot, the active slot SHALL be reset to slot 0

#### Scenario: Edit slot metadata

- **WHEN** user selects edit option for an occupied slot
- **THEN** the system SHALL display a dialog with the current title and description pre-filled
- **AND** user SHALL be able to modify the title and description
- **AND** title validation rules SHALL apply (required, max 50 chars)
- **AND** description validation rules SHALL apply (optional, max 200 chars)
- **AND** upon save, only the metadata SHALL be updated
- **AND** the flow data SHALL remain unchanged
- **AND** the lastModified timestamp SHALL be updated to reflect the metadata change

#### Scenario: Slot action menu

- **WHEN** user views an occupied slot in the slot selection dialog
- **THEN** each slot SHALL display action buttons or menu for Edit and Delete
- **AND** empty slots SHALL not display Edit or Delete actions
- **AND** action buttons SHALL be clearly labeled with icons (Edit: Pencil, Delete: Trash)

#### Scenario: Delete confirmation safety

- **WHEN** user confirms slot deletion
- **THEN** the deletion SHALL be permanent and cannot be undone
- **AND** the confirmation dialog SHALL clearly warn about permanent deletion
- **AND** the user SHALL be able to cancel the deletion at any time before confirmation

### Requirement: Current Active Slot

The production designer SHALL maintain a current active slot that is used for quick save and quick restore operations.

#### Scenario: Set active slot on load

- **WHEN** user loads a flow from a specific slot
- **THEN** that slot SHALL become the current active slot
- **AND** the active slot index SHALL be stored in localStorage with key `lrl-designer-current-slot`

#### Scenario: Quick save to active slot

- **WHEN** user clicks the "Save" button (without "As")
- **THEN** the flow SHALL be saved to the current active slot
- **AND** no slot selection dialog SHALL be shown
- **AND** if no active slot exists, the system SHALL default to slot 0

#### Scenario: Quick restore from active slot

- **WHEN** user clicks the "Restore" button
- **THEN** the flow SHALL be restored from the current active slot
- **AND** no slot selection dialog SHALL be shown
- **AND** if current active slot is empty, no action SHALL be taken

### Requirement: Save As and Load UI

The production designer SHALL provide "Save As" and "Load" buttons for explicit slot management alongside quick save/restore buttons.

#### Scenario: Save As button placement

- **WHEN** user views the Designer tab on desktop
- **THEN** a "Save As" button SHALL be visible in the top-right Panel
- **AND** the button SHALL be positioned immediately after the "Save" button
- **AND** the button SHALL display a FolderPlus icon from lucide-react
- **AND** the button SHALL use variant="secondary" and size="sm" styling

#### Scenario: Save As dialog

- **WHEN** user clicks "Save As" button
- **THEN** a dialog SHALL open displaying all 10 slots
- **AND** user SHALL be able to enter a title (required) and description (optional)
- **AND** user SHALL be able to select an empty or occupied slot
- **AND** occupied slots SHALL show confirmation before overwriting

#### Scenario: Load button placement

- **WHEN** user views the Designer tab on desktop
- **THEN** a "Load" button SHALL be visible in the top-right Panel
- **AND** the button SHALL be positioned immediately after the "Restore" button
- **AND** the button SHALL display a Files icon from lucide-react
- **AND** the button SHALL use variant="secondary" and size="sm" styling

#### Scenario: Load dialog

- **WHEN** user clicks "Load" button
- **THEN** a dialog SHALL open displaying all occupied slots
- **AND** each slot SHALL show its title, description, and last modified date
- **AND** each slot SHALL display Edit and Delete action buttons
- **AND** user SHALL be able to select a slot to load
- **AND** user SHALL be able to edit slot metadata via the Edit button
- **AND** user SHALL be able to delete a slot via the Delete button
- **AND** loading a slot SHALL set it as the current active slot

### Requirement: Mobile Responsive Menu

The production designer SHALL provide a hamburger menu for mobile and tablet devices to access all control buttons.

#### Scenario: Hamburger menu visibility

- **WHEN** viewport width is less than 1024px (md breakpoint in Tailwind)
- **THEN** all control buttons in the top-right Panel SHALL be hidden
- **AND** a hamburger menu button SHALL be visible in the top-right Panel
- **AND** the hamburger menu button SHALL display a Menu icon from lucide-react

#### Scenario: Desktop button visibility

- **WHEN** viewport width is 1024px or greater
- **THEN** all control buttons SHALL be visible in the top-right Panel
- **AND** the hamburger menu button SHALL be hidden

#### Scenario: Open hamburger menu

- **WHEN** user clicks the hamburger menu button on mobile
- **THEN** a Sheet component SHALL slide in from the right side
- **AND** the Sheet SHALL contain all control buttons in a vertical layout
- **AND** buttons SHALL include: Auto Build, Auto Layout, Restore, Save, Save As, Load, Clear Canvas, and Theme Toggle

#### Scenario: Close hamburger menu

- **WHEN** hamburger menu is open
- **THEN** user SHALL be able to close it by clicking outside the Sheet
- **OR** by clicking a close button in the Sheet header
- **OR** automatically after selecting any action button

### Requirement: Data Migration

The production designer SHALL migrate existing single-slot save data to the new multi-slot format on first load.

#### Scenario: Migrate existing save

- **WHEN** application loads with the new multi-slot feature for the first time
- **AND** `lrl-designer-flow` key exists in localStorage
- **THEN** the flow data SHALL be migrated to `lrl-designer-slot-0`
- **AND** metadata SHALL be created with title "Default Design" and current timestamp
- **AND** slot 0 SHALL be set as the current active slot
- **AND** the old `lrl-designer-flow` key SHALL be removed

#### Scenario: Fresh start with no migration

- **WHEN** application loads with the new multi-slot feature
- **AND** no `lrl-designer-flow` key exists in localStorage
- **THEN** no migration SHALL occur
- **AND** all slots SHALL be initialized as empty
- **AND** slot 0 SHALL be set as the default current active slot

### Requirement: Resource Node Type

The production designer SHALL support a "Resource" node type for raw materials that displays as a compact icon-only node with output-only capability.

#### Scenario: Resource node visual display

- **WHEN** a resource node (Coal, Iron Ore, Copper Ore, Stone, Wood, Quartz, Computer Tower, Computer Monitor) is added to the canvas
- **THEN** the node SHALL be displayed as a compact icon (64x64px) showing only the resource icon
- **AND** the node SHALL NOT display input handles
- **AND** the node SHALL display a single output handle on the right side
- **AND** the node SHALL NOT display a full card with ingredient details

#### Scenario: Resource node tooltip

- **WHEN** user hovers over a resource icon node
- **THEN** a tooltip SHALL display showing the resource name
- **AND** the tooltip SHALL show the output rate per minute if applicable

#### Scenario: Resource node output connection

- **WHEN** user connects from a resource node's output handle
- **THEN** the connection SHALL behave identically to standard recipe node connections
- **AND** the resource name SHALL be used for connection validation

#### Scenario: Resource node list

- **WHEN** the production designer initializes
- **THEN** the following resources SHALL be available as Resource type nodes: Coal, Iron Ore, Copper Ore, Stone, Wood, Quartz, Computer Tower, Computer Monitor
- **AND** each resource SHALL have an associated icon image

### Requirement: Machinery Icon-Only Node Display

The production designer SHALL display Machinery type nodes as compact icon-only nodes with input-only capability.

#### Scenario: Machinery node visual display

- **WHEN** a machinery node (any recipe with type "Machinery") is added to the canvas
- **THEN** the node SHALL be displayed as a compact icon (64x64px) showing only the machinery icon
- **AND** the node SHALL display input handles on the left side for each ingredient
- **AND** the node SHALL NOT display an output handle
- **AND** the node SHALL NOT display a full card with output details

#### Scenario: Machinery node tooltip

- **WHEN** user hovers over a machinery icon node
- **THEN** a tooltip SHALL display showing the machinery name
- **AND** the tooltip SHALL show the required inputs if space permits

#### Scenario: Machinery node input connections

- **WHEN** user connects to a machinery node's input handle
- **THEN** the connection SHALL behave identically to standard recipe node connections
- **AND** ingredient validation SHALL work the same as full card nodes

#### Scenario: Machinery node sizing

- **WHEN** a machinery node has multiple ingredients
- **THEN** the node icon size SHALL remain fixed at 64x64px
- **AND** input handles SHALL be vertically distributed along the left edge of the node
- **AND** handle spacing SHALL be calculated as: nodeHeight / (numberOfIngredients + 1)

### Requirement: Icon Node Component Architecture

The production designer SHALL implement separate node components for icon-only resource and machinery nodes.

#### Scenario: ResourceIconNode component

- **WHEN** rendering a resource node
- **THEN** the system SHALL use a `ResourceIconNode` component
- **AND** the component SHALL extend the ReactFlow Node component
- **AND** the component SHALL render a circular or square container (64x64px)
- **AND** the component SHALL display the resource icon centered within the container
- **AND** the component SHALL include a single Handle component with type="source" and position="right"

#### Scenario: MachineryIconNode component

- **WHEN** rendering a machinery node
- **THEN** the system SHALL use a `MachineryIconNode` component
- **AND** the component SHALL extend the ReactFlow Node component
- **AND** the component SHALL render a circular or square container (64x64px)
- **AND** the component SHALL display the machinery icon centered within the container
- **AND** the component SHALL include Handle components with type="target" and position="left" for each ingredient
- **AND** each handle SHALL have a unique id of format "input-{index}"

#### Scenario: Node type registration

- **WHEN** the production designer initializes ReactFlow
- **THEN** the nodeTypes configuration SHALL include:
  - `recipeNode: RecipeNode` (existing full card nodes for Components and Materials)
  - `resourceIconNode: ResourceIconNode` (new icon-only resource nodes)
  - `machineryIconNode: MachineryIconNode` (new icon-only machinery nodes)

### Requirement: Node Type Determination

The production designer SHALL automatically determine the appropriate node component based on the recipe type.

#### Scenario: Resource node type selection

- **WHEN** creating a node for a recipe with type "Resource"
- **THEN** the node type SHALL be set to "resourceIconNode"
- **AND** the ResourceIconNode component SHALL be used for rendering

#### Scenario: Machinery node type selection

- **WHEN** creating a node for a recipe with type "Machinery"
- **THEN** the node type SHALL be set to "machineryIconNode"
- **AND** the MachineryIconNode component SHALL be used for rendering

#### Scenario: Component and Material node type selection

- **WHEN** creating a node for a recipe with type "Component" or "Material" or "Repair"
- **THEN** the node type SHALL be set to "recipeNode"
- **AND** the RecipeNode component SHALL be used for rendering (existing full card display)

#### Scenario: Node type in auto-build

- **WHEN** the auto-build feature creates nodes
- **THEN** the system SHALL apply the same node type determination logic
- **AND** resource nodes SHALL be created as resourceIconNode type
- **AND** machinery nodes SHALL be created as machineryIconNode type

### Requirement: Resource Data Definition

The production designer SHALL include resource definitions in the crafting data with appropriate metadata.

#### Scenario: Resource recipe structure

- **WHEN** defining a resource in the crafting data
- **THEN** each resource SHALL have the following properties:
  - `type: "Resource"`
  - `name: string` (e.g., "Coal", "Iron Ore")
  - `outputPerMin: string` (typical production rate or "N/A")
  - `icon: string` (path to icon image)
  - `ingredients: []` (empty array, as resources have no inputs)

#### Scenario: Resource availability in sidebar

- **WHEN** user views the recipe sidebar
- **THEN** resources SHALL appear in a "Resource" category
- **AND** resources SHALL be available for manual addition to the canvas
- **AND** clicking a resource SHALL add it as a resourceIconNode type

#### Scenario: Resource list completeness

- **WHEN** the crafting data is loaded
- **THEN** the following resources SHALL be defined: Coal, Iron Ore, Copper Ore, Stone, Wood, Quartz, Computer Tower, Computer Monitor
- **AND** each SHALL have a valid icon path
- **AND** each SHALL have type="Resource"

### Requirement: Icon Node Styling

Icon-only nodes SHALL have consistent, visually distinct styling from full card nodes.

#### Scenario: Icon node container styling

- **WHEN** rendering a ResourceIconNode or MachineryIconNode
- **THEN** the container SHALL be a rounded square or circle (64x64px)
- **AND** the container SHALL have a border with border-width of 2px
- **AND** the container SHALL use theme-aware colors (border-border class)
- **AND** the container SHALL have a shadow (shadow-md class)

#### Scenario: Icon image display

- **WHEN** displaying the icon within an icon node
- **THEN** the image SHALL be centered within the container
- **AND** the image SHALL have padding of 8px from container edges
- **AND** the image SHALL use object-fit: contain
- **AND** the image SHALL have error handling (fallback to placeholder on load error)

#### Scenario: Icon node handle styling

- **WHEN** rendering handles on icon nodes
- **THEN** handles SHALL use the same styling as full card node handles
- **AND** handles SHALL have width and height of 12px (3 in Tailwind units)
- **AND** handles SHALL be positioned at the center of the node's edge (top-1/2 -translate-y-1/2)

#### Scenario: Icon node hover state

- **WHEN** user hovers over an icon node
- **THEN** the container SHALL show a hover effect (scale transform or border color change)
- **AND** the cursor SHALL change to pointer
- **AND** a tooltip SHALL appear after 500ms delay

### Requirement: Icon Node Interaction

Icon-only nodes SHALL support the same core interactions as full card nodes.

#### Scenario: Icon node selection

- **WHEN** user clicks an icon node
- **THEN** the node SHALL be selected (highlighted border)
- **AND** the NodeToolbar SHALL appear above the node
- **AND** the Delete button SHALL be available in the toolbar

#### Scenario: Icon node deletion

- **WHEN** user clicks the Delete button on an icon node's toolbar
- **THEN** the node SHALL be removed from the canvas
- **AND** all connected edges SHALL be removed
- **AND** the behavior SHALL be identical to deleting full card nodes

#### Scenario: Icon node dragging

- **WHEN** user drags an icon node
- **THEN** the node SHALL move smoothly across the canvas
- **AND** connected edges SHALL update in real-time
- **AND** the behavior SHALL be identical to dragging full card nodes

#### Scenario: Icon node connection creation

- **WHEN** user initiates a connection from/to an icon node handle
- **THEN** the connection preview line SHALL be displayed
- **AND** valid drop targets SHALL be highlighted
- **AND** the connection SHALL be created on valid drop
- **AND** the behavior SHALL be identical to full card node connections

### Requirement: Auto Layout Support for Icon Nodes

The auto-layout algorithm SHALL handle icon-only nodes with adjusted spacing calculations.

#### Scenario: Icon node dimensions in layout

- **WHEN** the auto-layout algorithm calculates node positions
- **THEN** icon nodes (Resource and Machinery) SHALL use dimensions of 64x64px
- **AND** full card nodes SHALL continue using 280x200px dimensions
- **AND** the algorithm SHALL use the actual node dimensions for spacing calculations

#### Scenario: Mixed node type layout

- **WHEN** the canvas contains both icon nodes and full card nodes
- **THEN** the auto-layout SHALL handle both types correctly
- **AND** horizontal spacing SHALL be calculated based on the widest node in each column
- **AND** vertical spacing SHALL accommodate all node sizes

#### Scenario: Icon node layer assignment

- **WHEN** running topological sort for auto-layout
- **THEN** icon nodes SHALL be assigned to layers using the same algorithm as full card nodes
- **AND** resource nodes (no inputs) SHALL typically appear in the first layer
- **AND** machinery nodes (no outputs) SHALL typically appear in the last layer

