## ADDED Requirements

### Requirement: About Menu Button

The production designer SHALL provide an About button for accessing version and release information.

#### Scenario: About button placement on desktop

- **WHEN** user views the Designer tab on desktop
- **THEN** an "About" button SHALL be visible in the top-right Panel
- **AND** the button SHALL be positioned immediately after the Settings button
- **AND** the button SHALL display an Info icon from lucide-react
- **AND** the button SHALL use variant="outline" and size="icon" styling
- **AND** clicking it SHALL open the About dialog

#### Scenario: About button placement on mobile

- **WHEN** user views the Designer tab on mobile (viewport width < 1024px)
- **THEN** an "About" button SHALL be available in the mobile hamburger menu
- **AND** the button SHALL be positioned after the Settings button
- **AND** clicking it SHALL open the About dialog

#### Scenario: About button visual consistency

- **WHEN** user views the About button
- **THEN** the button SHALL have consistent styling with the Settings and Theme Toggle buttons
- **AND** the button SHALL be easily discoverable
- **AND** the button SHALL include appropriate hover and focus states

### Requirement: About Dialog UI

The production designer SHALL provide an About dialog displaying version information, release notes, and repository link.

#### Scenario: About dialog structure

- **WHEN** user opens the About dialog
- **THEN** the dialog SHALL display a title "About Little Rocket Lab Designer"
- **AND** the dialog SHALL be organized into sections: "Version", "Release Notes", and "Links"
- **AND** the dialog SHALL include a Close button
- **AND** the dialog SHALL use shadcn/ui Dialog component

#### Scenario: Version information section

- **WHEN** user views the Version section
- **THEN** the current app version SHALL be displayed (e.g., "Version 0.1.0")
- **AND** the version number SHALL be read from package.json
- **AND** the last update date SHALL be displayed (e.g., "Last updated: October 24, 2025")
- **AND** the date SHALL reflect the most recent archived change

#### Scenario: Release notes section

- **WHEN** user views the Release Notes section
- **THEN** a list of recent features SHALL be displayed
- **AND** each feature SHALL have a user-friendly title and description
- **AND** features SHALL be listed in reverse chronological order (newest first)
- **AND** descriptions SHALL be non-technical and explain user benefits
- **AND** the section SHALL show at least the last 5 major features

#### Scenario: Links section

- **WHEN** user views the Links section
- **THEN** a "View on GitHub" button SHALL be displayed
- **AND** clicking the button SHALL open https://github.com/wmhafiz/little-rocket-lab-recipe in a new tab
- **AND** the button SHALL use target="\_blank" and rel="noopener noreferrer"
- **AND** the button SHALL display a GitHub icon or external link icon

#### Scenario: Dialog responsiveness

- **WHEN** About dialog is opened on mobile devices
- **THEN** the dialog SHALL be responsive and fit within the viewport
- **AND** content SHALL be scrollable if it exceeds viewport height
- **AND** text SHALL remain readable at mobile sizes

#### Scenario: Theme compatibility

- **WHEN** user switches between dark and light themes
- **THEN** the About dialog SHALL adapt styling appropriately
- **AND** maintain sufficient contrast for readability in both themes
- **AND** use theme-aware CSS classes for color definitions

### Requirement: Release Notes Content

The production designer SHALL maintain release notes with user-friendly descriptions of implemented features.

#### Scenario: Release note structure

- **WHEN** defining release notes in code
- **THEN** each release note SHALL have a title, date, and description
- **AND** titles SHALL be concise and feature-focused (e.g., "Multiple Save Slots")
- **AND** descriptions SHALL explain what the feature does for users
- **AND** descriptions SHALL avoid technical jargon and implementation details

#### Scenario: Release notes from archived proposals

- **WHEN** creating release note content
- **THEN** content SHALL be derived from archived OpenSpec proposals
- **AND** technical details SHALL be translated to user benefits
- **AND** descriptions SHALL focus on "what you can do" rather than "how it works"

#### Scenario: Recent features list

- **WHEN** displaying release notes
- **THEN** the following features SHALL be included:
  - Save and Restore Flow (save your production line designs)
  - Multiple Save Slots (manage up to 10 different designs)
  - Icon Nodes (compact display for resources and machinery)
  - Optimal Production Indicators (see required production rates)
  - Settings Panel (customize your workspace)
  - Node Duplication and UI Improvements (duplicate nodes, delete edges, reconnect)
  - Dedicated Production Lines (create separate chains for each consumer)

### Requirement: Version Management

The production designer SHALL read and display version information from package.json.

#### Scenario: Read version from package.json

- **WHEN** the About dialog is opened
- **THEN** the app SHALL read the version field from package.json
- **AND** display it in the format "Version X.Y.Z"
- **AND** handle missing or invalid version gracefully (default to "Unknown")

#### Scenario: Version utility function

- **WHEN** implementing version reading
- **THEN** a utility function SHALL be created in lib/version.ts
- **AND** the function SHALL export a constant or getter for the version string
- **AND** the version SHALL be available to any component that needs it

### Requirement: GitHub Repository Link

The production designer SHALL provide a direct link to the GitHub repository for user feedback and contributions.

#### Scenario: GitHub link behavior

- **WHEN** user clicks the "View on GitHub" link
- **THEN** the link SHALL open https://github.com/wmhafiz/little-rocket-lab-recipe
- **AND** the link SHALL open in a new browser tab
- **AND** the link SHALL use rel="noopener noreferrer" for security

#### Scenario: Link styling

- **WHEN** displaying the GitHub link
- **THEN** the link SHALL use Button component with appropriate variant
- **AND** the link SHALL include an icon (GitHub or ExternalLink from lucide-react)
- **AND** the link SHALL have clear hover and focus states

### Requirement: About Dialog State Management

The production designer SHALL manage About dialog open/close state consistently with other dialogs.

#### Scenario: Open About dialog

- **WHEN** user clicks the About button
- **THEN** the About dialog SHALL open
- **AND** the dialog SHALL overlay the canvas
- **AND** the dialog SHALL be centered on the screen
- **AND** canvas interactions SHALL be disabled while dialog is open

#### Scenario: Close About dialog

- **WHEN** About dialog is open
- **THEN** user SHALL be able to close it by clicking the Close button
- **OR** by clicking outside the dialog content
- **OR** by pressing the Escape key
- **AND** closing the dialog SHALL return focus to the canvas

#### Scenario: Dialog state persistence

- **WHEN** About dialog is closed
- **THEN** the dialog state SHALL not be persisted to localStorage
- **AND** the dialog SHALL always start closed when the app loads
- **AND** dialog content SHALL be fresh on each open (no stale data)
