# Production Designer Specification

## ADDED Requirements

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

## MODIFIED Requirements

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
