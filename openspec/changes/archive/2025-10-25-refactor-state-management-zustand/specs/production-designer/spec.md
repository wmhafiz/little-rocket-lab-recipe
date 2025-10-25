## ADDED Requirements

### Requirement: Zustand State Management Architecture

The production designer SHALL use Zustand stores organized in a slice pattern to manage application state, replacing component-local useState hooks.

#### Scenario: Store slice organization

- **WHEN** developers need to access or modify application state
- **THEN** state SHALL be organized into domain-specific stores: FlowStore, UIStore, SlotStore, SettingsStore, and OptimalProductionStore
- **AND** each store SHALL have a clearly defined interface separating state from actions

#### Scenario: Selective component subscriptions

- **WHEN** components need to access specific state values
- **THEN** components SHALL use fine-grained selectors to subscribe only to required state
- **AND** components SHALL NOT re-render when unrelated state changes
- **AND** selector syntax SHALL be: `const value = useStore(state => state.value)`

#### Scenario: TypeScript type safety

- **WHEN** developers interact with stores
- **THEN** all store state and actions SHALL be fully typed with TypeScript
- **AND** TypeScript SHALL provide autocomplete and type checking for all store operations

### Requirement: Flow Store

The production designer SHALL provide a FlowStore for managing ReactFlow instance and flow utilities.

#### Scenario: ReactFlow instance management

- **WHEN** ReactFlow initializes
- **THEN** the instance reference SHALL be stored in FlowStore via `setRfInstance` action
- **AND** the instance SHALL be accessible to any component needing flow operations

#### Scenario: Layout operations

- **WHEN** user triggers auto-layout (horizontal or vertical)
- **THEN** FlowStore SHALL provide layout action that uses ELK algorithm
- **AND** the action SHALL update nodes with calculated positions

#### Scenario: Clear canvas operation

- **WHEN** user clears the canvas
- **THEN** FlowStore SHALL provide `clearCanvas` action
- **AND** the action SHALL reset nodes and edges to empty arrays

### Requirement: UI Store

The production designer SHALL provide a UIStore for managing all UI-related state.

#### Scenario: Search and filter state

- **WHEN** user enters search term or selects category filter
- **THEN** UIStore SHALL store `searchTerm` and `selectedCategory` state
- **AND** actions SHALL be provided: `setSearchTerm`, `setSelectedCategory`
- **AND** state SHALL be session-only (no persistence)

#### Scenario: Panel and dialog visibility

- **WHEN** user interacts with panels or dialogs
- **THEN** UIStore SHALL store visibility state for: side panel, save-as dialog, load dialog, settings dialog, mobile menu
- **AND** toggle/open/close actions SHALL be provided for each UI element
- **AND** state SHALL reset on page reload (session-only)

### Requirement: Slot Store with Persistence

The production designer SHALL provide a SlotStore for managing multi-slot save/restore system with automatic localStorage persistence.

#### Scenario: Slot state persistence

- **WHEN** user saves a flow to a slot
- **THEN** SlotStore SHALL automatically persist to localStorage via Zustand persist middleware
- **AND** the localStorage key format SHALL remain compatible with existing schema (`lrl-designer-slot-{N}`)

#### Scenario: Save flow to slot

- **WHEN** user saves current flow to a slot with title and description
- **THEN** SlotStore `saveFlow` action SHALL serialize nodes, edges, and viewport
- **AND** slot metadata SHALL be updated with title, description, and timestamp
- **AND** the slot SHALL be marked as non-empty
- **AND** the data SHALL persist across page reloads

#### Scenario: Restore flow from slot

- **WHEN** user restores flow from a slot
- **THEN** SlotStore `restoreFlow` action SHALL deserialize saved data
- **AND** nodes, edges, and viewport SHALL be returned for component to apply
- **AND** current active slot SHALL be updated

#### Scenario: Slot metadata management

- **WHEN** user edits slot metadata or deletes a slot
- **THEN** SlotStore SHALL provide `editSlotMetadata` and `deleteSlot` actions
- **AND** metadata array SHALL be updated automatically
- **AND** changes SHALL persist to localStorage

#### Scenario: Old storage migration

- **WHEN** user first loads app with old storage format
- **THEN** SlotStore initialization SHALL run migration automatically
- **AND** old `lrl-designer-flow` data SHALL be moved to slot 0
- **AND** metadata SHALL be created for all slots
- **AND** old key SHALL be removed from localStorage

### Requirement: Settings Store with Persistence

The production designer SHALL provide a SettingsStore for managing designer settings with automatic localStorage persistence.

#### Scenario: Settings state persistence

- **WHEN** user modifies any setting
- **THEN** SettingsStore SHALL automatically persist to localStorage
- **AND** the localStorage key SHALL be `lrl-designer-settings` (existing key)

#### Scenario: Update settings

