## ADDED Requirements

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
