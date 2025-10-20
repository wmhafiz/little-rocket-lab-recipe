# production-designer Specification Delta

## ADDED Requirements

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
