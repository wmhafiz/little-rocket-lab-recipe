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

The production designer SHALL implement separate node components for icon-only resource and machinery nodes, with support for zoom-based icon-only mode.

#### Scenario: ResourceIconNode component

- **WHEN** rendering a resource node
- **THEN** the system SHALL use a `ResourceIconNode` component
- **AND** the component SHALL extend the ReactFlow Node component
- **AND** the component SHALL render a circular or square container (64x64px)
- **AND** the component SHALL display the resource icon centered within the container
- **AND** the component SHALL include a single Handle component with type="source" and position="right"
- **AND** the component SHALL accept an `iconOnlyMode` flag in its data for zoom-based simplification

#### Scenario: MachineryIconNode component

- **WHEN** rendering a machinery node
- **THEN** the system SHALL use a `MachineryIconNode` component
- **AND** the component SHALL extend the ReactFlow Node component
- **AND** the component SHALL render a circular or square container (64x64px)
- **AND** the component SHALL display the machinery icon centered within the container
- **AND** the component SHALL include Handle components with type="target" and position="left" for each ingredient
- **AND** each handle SHALL have a unique id of format "input-{index}"
- **AND** the component SHALL accept an `iconOnlyMode` flag in its data for zoom-based simplification

#### Scenario: Node type registration

- **WHEN** the production designer initializes ReactFlow
- **THEN** the nodeTypes configuration SHALL include:
  - `recipeNode: RecipeNode` (full card nodes for Components and Materials, or when icon display is disabled)
  - `resourceIconNode: ResourceIconNode` (icon-only resource nodes when icon display is enabled)
  - `machineryIconNode: MachineryIconNode` (icon-only machinery nodes when icon display is enabled)

### Requirement: Node Type Determination

The production designer SHALL automatically determine the appropriate node component based on the recipe type and current settings.

#### Scenario: Resource node type selection

- **WHEN** creating a node for a recipe with type "Resource"
- **AND** `showResourceIconNodes` setting is true
- **THEN** the node type SHALL be set to "resourceIconNode"
- **AND** the ResourceIconNode component SHALL be used for rendering

#### Scenario: Resource node type selection with icons disabled

- **WHEN** creating a node for a recipe with type "Resource"
- **AND** `showResourceIconNodes` setting is false
- **THEN** the node type SHALL be set to "recipeNode"
- **AND** the RecipeNode component SHALL be used for rendering

#### Scenario: Machinery node type selection

- **WHEN** creating a node for a recipe with type "Machinery"
- **AND** `showMachineryIconNodes` setting is true
- **THEN** the node type SHALL be set to "machineryIconNode"
- **AND** the MachineryIconNode component SHALL be used for rendering

#### Scenario: Machinery node type selection with icons disabled

- **WHEN** creating a node for a recipe with type "Machinery"
- **AND** `showMachineryIconNodes` setting is false
- **THEN** the node type SHALL be set to "recipeNode"
- **AND** the RecipeNode component SHALL be used for rendering

#### Scenario: Component and Material node type selection

- **WHEN** creating a node for a recipe with type "Component" or "Material" or "Repair"
- **THEN** the node type SHALL be set to "recipeNode"
- **AND** the RecipeNode component SHALL be used for rendering (existing full card display)

#### Scenario: Node type in auto-build

- **WHEN** the auto-build feature creates nodes
- **THEN** the system SHALL apply the same node type determination logic based on current settings
- **AND** resource nodes SHALL be created as resourceIconNode or recipeNode based on settings
- **AND** machinery nodes SHALL be created as machineryIconNode or recipeNode based on settings

#### Scenario: Zoom-based icon-only mode overrides

- **WHEN** automatic icon-only mode is active (zoom below threshold)
- **THEN** the `iconOnlyMode` flag SHALL be set to true in all node data
- **AND** this flag SHALL be passed to node components for rendering adjustments
- **AND** node types SHALL remain as determined by settings (not changed by zoom)

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

### Requirement: Optimal Production Rate Calculation

The production designer SHALL calculate and display the optimal production rate required for each input node to satisfy all connected downstream consumers based on `quantityPerMin` and `outputPerMin` recipe data.

#### Scenario: Calculate requirement for single consumer

- **WHEN** a resource node is connected to a single machinery or component node
- **AND** the downstream node has an ingredient with `quantityPerMin` value
- **THEN** the system SHALL calculate the required production rate as the sum of all `quantityPerMin` values for connections from that resource
- **AND** the required rate SHALL be stored for display on the resource node

