# Implementation Tasks

## 1. Update Type Definitions

- [x] 1.1 Update `DesignerSettings` interface in `lib/types.ts` to include `gear` and `bearing`, remove `glassLens`, `pipe`, `oxygenTank`, `steelCable`

## 2. Update Settings Storage

- [x] 2.1 Update `DEFAULT_SETTINGS` in `lib/settings-storage.ts` with new consumer list
- [x] 2.2 Update `validateSettings` function to validate new consumers

## 3. Update Settings UI

- [x] 3.1 Update `settings-dialog.tsx` to display new consumer toggles in order: Gear, Bearing, Iron Plate, Heatsink, Copper Wire

## 4. Update Auto-Build Logic

- [x] 4.1 Update `requiresDedicatedLine` function in `production-designer-view.tsx` to check for new consumers
- [x] 4.2 Verify dedicated lines work for nodes created as dependencies (already implemented in previous fix)

## 5. Testing

- [x] 5.1 Test with `Item Buffer` and `Loader` - verify `Bearing` and `Gear` get dedicated lines when created as dependencies
- [x] 5.2 Verify settings persist correctly in localStorage
- [x] 5.3 Verify UI toggles work correctly

## 6. Documentation

- [x] 6.1 Update spec with MODIFIED requirement for dedicated production lines consumers
