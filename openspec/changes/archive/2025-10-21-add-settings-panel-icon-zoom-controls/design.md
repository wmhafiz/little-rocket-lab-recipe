# Design Document: Settings Panel with Icon Node and Zoom Controls

## Context

The production designer currently has fixed display behavior for different node types:

- Resource and Machinery nodes always render as compact 64x64px icons
- Component and Material nodes always render as full cards (280x200px)
- No user control over display preferences
- Large production trees become cluttered when zoomed out

Users need flexibility to:

1. Choose between icon-only and full card display for Resource/Machinery nodes
2. Automatically simplify all nodes to icon-only when zoomed out for better overview
3. Configure the zoom threshold that triggers automatic icon-only mode

## Goals / Non-Goals

**Goals:**

- Provide user control over node display modes via a settings panel
- Enable automatic icon-only display at configurable zoom levels
- Persist user preferences across sessions
- Maintain backward compatibility with existing saved flows
- Keep all node functionality (connections, tooltips, deletion) working in all display modes

**Non-Goals:**

- Changing the underlying node data structure or connection logic
- Adding settings for other aspects (colors, sizes, etc.) in this change
- Creating per-node display overrides (settings apply globally)
- Modifying the auto-layout algorithm

## Decisions

### 1. Settings Storage Strategy

**Decision:** Use localStorage with key `lrl-designer-settings` to store a JSON object.

**Structure:**

```typescript
interface DesignerSettings {
  showResourceIconNodes: boolean; // default: true
  showMachineryIconNodes: boolean; // default: true
  autoIconOnlyMode: boolean; // default: false
  iconOnlyZoomThreshold: number; // default: 0.75 (range: 0.25-1.0)
}
```

**Rationale:**

- Consistent with existing slot storage pattern (`lrl-designer-slot-*`)
- Simple to implement and debug
- No backend required
- Easy to migrate or extend in the future

**Alternatives considered:**

- URL query parameters: Would enable sharing settings, but adds complexity and isn't needed for this use case
- Context API: Overkill for simple settings; localStorage is sufficient

### 2. Node Type Switching Mechanism

**Decision:** Dynamically change the `type` property of nodes when settings change, triggering ReactFlow to re-render with the appropriate component.

**Implementation:**

```typescript
// Determine node type based on recipe type and settings
function getNodeType(
  recipe: CraftRecipe,
  settings: DesignerSettings,
  iconOnlyMode: boolean
): string {
  if (iconOnlyMode) {
    // When zoom-triggered icon-only mode is active, use icon node types for all
    if (recipe.type === "Resource") return "resourceIconNode";
    if (recipe.type === "Machinery") return "machineryIconNode";
    // For Component/Material, we'll use a special icon-only mode flag in data
    return "recipeNode";
  }

  // Normal mode: respect settings
  if (recipe.type === "Resource") {
    return settings.showResourceIconNodes ? "resourceIconNode" : "recipeNode";
  }
  if (recipe.type === "Machinery") {
    return settings.showMachineryIconNodes ? "machineryIconNode" : "recipeNode";
  }
  return "recipeNode";
}
```

**Rationale:**

- Leverages ReactFlow's built-in node type system
- Clean separation of concerns (each component handles its own rendering)
- No need to modify connection logic
- Handles remain in correct positions because ReactFlow manages them

**Alternatives considered:**

- Single node component with conditional rendering: Would make the component too complex and harder to maintain
- Separate components for each mode: Would duplicate code unnecessarily

### 3. Zoom-Based Icon-Only Mode

**Decision:** Use ReactFlow's `useViewport` hook to track zoom level and pass an `iconOnlyMode` flag to all nodes via their data property.

**Implementation:**

```typescript
// In ProductionDesignerFlow component
const viewport = useViewport();
const iconOnlyMode =
  settings.autoIconOnlyMode && viewport.zoom < settings.iconOnlyZoomThreshold;

// When creating/updating nodes
const nodeData: RecipeNodeData = {
  recipe,
  onDelete: handleDelete,
  optimalProduction: optimalProduction.get(nodeId),
  iconOnlyMode, // Add this flag
};
```

**Rationale:**

- Reactive: Nodes automatically update when zoom changes
- Performance: Only re-renders nodes when zoom crosses threshold
- Flexible: Easy to add more zoom-based behaviors in the future
- User control: Threshold is configurable via settings

**Alternatives considered:**

- CSS-based scaling: Would not allow changing node content, only size
- Viewport-based queries in each node: Would duplicate logic and be harder to maintain

### 4. Icon-Only Display for RecipeNode

**Decision:** Add conditional rendering to RecipeNode component based on `iconOnlyMode` flag.

**Layout in icon-only mode:**

```
┌─────────────┐
│   [Icon]    │  64x64px container
│             │  Icon fills most of space
│         [#] │  Small badge in corner
└─────────────┘
```

**Badge content:**

- Resource nodes: Output rate (e.g., "200/m")
- Machinery nodes: Total consumption or ingredient count
- Component/Material nodes: Output rate