#### Scenario: Aggregate requirements for multiple consumers

- **WHEN** a resource or component node is connected to multiple downstream consumers
- **AND** each consumer has different `quantityPerMin` requirements
- **THEN** the system SHALL sum all `quantityPerMin` values from all consumers
- **AND** display the total aggregated required production rate

#### Scenario: Backward propagation through production chain

- **WHEN** a multi-tier production chain exists (Resource → Component → Machinery)
- **THEN** the system SHALL propagate requirements backward from machinery nodes through all intermediate nodes to resource nodes
- **AND** each intermediate node SHALL calculate both what it needs to consume (from upstream) and what it needs to produce (for downstream)

#### Scenario: Recalculate on graph changes

- **WHEN** nodes or edges are added, removed, or modified
- **THEN** the system SHALL automatically recalculate all optimal production requirements
- **AND** update visual indicators on all affected nodes

#### Scenario: Handle disconnected nodes

- **WHEN** a node has no downstream consumers (no outgoing connections)
- **THEN** the system SHALL not display any production requirement indicator
- **OR** display a "disconnected" status indicator

#### Scenario: Handle invalid data gracefully

- **WHEN** a recipe has missing or invalid `quantityPerMin` or `outputPerMin` values
- **THEN** the system SHALL skip calculation for that recipe
- **AND** optionally display a warning indicator or "N/A" status

### Requirement: Production Status Indicators

The production designer SHALL display visual indicators on nodes showing the required production rate and whether the node's output meets, exceeds, or falls short of requirements.

#### Scenario: Display required rate badge

- **WHEN** a resource or component node has calculated optimal production requirements
- **THEN** a badge SHALL be displayed on the node showing the required production rate in items per minute
- **AND** the badge SHALL be positioned in the top-right corner of the node
- **AND** the badge SHALL not obscure the node icon or connection handles

#### Scenario: Color-coded status - Optimal

- **WHEN** a node's `outputPerMin` equals or exceeds the calculated required production rate
- **THEN** the indicator badge SHALL be displayed with green styling
- **AND** the status SHALL be marked as "optimal"

#### Scenario: Color-coded status - Deficit

- **WHEN** a node's `outputPerMin` is less than the calculated required production rate
- **THEN** the indicator badge SHALL be displayed with red styling
- **AND** the status SHALL be marked as "deficit"
- **AND** optionally, the node border or glow effect SHALL indicate deficit status

#### Scenario: Color-coded status - Excess

- **WHEN** a node's `outputPerMin` significantly exceeds the required rate (e.g., >10% margin)
- **THEN** the indicator badge MAY be displayed with yellow/amber styling
- **AND** the status SHALL be marked as "excess"

#### Scenario: Color-coded status - Disconnected

- **WHEN** a node has no downstream consumers
- **THEN** the indicator badge SHALL either not be displayed
- **OR** display a gray "disconnected" indicator
- **AND** the status SHALL be marked as "disconnected"

#### Scenario: Theme compatibility

- **WHEN** the user switches between dark and light themes
- **THEN** the production status indicators SHALL adapt colors appropriately
- **AND** maintain sufficient contrast for readability in both themes
- **AND** use theme-aware CSS classes for color definitions

#### Scenario: Badge styling consistency

- **WHEN** displaying production status badges
- **THEN** badges SHALL use consistent styling with existing UI components (shadcn/ui Badge component)
- **AND** font size SHALL be readable without zooming
- **AND** badges SHALL have sufficient padding and border-radius

### Requirement: Production Indicator Tooltips

The production designer SHALL provide detailed tooltips explaining the optimal production calculation and status for each node.

#### Scenario: Show calculation breakdown on hover

- **WHEN** user hovers over a production status indicator badge
- **THEN** a tooltip SHALL appear after a 500ms delay
- **AND** the tooltip SHALL display the required production rate with units (e.g., "180/min required")
- **AND** the tooltip SHALL display the node's actual output rate (e.g., "Output: 200/min")
- **AND** the tooltip SHALL show the production status (Optimal/Deficit/Excess)

#### Scenario: Show aggregation details for multiple consumers

- **WHEN** a node has multiple downstream consumers
- **AND** user hovers over the production indicator
- **THEN** the tooltip SHALL break down requirements by consumer
- **AND** display each consumer's contribution to the total requirement
- **AND** format as: "Total Required: 180/min\n - Assembler A: 90/min\n - Assembler B: 90/min"

#### Scenario: Explain deficit status