- **WHEN** user changes a setting via settings dialog
- **THEN** SettingsStore action SHALL update the specific setting
- **AND** Immer middleware SHALL handle immutable updates for nested state
- **AND** change SHALL persist automatically

#### Scenario: Settings restoration on load

- **WHEN** page loads
- **THEN** SettingsStore SHALL hydrate from localStorage automatically
- **AND** if no saved settings exist, default settings SHALL be used
- **AND** invalid settings SHALL be validated and fixed

#### Scenario: Reset to defaults

- **WHEN** user resets settings to defaults
- **THEN** SettingsStore `resetToDefaults` action SHALL restore all default values
- **AND** change SHALL persist to localStorage

### Requirement: Optimal Production Store

The production designer SHALL provide an OptimalProductionStore for managing production calculations.

#### Scenario: Production calculations

- **WHEN** nodes or edges change in the flow diagram
- **THEN** OptimalProductionStore SHALL recalculate production requirements
- **AND** calculations SHALL use `calculateOptimalProduction` utility
- **AND** results SHALL be stored as Map<string, OptimalProductionData>

#### Scenario: Node production data access

- **WHEN** recipe nodes render
- **THEN** nodes SHALL read optimal production data from OptimalProductionStore
- **AND** production indicators SHALL display current status (optimal, excess, deficit, etc.)

### Requirement: Store Middleware Configuration

The production designer SHALL use Zustand middleware to enhance store functionality.

#### Scenario: DevTools middleware

- **WHEN** application runs in development mode
- **THEN** all stores SHALL include DevTools middleware
- **AND** state changes SHALL be visible in Redux DevTools extension
- **AND** each store SHALL have a descriptive name in DevTools

#### Scenario: Persist middleware

- **WHEN** SlotStore or SettingsStore state changes
- **THEN** Persist middleware SHALL automatically save to localStorage
- **AND** custom storage adapters SHALL maintain backward compatibility
- **AND** hydration SHALL occur automatically on page load

#### Scenario: Immer middleware

- **WHEN** stores update nested state (e.g., SettingsStore with nested dedicatedLineConsumers)
- **THEN** Immer middleware SHALL allow direct mutation syntax
- **AND** middleware SHALL produce immutable state updates
- **AND** code SHALL be simpler and more readable

## MODIFIED Requirements

### Requirement: Flow State Persistence

The production designer SHALL provide the ability to save and restore the complete flow state including nodes, edges, and viewport configuration using a slot-based system managed by Zustand SlotStore.

#### Scenario: Save current flow

- **WHEN** user clicks the "Save" button in the top-right panel
- **THEN** SlotStore `saveFlow` action SHALL be called with current flow data
- **AND** the current flow state (all nodes, edges, and viewport position/zoom) SHALL be serialized and stored via Zustand persist middleware
- **AND** localStorage key SHALL be `lrl-designer-slot-{N}` where N is the current active slot index
- **AND** the slot metadata SHALL be updated with current timestamp

#### Scenario: Restore saved flow

- **WHEN** user clicks the "Restore" button in the top-right panel
- **AND** the current active slot has saved flow data
- **THEN** SlotStore `restoreFlow` action SHALL be called
- **AND** the saved nodes SHALL be restored to the canvas
- **AND** the saved edges SHALL be restored to the canvas
- **AND** the viewport SHALL be restored to the saved position and zoom level

#### Scenario: Restore with no saved flow

- **WHEN** user clicks the "Restore" button in the top-right panel
- **AND** the current active slot is empty
- **THEN** SlotStore SHALL return null (graceful no-op)
- **AND** no action SHALL be taken by the component

#### Scenario: Flow state includes viewport

- **WHEN** a flow is saved to any slot
- **THEN** the viewport x position, y position, and zoom level SHALL be included in the serialized state
- **AND** these viewport properties SHALL be restored when the flow is loaded
- **AND** SlotStore persist middleware SHALL handle serialization automatically

### Requirement: Designer Settings Persistence

The production designer SHALL persist user settings (icon node modes, zoom thresholds, dedicated production lines) using SettingsStore with automatic localStorage synchronization.

#### Scenario: Settings load on mount

- **WHEN** the production designer component mounts
- **THEN** SettingsStore SHALL automatically hydrate from localStorage via persist middleware
- **AND** if localStorage key `lrl-designer-settings` exists, settings SHALL be restored
- **AND** if no saved settings exist, default settings SHALL be used

#### Scenario: Settings auto-save

- **WHEN** user changes any setting via the settings dialog
- **THEN** SettingsStore action SHALL update the setting
- **AND** persist middleware SHALL automatically save to localStorage
- **AND** no manual `saveSettings()` call SHALL be required

#### Scenario: Settings validation

- **WHEN** settings are loaded from localStorage
- **THEN** SettingsStore SHALL validate all setting values
- **AND** invalid values SHALL be replaced with defaults
- **AND** validated settings SHALL be persisted back to localStorage

## REMOVED Requirements

None. All existing functionality is preserved during this refactoring.
