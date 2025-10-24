# Update Dedicated Production Lines Consumers

## Why

The current dedicated production lines feature includes consumers that are not commonly used (`Glass Lens`, `Pipe`, `Oxygen Tank`, `Steel Cable`) while missing important intermediate components (`Gear`, `Bearing`) that are frequently used as dependencies in complex production chains. This makes the feature less useful for common scenarios like building Small Motor or Stator production lines.

## What Changes

- **MODIFIED**: Update the dedicated production lines consumer list to include only the most commonly used intermediate components: `Gear`, `Bearing`, `Iron Plate`, `Heatsink`, and `Copper Wire`
- Remove `Glass Lens`, `Pipe`, `Oxygen Tank`, and `Steel Cable` from the dedicated consumers list
- Ensure dedicated lines work correctly even when these nodes are created as dependencies (not just when manually added to canvas)

## Impact

- Affected specs: `production-designer`
- Affected code:
  - `lib/types.ts` - Update `DesignerSettings` interface
  - `lib/settings-storage.ts` - Update default settings and validation
  - `components/settings-dialog.tsx` - Update UI to show new consumer list
  - `components/production-designer-view.tsx` - Update `requiresDedicatedLine` function