- **WHEN** a node has deficit production status
- **AND** user views the tooltip
- **THEN** the tooltip SHALL include explanatory text such as "⚠️ Insufficient production. Add more nodes or increase production rate."
- **AND** optionally suggest the number of additional nodes needed

#### Scenario: Tooltip positioning

- **WHEN** displaying production indicator tooltips
- **THEN** tooltips SHALL be positioned to avoid obscuring the node or nearby nodes
- **AND** tooltips SHALL follow standard Radix UI Tooltip behavior
- **AND** tooltips SHALL disappear when mouse leaves the indicator area

### Requirement: Cycle Detection and Handling

The production designer SHALL detect cycles in the production graph and handle them gracefully without causing infinite loops or incorrect calculations.

#### Scenario: Detect production cycles

- **WHEN** the optimal production calculation traverses the graph
- **AND** a cycle is detected (Node A → Node B → Node A)
- **THEN** the system SHALL detect the cycle using visited node tracking
- **AND** mark all nodes in the cycle with a "cycle" status

#### Scenario: Display cycle warning

- **WHEN** a node is part of a detected production cycle
- **THEN** the node SHALL display a warning indicator instead of a production requirement
- **AND** the indicator SHALL use a distinctive icon (e.g., alert triangle)
- **AND** hovering over the indicator SHALL show tooltip: "⚠️ Cycle detected. Production requirements cannot be calculated for circular dependencies."

#### Scenario: Prevent infinite loops

- **WHEN** traversing the graph for optimal production calculation
- **THEN** the algorithm SHALL maintain a visited set per traversal path
- **AND** SHALL skip revisiting nodes already in the current path
- **AND** ensure the calculation completes without hanging or crashing

#### Scenario: Partial calculation with cycles

- **WHEN** only part of the graph contains cycles
- **THEN** the system SHALL calculate optimal production for non-cycle nodes
- **AND** display normal indicators for nodes not involved in cycles
- **AND** only show cycle warnings for affected nodes

### Requirement: Production Indicator on Icon Nodes

The production designer SHALL display optimal production indicators on both icon-only nodes (Resource and Machinery types) and full card nodes (Component and Material types).

#### Scenario: Resource icon node indicator

- **WHEN** a Resource type node (icon-only, 64x64px) has calculated production requirements
- **THEN** the production indicator badge SHALL be positioned in the top-right corner
- **AND** the badge SHALL be scaled appropriately for the smaller node size
- **AND** the badge SHALL not overlap with output handles

#### Scenario: Component card node indicator

- **WHEN** a Component or Material type node (full card) has calculated production requirements
- **THEN** the production indicator badge SHALL be positioned in the top-right corner of the card
- **AND** the badge SHALL be visible alongside existing node content (icon, name, output rate)

#### Scenario: Machinery nodes show total consumption