**Rationale:**

- Maintains consistency with existing ResourceIconNode and MachineryIconNode
- Badge provides critical info at a glance
- Tooltip still available for full details
- Handles remain functional for connections

**Alternatives considered:**

- No badge: Too minimal, users lose important context
- Multiple badges: Too cluttered at small size
- Text overlay on icon: Reduces icon visibility

### 5. Settings Dialog UI

**Decision:** Use shadcn/ui Dialog with clear sections for each setting type.

**Layout:**

```
Settings
├─ Node Display
│  ├─ [Toggle] Show Resource nodes as icons
│  └─ [Toggle] Show Machinery nodes as icons
└─ Zoom Behavior
   ├─ [Toggle] Auto icon-only mode when zoomed out
   ├─ [Slider] Zoom threshold: 0.75
   └─ Current zoom: 1.0
```

**Rationale:**

- Familiar pattern (similar to other settings dialogs)
- Clear grouping of related settings
- Immediate feedback (current zoom level shown)
- Slider provides visual indication of threshold range

**Alternatives considered:**

- Separate dialogs for each setting type: Too fragmented
- Inline settings in panel: Takes up too much space
- Dropdown menu: Less discoverable and harder to use

### 6. Settings Button Placement

**Decision:** Place Settings button immediately after Theme Toggle in the top-right panel.

**Desktop:** `[...other buttons] [Theme Toggle] [Settings]`
**Mobile:** Settings button in the mobile menu, after theme toggle

**Rationale:**

- Settings and theme are both "meta" controls (affect display, not content)
- Logical grouping improves discoverability
- Consistent with common UI patterns (settings often near theme controls)
- Doesn't disrupt existing button order

**Alternatives considered:**

- Before theme toggle: Less intuitive (theme is more commonly used)
- In a separate menu: Adds unnecessary nesting
- Floating button: Would obstruct canvas

## Risks / Trade-offs

### Risk: Performance with frequent zoom changes

**Mitigation:**

- Debounce zoom level updates (100ms) to avoid excessive re-renders
- Only update nodes when zoom crosses threshold, not on every zoom change
- Use React.memo for node components to prevent unnecessary re-renders

### Risk: Confusion when settings change node appearance

**Mitigation:**

- Clear labels and descriptions in settings dialog
- Show current zoom level so users understand when auto mode triggers
- Preserve all node functionality (connections, tooltips) in all modes
- Settings persist, so behavior is consistent across sessions

### Risk: Breaking existing saved flows

**Mitigation:**

- Settings are separate from flow data (not saved with slots)
- Node type determination happens at render time based on current settings
- Saved flows only store recipe data, not display preferences
- Migration logic provides sensible defaults for existing users

### Trade-off: Icon-only mode loses detail

**Acceptance:**

- This is intentional and user-controlled
- Tooltips provide full details on hover
- Users can zoom in or disable the feature if they prefer detail
- Badge shows most critical metric

### Trade-off: Settings add complexity to node rendering

**Acceptance:**

- Complexity is well-contained in node type determination logic
- Each component remains simple and focused
- Benefits (user control, better zoom experience) outweigh the cost
- Code is maintainable and testable

## Migration Plan

### Phase 1: Add settings infrastructure (non-breaking)

1. Create settings storage utilities
2. Add settings state to ProductionDesignerFlow
3. Load settings on mount with sensible defaults
4. No visual changes yet

### Phase 2: Add settings dialog (non-breaking)

1. Create SettingsDialog component
2. Add Settings button to panel and mobile menu
3. Wire up dialog to settings state
4. Settings changes don't affect display yet (safe to test)

### Phase 3: Implement node type switching (breaking for users who change settings)

1. Update node type determination logic
2. Apply settings to new nodes
3. Add logic to update existing nodes when settings change
4. Test thoroughly with various node combinations

### Phase 4: Implement zoom-based icon-only mode (additive)

1. Add zoom tracking
2. Implement icon-only mode in RecipeNode
3. Pass iconOnlyMode flag to all nodes
4. Test zoom threshold behavior

### Rollback Plan

If issues arise:

1. Settings dialog can be hidden by removing the button
2. Default settings maintain current behavior (icon nodes enabled, auto mode disabled)
3. No data loss risk (settings don't affect saved flows)
4. Can revert to previous version without data migration

## Open Questions

1. **Should zoom threshold be per-user or per-flow?**

   - Decision: Per-user (simpler, more intuitive)
   - Rationale: Users likely have consistent preferences across all flows

2. **Should we show a visual indicator when auto icon-only mode is active?**

   - Decision: Yes, show a small badge or indicator in the panel
   - Rationale: Helps users understand why nodes look different

3. **Should icon-only mode affect the minimap?**

   - Decision: No, minimap already shows simplified view
   - Rationale: Minimap is already optimized for overview

4. **Should we allow per-node overrides of display mode?**
   - Decision: Not in this change (could be future enhancement)
   - Rationale: Adds significant complexity; global settings are sufficient for MVP
