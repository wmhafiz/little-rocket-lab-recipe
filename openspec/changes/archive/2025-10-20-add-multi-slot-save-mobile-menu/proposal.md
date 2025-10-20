# Add Multiple Save Slots and Mobile Responsive Menu

## Why

Users currently can only save a single production line design, which limits their ability to work on multiple designs or experiment with variations. Additionally, the top-right control panel is not optimized for mobile/tablet devices with smaller screens, making it difficult to access all features on responsive layouts.

Adding multiple save slots with titles and descriptions will allow users to manage multiple production line designs, while a hamburger menu will improve mobile usability.

## What Changes

- Add multiple save slot functionality with up to 10 named slots
- Each slot can store a title (required) and optional description
- Add "Save As" button beside the existing "Save" button to save to a new or different slot
- Add "Load" (different slot) button beside the existing "Restore" (current slot) button
- Add ability to **delete** slots with confirmation dialog
- Add ability to **edit** slot titles and descriptions without changing flow data
- Introduce a hamburger menu for mobile/responsive view that contains all control buttons
- Current "Save" button now saves to the current active slot (quick save)
- Current "Restore" button now restores from the current active slot (quick restore)
- Store slot data in localStorage with keys like `lrl-designer-slot-0`, `lrl-designer-slot-1`, etc.
- Store slot metadata (titles, descriptions, last modified) in `lrl-designer-slot-metadata`
- Add dialog/modal UI for selecting slots when using "Save As" and "Load"
- Add Edit and Delete action buttons for each occupied slot in the Load dialog

## Impact

### Affected Specs

- `production-designer` (modified - extends existing save/restore functionality)

### Affected Code

- `components/production-designer-view.tsx`

  - Modify `onSave` to save to current active slot
  - Modify `onRestore` to restore from current active slot
  - Add `onSaveAs` handler with slot selection dialog
  - Add `onLoad` handler with slot selection dialog
  - Add slot management state and localStorage operations
  - Add `onDeleteSlot` handler with confirmation dialog
  - Add `onEditSlotMetadata` handler with edit dialog
  - Add hamburger menu component for mobile view
  - Add responsive CSS to hide/show buttons based on screen size
  - Import new icons: `Menu`, `FolderPlus`, `Files`, `Pencil`, `Trash` from lucide-react

- New components (potentially):
  - `components/slot-selector-dialog.tsx` - Dialog for selecting save slots
  - `components/mobile-menu-sheet.tsx` - Sheet component for mobile menu

### User Experience Changes

- Users can now manage up to 10 different production line designs
- Each design can have a meaningful title and description
- Quick save/restore for the current working slot
- Explicit "Save As" and "Load" for managing multiple slots
- Better mobile experience with hamburger menu
- **BREAKING**: The current single `lrl-designer-flow` key will be migrated to slot-based storage on first load
- No data loss - existing saved flow will be moved to slot 0 with title "Default Design"

### Migration Strategy

On first load with new version:

1. Check if old `lrl-designer-flow` key exists
2. If yes, migrate it to `lrl-designer-slot-0`
3. Create metadata entry with title "Default Design" and current timestamp
4. Set slot 0 as current active slot
5. Remove old `lrl-designer-flow` key