- **WHEN** a Machinery type node has input connections
- **THEN** the node MAY optionally display total consumption rate (sum of all inputs)
- **AND** this SHALL be a separate indicator from production requirements (machinery consumes, doesn't produce)
- **AND** positioned in the top-left corner to distinguish from production indicators

#### Scenario: Handle spacing on small nodes

- **WHEN** displaying indicators on 64x64px icon nodes
- **THEN** the badge SHALL use smaller font size (e.g., 10px instead of 12px)
- **AND** the badge padding SHALL be reduced proportionally
- **AND** the badge SHALL remain readable at standard canvas zoom levels (100%)

### Requirement: Performance Optimization for Calculations

The production designer SHALL optimize optimal production calculations to ensure responsive performance even with large production graphs.

#### Scenario: Memoize calculation function

- **WHEN** implementing the optimal production calculation
- **THEN** the calculation function SHALL be wrapped in `useMemo` hook
- **AND** dependencies SHALL include only nodes, edges, and recipes data
- **AND** recalculation SHALL only occur when dependencies change

#### Scenario: Handle typical graph sizes efficiently

- **WHEN** the production graph contains up to 100 nodes
- **THEN** the optimal production calculation SHALL complete within 100ms
- **AND** the UI SHALL remain responsive during calculation
- **AND** no frame drops or lag SHALL be perceptible to the user

#### Scenario: Efficient traversal algorithm

- **WHEN** traversing the graph for calculation
- **THEN** the algorithm SHALL use efficient data structures (Map/Set) for lookups
- **AND** avoid unnecessary re-traversals of already calculated branches
- **AND** use topological ordering if available to minimize passes

#### Scenario: Debounce rapid changes

- **WHEN** user rapidly adds or removes multiple nodes/edges
- **AND** performance issues are observed (future optimization if needed)
- **THEN** the system MAY debounce recalculation by 100-200ms
- **AND** ensure the final calculation runs after changes stabilize
- **AND** show loading indicator during debounce period

### Requirement: Auto-Build Integration

The production designer's auto-build feature SHALL work seamlessly with optimal production indicators to help users build balanced production chains.

#### Scenario: Display indicators on auto-built chains

- **WHEN** user uses the auto-build feature to create a production chain
- **THEN** optimal production indicators SHALL be calculated and displayed for all auto-built nodes
- **AND** indicators SHALL highlight any imbalances in the generated chain

#### Scenario: Maintain indicator state after auto-layout

- **WHEN** user applies auto-layout to organize nodes
- **THEN** optimal production calculations and indicators SHALL remain unchanged
- **AND** indicator positions SHALL adjust with node positions
- **AND** no recalculation SHALL be triggered (unless topology changed)

#### Scenario: Save and restore indicator calculations

- **WHEN** user saves a flow to a slot
- **THEN** the flow data (nodes, edges) SHALL be saved
- **AND** optimal production indicators SHALL be recalculated on restore
- **AND** indicators SHALL not be stored in saved data (derived information)

#### Scenario: Indicator visibility with flow state

- **WHEN** user restores a saved flow from a slot
- **THEN** optimal production indicators SHALL be automatically calculated and displayed
- **AND** the calculation SHALL occur after nodes and edges are fully restored
- **AND** indicators SHALL reflect the restored graph topology

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

### Requirement: Configurable Icon Node Display

The production designer SHALL allow users to toggle between icon-only and full card display for Resource and Machinery node types.

#### Scenario: Resource nodes with icon display enabled

- **WHEN** `showResourceIconNodes` setting is true (default)
- **AND** a Resource type recipe is added to the canvas
- **THEN** the node SHALL use type "resourceIconNode"
- **AND** the node SHALL render as a compact 64x64px icon with output handle only

#### Scenario: Resource nodes with icon display disabled

- **WHEN** `showResourceIconNodes` setting is false
- **AND** a Resource type recipe is added to the canvas
- **THEN** the node SHALL use type "recipeNode"
- **AND** the node SHALL render as a full card (280x200px) with all details

#### Scenario: Machinery nodes with icon display enabled

- **WHEN** `showMachineryIconNodes` setting is true (default)
- **AND** a Machinery type recipe is added to the canvas
- **THEN** the node SHALL use type "machineryIconNode"
- **AND** the node SHALL render as a compact 64x64px icon with input handles only

#### Scenario: Machinery nodes with icon display disabled

- **WHEN** `showMachineryIconNodes` setting is false
- **AND** a Machinery type recipe is added to the canvas
- **THEN** the node SHALL use type "recipeNode"
- **AND** the node SHALL render as a full card (280x200px) with all details

#### Scenario: Update existing nodes when settings change

- **WHEN** user changes icon display settings
- **THEN** all existing nodes of affected types SHALL update their type property
- **AND** nodes SHALL re-render with the new display mode
- **AND** node positions, connections, and data SHALL be preserved
- **AND** the canvas SHALL remain stable (no unwanted movement or disconnections)

### Requirement: Zoom Level Tracking

The production designer SHALL track the current zoom level and make it available for display mode decisions.

#### Scenario: Track viewport zoom

- **WHEN** user zooms in or out on the canvas
- **THEN** the system SHALL track the current zoom level using ReactFlow's useViewport hook
- **AND** the zoom level SHALL be a number where 1.0 is 100% zoom
- **AND** zoom level updates SHALL be debounced by 100ms to avoid excessive re-renders

#### Scenario: Display current zoom in settings

- **WHEN** user opens the settings dialog
- **THEN** the current zoom level SHALL be displayed in the Zoom Behavior section
- **AND** the zoom level SHALL be formatted as a percentage (e.g., "Current zoom: 75%")
- **AND** the zoom level SHALL update in real-time if the dialog remains open while zooming

### Requirement: Automatic Icon-Only Mode

The production designer SHALL automatically switch all nodes to icon-only display when zoomed out below a user-configurable threshold.

#### Scenario: Enable automatic icon-only mode

- **WHEN** `autoIconOnlyMode` setting is true
- **AND** current zoom level is less than `iconOnlyZoomThreshold`
- **THEN** all nodes SHALL display in icon-only mode regardless of their type
- **AND** the icon-only mode SHALL be indicated by an `iconOnlyMode: true` flag in node data

#### Scenario: Disable automatic icon-only mode

- **WHEN** `autoIconOnlyMode` setting is false
- **OR** current zoom level is greater than or equal to `iconOnlyZoomThreshold`
- **THEN** nodes SHALL display according to their type and icon display settings
- **AND** the `iconOnlyMode` flag SHALL be false

#### Scenario: Zoom threshold configuration

- **WHEN** user adjusts the zoom threshold slider
- **THEN** the threshold value SHALL be between 0.25 and 1.0
- **AND** the threshold SHALL be adjustable in increments of 0.05
- **AND** the default threshold SHALL be 0.75 (75% zoom)
- **AND** changes SHALL take effect immediately when saved

#### Scenario: Visual indicator for active auto mode

- **WHEN** automatic icon-only mode is active (enabled and zoom below threshold)
- **THEN** a small badge or indicator SHALL be displayed in the top-right panel
- **AND** the indicator SHALL show text like "Icon Mode" or an icon
- **AND** hovering over the indicator SHALL show a tooltip explaining the mode is active

### Requirement: Icon-Only Display for RecipeNode

The production designer SHALL render RecipeNode components in a compact icon-only mode when the `iconOnlyMode` flag is true.

#### Scenario: RecipeNode icon-only layout

- **WHEN** a RecipeNode has `iconOnlyMode: true` in its data
- **THEN** the node SHALL render as a 64x64px square container
- **AND** the node SHALL display only the recipe icon filling most of the space
- **AND** the node SHALL NOT display the card layout, name, or detailed information
- **AND** the node SHALL display a small badge in the top-right corner

#### Scenario: RecipeNode icon-only badge content

- **WHEN** a RecipeNode is in icon-only mode
- **THEN** the badge SHALL display the most relevant metric for the recipe type
- **AND** for Resource and Component nodes, the badge SHALL show outputPerMin (e.g., "200/m")
- **AND** for Machinery nodes, the badge SHALL show total consumption rate or ingredient count
- **AND** the badge SHALL use small font size (10px) to fit in the corner
- **AND** the badge SHALL have sufficient contrast for readability

#### Scenario: RecipeNode icon-only handles

- **WHEN** a RecipeNode is in icon-only mode
- **THEN** all connection handles SHALL remain in their correct positions
- **AND** input handles SHALL be on the left side, vertically distributed
- **AND** output handles SHALL be on the right side
- **AND** handles SHALL be visible and functional for creating connections
- **AND** handle styling SHALL be consistent with icon node handles

#### Scenario: RecipeNode icon-only tooltip

- **WHEN** user hovers over a RecipeNode in icon-only mode
- **THEN** a tooltip SHALL display showing full recipe details
- **AND** the tooltip SHALL include recipe name, type, output rate, and ingredients
- **AND** the tooltip SHALL appear after 500ms delay
- **AND** the tooltip SHALL provide all information that would be visible in full card mode

#### Scenario: RecipeNode icon-only interactions

- **WHEN** a RecipeNode is in icon-only mode
- **THEN** all standard node interactions SHALL work normally
- **AND** clicking the node SHALL select it
- **AND** dragging the node SHALL move it
- **AND** the NodeToolbar with Delete button SHALL appear when selected
- **AND** optimal production indicators SHALL still be displayed if applicable

### Requirement: Icon-Only Mode for Icon Nodes

The production designer SHALL enhance ResourceIconNode and MachineryIconNode components to support zoom-triggered icon-only mode.

#### Scenario: ResourceIconNode in zoom icon-only mode

- **WHEN** a ResourceIconNode has `iconOnlyMode: true` in its data
- **THEN** the node SHALL simplify its badge display
- **AND** the badge SHALL show only the numeric value without units (e.g., "200" instead of "200/m")
- **AND** the badge SHALL be smaller to reduce clutter at low zoom
- **AND** all other functionality SHALL remain the same

#### Scenario: MachineryIconNode in zoom icon-only mode

- **WHEN** a MachineryIconNode has `iconOnlyMode: true` in its data
- **THEN** the node SHALL simplify any displayed metrics
- **AND** the node SHALL maintain full functionality
- **AND** tooltips SHALL still provide complete information

### Requirement: Settings Integration with Node Creation

The production designer SHALL apply current settings when creating new nodes through all methods.

#### Scenario: Manual node creation respects settings

- **WHEN** user drags a recipe from the sidebar to the canvas
- **THEN** the system SHALL determine the node type based on current settings
- **AND** Resource recipes SHALL use resourceIconNode or recipeNode based on `showResourceIconNodes`
- **AND** Machinery recipes SHALL use machineryIconNode or recipeNode based on `showMachineryIconNodes`
- **AND** the `iconOnlyMode` flag SHALL be set based on current zoom and auto mode settings

#### Scenario: Auto-build respects settings

- **WHEN** user uses the Auto Build feature
- **THEN** all created nodes SHALL respect current icon display settings
- **AND** node types SHALL be determined the same way as manual creation
- **AND** the `iconOnlyMode` flag SHALL be set based on current zoom

#### Scenario: Restore from slot respects settings

- **WHEN** user restores a flow from a saved slot
- **THEN** node types SHALL be determined based on current settings, not saved settings
- **AND** this allows users to view the same flow with different display preferences
- **AND** connections and positions SHALL be restored exactly as saved

### Requirement: Settings Do Not Affect Saved Flows

The production designer SHALL keep settings separate from flow data to maintain flexibility and backward compatibility.

#### Scenario: Settings not saved with flow

- **WHEN** user saves a flow to a slot
- **THEN** the flow data SHALL include only nodes, edges, and viewport
- **AND** settings SHALL NOT be included in the saved flow data
- **AND** settings SHALL remain in localStorage under separate key

#### Scenario: Settings applied at render time

- **WHEN** a flow is restored from a slot
- **THEN** node types SHALL be determined at render time based on current settings
- **AND** the same flow can be viewed with different settings by different users or sessions
- **AND** no migration of saved flows is required when settings are added or changed

### Requirement: Settings Validation

The production designer SHALL validate settings values to ensure they are within acceptable ranges.

#### Scenario: Validate zoom threshold range

- **WHEN** loading settings from localStorage
- **THEN** the `iconOnlyZoomThreshold` SHALL be validated to be between 0.25 and 1.0
- **AND** if the value is outside this range, the default value 0.75 SHALL be used
- **AND** a warning SHALL be logged to the console

#### Scenario: Validate boolean settings

- **WHEN** loading settings from localStorage
- **THEN** boolean settings SHALL be validated to be true or false
- **AND** if a boolean setting is not a boolean type, the default value SHALL be used
- **AND** a warning SHALL be logged to the console

#### Scenario: Handle corrupted settings

- **WHEN** settings in localStorage are corrupted or invalid JSON
- **THEN** the system SHALL catch the parsing error
- **AND** default settings SHALL be used
- **AND** an error SHALL be logged to the console
- **AND** the corrupted settings SHALL be overwritten with defaults on next save

### Requirement: Dedicated Production Lines

The production designer SHALL support dedicated production lines for specific consumer types, ensuring each consumer gets its own complete production chain instead of sharing intermediate nodes.

#### Scenario: Enable dedicated production lines

- **WHEN** user enables "Use Dedicated Production Lines" in settings
- **THEN** auto-build SHALL create separate production chains for each consumer type that requires dedicated lines
- **AND** consumers SHALL NOT share intermediate producer nodes with other dedicated consumers
- **AND** non-dedicated consumers MAY share producer nodes

#### Scenario: Dedicated line for dependency nodes

- **WHEN** auto-build creates a node as a dependency (e.g., Heatsink for Heavy Duty Motor)
- **AND** that node type is in the dedicated consumers list
- **THEN** the node SHALL get its own dedicated production chain
- **AND** the dedicated chain SHALL NOT be shared with other consumers requiring the same material

#### Scenario: Dedicated consumers list

- **WHEN** user views dedicated production lines settings
- **THEN** toggles SHALL be available for: Gear, Bearing, Iron Plate, Heatsink, and Copper Wire
- **AND** each consumer type can be individually enabled or disabled
- **AND** the setting SHALL apply to both manually added nodes and dependency-created nodes

#### Scenario: Producer claim tracking

- **WHEN** auto-build processes nodes with dedicated lines enabled
- **THEN** the system SHALL track which producer nodes are claimed by which dedicated consumers
- **AND** a producer claimed by one dedicated consumer SHALL NOT be reused by another dedicated consumer
- **AND** producers SHALL be immediately claimed when created for dedicated consumers

#### Scenario: Mixed dedicated and shared consumers

- **WHEN** some consumers require dedicated lines and others do not
- **THEN** dedicated consumers SHALL each get separate production chains
- **AND** non-dedicated consumers MAY share production chains with each other
- **AND** non-dedicated consumers SHALL NOT reuse producers claimed by dedicated consumers

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

