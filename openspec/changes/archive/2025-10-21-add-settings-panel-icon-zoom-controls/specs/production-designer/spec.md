# Production Designer Spec Delta

## ADDED Requirements

### Requirement: Settings Panel

The production designer SHALL provide a settings panel for configuring node display preferences and zoom-based behavior.

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

The production designer SHALL provide a settings dialog with intuitive controls for all configuration options.

#### Scenario: Settings dialog structure

- **WHEN** user opens the settings dialog
- **THEN** the dialog SHALL display a title "Settings"
- **AND** the dialog SHALL be organized into clear sections: "Node Display" and "Zoom Behavior"
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

The production designer SHALL persist user settings across sessions using browser localStorage.

#### Scenario: Save settings to localStorage

- **WHEN** user saves settings in the settings dialog
- **THEN** the settings SHALL be serialized to JSON
- **AND** stored in localStorage with key `lrl-designer-settings`
- **AND** the stored object SHALL contain: `showResourceIconNodes`, `showMachineryIconNodes`, `autoIconOnlyMode`, `iconOnlyZoomThreshold`

#### Scenario: Load settings on mount

- **WHEN** the production designer initializes
- **THEN** the system SHALL attempt to load settings from localStorage key `lrl-designer-settings`
- **AND** if settings exist, they SHALL be parsed and applied
- **AND** if settings do not exist, default values SHALL be used
- **AND** default values SHALL be: `showResourceIconNodes: true`, `showMachineryIconNodes: true`, `autoIconOnlyMode: false`, `iconOnlyZoomThreshold: 0.75`

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

## MODIFIED Requirements

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
