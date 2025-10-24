# production-designer Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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

#### Scenario: Dedicated production lines section

- **WHEN** user views the Dedicated Production Lines section
- **THEN** a master toggle SHALL be displayed for "Use Dedicated Production Lines"
- **AND** individual toggles SHALL be displayed for: Gear, Bearing, Iron Plate, Heatsink, and Copper Wire
- **AND** individual toggles SHALL only be enabled when the master toggle is on
- **AND** each toggle SHALL have a descriptive label
- **AND** the section SHALL explain that dedicated lines create separate input chains for each consumer

#### Scenario: Save settings

- **WHEN** user clicks the Save button in the settings dialog
- **THEN** all settings including dedicated production lines SHALL be persisted to localStorage
- **AND** the dialog SHALL close
- **AND** node display SHALL update immediately to reflect new settings
- **AND** a toast notification SHALL confirm settings were saved

#### Scenario: Cancel settings

- **WHEN** user clicks the Cancel button or closes the settings dialog
- **THEN** no settings changes SHALL be saved
- **AND** the dialog SHALL close
- **AND** node display SHALL remain unchanged
