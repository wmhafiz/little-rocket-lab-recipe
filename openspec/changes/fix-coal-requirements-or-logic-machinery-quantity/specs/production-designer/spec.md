# production-designer Specification Delta

## ADDED Requirements

### Requirement: Fuel Requirements in Recipes

The production designer SHALL support fuel/coal requirements in recipes, treating fuel as a regular ingredient that must be supplied for production.

#### Scenario: Coal requirement in smelting recipes

- **WHEN** a smelting recipe (Copper Bar, Iron Bar) is defined in the recipe data
- **THEN** the recipe SHALL include coal as an ingredient with quantity "1" and quantityPerMin "1"
- **AND** coal SHALL be treated as a regular ingredient in all calculations and visualizations
- **AND** coal SHALL appear in the ingredient list and require a connection in the production graph

#### Scenario: Fuel consumption in production calculations

- **WHEN** calculating optimal production requirements for a smelting recipe
- **THEN** the system SHALL include coal consumption in the backward propagation
- **AND** coal requirements SHALL be aggregated across all consumers that need fuel
- **AND** the coal resource node SHALL display the total coal required per minute

#### Scenario: Fuel connection validation

- **WHEN** user connects a coal resource node to a smelting recipe node
- **THEN** the connection SHALL be validated using the same rules as other ingredients
- **AND** the connection SHALL be accepted if coal is listed in the recipe's ingredients

### Requirement: E-Waste Unified Resource

The production designer SHALL provide a unified E-Waste resource that represents both Computer Tower and Computer Monitor, displaying both icons in the node.

#### Scenario: E-Waste as single resource

- **WHEN** the E-Waste resource is defined in recipe data
- **THEN** it SHALL be a Resource type with no ingredients (raw material)
- **AND** Computer Tower and Computer Monitor SHALL NOT exist as separate resources
- **AND** E-Waste SHALL be used as an ingredient in Plastic Scraps recipe

#### Scenario: E-Waste dual-icon display in ResourceIconNode

- **WHEN** an E-Waste resource node is displayed as a ResourceIconNode
- **THEN** the node SHALL display both Computer Tower and Computer Monitor icons side-by-side
- **AND** Computer Tower icon SHALL appear on the left half of the node
- **AND** Computer Monitor icon SHALL appear on the right half of the node
- **AND** both icons SHALL be visible at all zoom levels

#### Scenario: E-Waste dual-icon display in RecipeNode icon-only mode

- **WHEN** an E-Waste resource is displayed in RecipeNode icon-only mode (zoomed out)
- **THEN** the node SHALL display both Computer Tower and Computer Monitor icons side-by-side
- **AND** the dual-icon display SHALL match the ResourceIconNode layout
- **AND** both icons SHALL be clearly visible in the 64x64px node

#### Scenario: E-Waste dual-icon display in RecipeNode card mode

- **WHEN** an E-Waste resource is displayed in RecipeNode full card mode
- **THEN** the card header icon SHALL display both Computer Tower and Computer Monitor icons
- **AND** both icons SHALL be split 50/50 in the 40x40px icon area
- **AND** the dual-icon display SHALL maintain consistency with icon-only modes

#### Scenario: E-Waste tooltip

- **WHEN** user hovers over an E-Waste node
- **THEN** the tooltip SHALL display "E-Waste"
- **AND** the tooltip SHALL include text "(Computer Tower + Computer Monitor)"
- **AND** the tooltip SHALL indicate it represents both items

### Requirement: Machinery Node Quantity Display

The production designer SHALL display quantity requirements on Machinery icon nodes to indicate how many machines are needed to meet production demands.

#### Scenario: Quantity badge on machinery node

- **WHEN** a machinery icon node is connected to upstream producers
- **AND** optimal production calculations determine a required consumption rate
- **THEN** the machinery node SHALL display a badge in the top-right corner
- **AND** the badge SHALL show the number of machines needed (calculated as ceil(requiredPerMin / consumptionRate))
- **AND** the badge SHALL use color-coding to indicate status (optimal=green, deficit=red, excess=yellow)

#### Scenario: Machinery node badge tooltip

- **WHEN** user hovers over the quantity badge on a machinery node
- **THEN** a tooltip SHALL display showing:
  - Required consumption rate per minute
  - Actual consumption rate per machine
  - Number of machines needed
  - List of upstream producers supplying this machine
- **AND** the tooltip SHALL use the same format as resource node tooltips

#### Scenario: Machinery node without connections

- **WHEN** a machinery icon node has no incoming connections
- **THEN** the node SHALL NOT display a quantity badge
- **AND** the node SHALL display only the machinery icon

#### Scenario: Machinery node badge consistency

- **WHEN** comparing machinery node badges to resource node badges
- **THEN** both SHALL use the same visual design (size, position, colors)
- **AND** both SHALL use the same status calculation logic
- **AND** both SHALL use the same tooltip format and styling

## MODIFIED Requirements

### Requirement: Machinery Icon-Only Node Display

The production designer SHALL display Machinery type nodes as compact icon-only nodes with input-only capability and quantity indicators.

#### Scenario: Machinery node visual display

- **WHEN** a machinery node (any recipe with type "Machinery") is added to the canvas
- **THEN** the node SHALL be displayed as a compact icon (64x64px) showing only the machinery icon
- **AND** the node SHALL display input handles on the left side for each ingredient
- **AND** the node SHALL NOT display an output handle
- **AND** the node SHALL NOT display a full card with output details
- **AND** when connected, the node SHALL display a quantity badge in the top-right corner

#### Scenario: Machinery node tooltip

- **WHEN** user hovers over a machinery icon node
- **THEN** a tooltip SHALL display showing the machinery name
- **AND** the tooltip SHALL show the required inputs if space permits
- **AND** if the node has a quantity badge, the tooltip SHALL show production requirement details

#### Scenario: Machinery node input connections

- **WHEN** user connects to a machinery node's input handle
- **THEN** the connection SHALL behave identically to standard recipe node connections
- **AND** ingredient validation SHALL work the same as full card nodes
- **AND** the quantity badge SHALL update to reflect the new production requirements

#### Scenario: Machinery node sizing

- **WHEN** a machinery node has multiple ingredients
- **THEN** the node icon size SHALL remain fixed at 64x64px
- **AND** input handles SHALL be vertically distributed along the left edge of the node
- **AND** handle spacing SHALL be calculated as: nodeHeight / (numberOfIngredients + 1)
- **AND** the quantity badge SHALL not affect node sizing

## REMOVED Requirements

### Requirement: Alternative Ingredients (OR Logic)

**Reason**: Simplified to E-Waste unified resource approach instead of implementing OR logic

**Migration**: E-Waste resource replaces the need for OR logic between Computer Tower and Computer Monitor
