# Zustand State Management Migration Guide

This guide explains the state management refactoring from React's built-in hooks to Zustand stores.

## Overview

The Production Designer component has been refactored from using 13+ `useState` hooks scattered throughout a 1200+ line component to using centralized Zustand stores following the slice pattern.

## What Changed

### Before (React useState)

```typescript
// Scattered state throughout component
const [searchTerm, setSearchTerm] = useState("");
const [isPanelOpen, setIsPanelOpen] = useState(true);
const [settings, setSettings] = useState<DesignerSettings>(loadSettings());
const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
// ... 10+ more useState hooks
```

### After (Zustand Stores)

```typescript
// Selective subscriptions to stores
const searchTerm = useUIStore((state) => state.searchTerm);
const setSearchTerm = useUIStore((state) => state.setSearchTerm);
const settings = useSettingsStore((state) => state.settings);
const updateSettings = useSettingsStore((state) => state.updateSettings);
```

## Store Architecture

### 1. FlowStore (`lib/stores/flow-store.ts`)

**Purpose**: Manages ReactFlow instance reference

**State**:

- `rfInstance: any | null` - ReactFlow instance for save/restore operations

**Actions**:

- `setRfInstance(instance)` - Store the ReactFlow instance
- `getRfInstance()` - Get the current instance

**Usage**:

```typescript
const rfInstance = useFlowStore((state) => state.rfInstance)
const setRfInstance = useFlowStore((state) => state.setRfInstance)

// In component
<ReactFlow onInit={setRfInstance} />
```

### 2. UIStore (`lib/stores/ui-store.ts`)

**Purpose**: Manages all UI state (panels, dialogs, search, filters)

**State**:

- `searchTerm: string` - Recipe search query
- `selectedCategory: string | null` - Selected recipe category filter
- `isPanelOpen: boolean` - Recipe panel visibility
- `showSaveAsDialog: boolean` - Save As dialog state
- `showLoadDialog: boolean` - Load dialog state
- `showSettingsDialog: boolean` - Settings dialog state
- `showMobileMenu: boolean` - Mobile menu state

**Actions**:

- `setSearchTerm(term)` - Update search term
- `setSelectedCategory(category)` - Set category filter
- `togglePanel()` - Toggle panel visibility
- `openSaveAsDialog()`, `closeSaveAsDialog()` - Dialog controls
- `openLoadDialog()`, `closeLoadDialog()` - Dialog controls
- `openSettingsDialog()`, `closeSettingsDialog()` - Dialog controls
- `openMobileMenu()`, `closeMobileMenu()` - Mobile menu controls

**Usage**:

```typescript
const searchTerm = useUIStore((state) => state.searchTerm)
const setSearchTerm = useUIStore((state) => state.setSearchTerm)
const openSaveAsDialog = useUIStore((state) => state.openSaveAsDialog)

// In component
<Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
<Button onClick={openSaveAsDialog}>Save As</Button>
```

### 3. SettingsStore (`lib/stores/settings-store.ts`)

**Purpose**: Manages designer settings with localStorage persistence

**State**:

- `settings: DesignerSettings` - All designer settings

**Actions**:

- `updateSettings(newSettings)` - Update multiple settings at once
- `resetSettings()` - Reset to defaults
- `updateShowResourceIconNodes(value)` - Individual setting updates
- `updateShowMachineryIconNodes(value)` - Individual setting updates
- `updateAutoIconOnlyMode(value)` - Individual setting updates
- `updateIconOnlyZoomThreshold(value)` - Individual setting updates
- `updateUseDedicatedProductionLines(value)` - Individual setting updates
- `updateDedicatedLineConsumer(consumer, value)` - Individual setting updates

**Persistence**: Automatically persists to `localStorage` under key `lrl-designer-settings`

**Usage**:

```typescript
const settings = useSettingsStore((state) => state.settings)
const updateSettings = useSettingsStore((state) => state.updateSettings)

// In component
<SettingsDialog
  settings={settings}
  onSave={(newSettings) => {
    updateSettings(newSettings)
    toast.success("Settings saved")
  }}
/>
```

### 4. SlotStore (`lib/stores/slot-store.ts`)

**Purpose**: Manages multi-slot save/restore system with localStorage persistence

**State**:

- `currentSlot: number` - Currently active slot (0-9)
- `slots: SlotInfo[]` - Metadata for all 10 slots

**Actions**:

- `setCurrentSlot(slotIndex)` - Switch to a different slot
- `refreshSlots()` - Reload slot metadata from localStorage
- `saveFlow(slotIndex, flowData, title, description)` - Save flow to slot
- `loadFlow(slotIndex)` - Load flow from slot (returns FlowData | null)
- `deleteSlot(slotIndex)` - Delete a slot
- `editSlotMetadata(slotIndex, title, description)` - Update slot metadata
- `migrateOldStorage()` - Migrate from old single-slot storage

**Persistence**: Automatically persists to localStorage:

- Metadata: `lrl-designer-slot-metadata`
- Flow data: `lrl-designer-slot-0` through `lrl-designer-slot-9`
- Current slot: `lrl-designer-current-slot`

**Usage**:

```typescript
const currentSlot = useSlotStore((state) => state.currentSlot);
const slots = useSlotStore((state) => state.slots);
const saveFlow = useSlotStore((state) => state.saveFlow);
const loadFlow = useSlotStore((state) => state.loadFlow);
const migrateOldStorage = useSlotStore((state) => state.migrateOldStorage);

// Initialize on mount
useEffect(() => {
  migrateOldStorage();
  refreshSlots();
}, [migrateOldStorage, refreshSlots]);

// Save
const flow = rfInstance.toObject();
saveFlow(currentSlot, flow, "My Design", "Optional description");

// Load
const flowData = loadFlow(currentSlot);
if (flowData) {
  setNodes(flowData.nodes);
  setEdges(flowData.edges);
  setViewport(flowData.viewport);
}
```

### 5. OptimalProductionStore (`lib/stores/optimal-production-store.ts`)

**Purpose**: Manages production calculations (derived state)

**State**:

- `optimalProduction: OptimalProductionMap` - Map of node IDs to production data

**Actions**:

- `setOptimalProduction(production)` - Update entire production map
- `clearOptimalProduction()` - Clear all calculations
- `getNodeProduction(nodeId)` - Get production data for specific node

**Usage**:

```typescript
const optimalProduction = useOptimalProductionStore(
  (state) => state.optimalProduction
);
const setOptimalProduction = useOptimalProductionStore(
  (state) => state.setOptimalProduction
);

// Calculate and update
useEffect(() => {
  const calculations = calculateOptimalProduction(nodes, edges, recipes);
  setOptimalProduction(calculations);
}, [nodes, edges, recipes, setOptimalProduction]);

// Access in node rendering
const nodesWithProduction = nodes.map((node) => ({
  ...node,
  data: {
    ...node.data,
    optimalProduction: optimalProduction.get(node.id),
  },
}));
```

## Migration Steps for New Features

### Adding New UI State

**Before (useState)**:

```typescript
const [myNewState, setMyNewState] = useState(false);
```

**After (Zustand)**:

1. Add to UIStore:

```typescript
// lib/stores/ui-store.ts
interface UIState {
  // ... existing state
  myNewState: boolean;
}

interface UIActions {
  // ... existing actions
  setMyNewState: (value: boolean) => void;
}

// In store implementation
export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // Initial state
      myNewState: false,

      // Actions
      setMyNewState: (value) => set({ myNewState: value }),
    }),
    { name: "UIStore" }
  )
);
```

2. Use in component:

```typescript
const myNewState = useUIStore((state) => state.myNewState);
const setMyNewState = useUIStore((state) => state.setMyNewState);
```

### Adding New Persisted Settings

1. Update SettingsStore:

```typescript
// lib/stores/settings-store.ts
const DEFAULT_SETTINGS: DesignerSettings = {
  // ... existing settings
  myNewSetting: true,
}

// Add action if needed
updateMyNewSetting: (value) =>
  set((state) => {
    state.settings.myNewSetting = value
  }),
```

2. Settings automatically persist to localStorage

### Creating a New Store

If you need an entirely new domain of state:

```typescript
// lib/stores/my-new-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MyState {
  data: string;
}

interface MyActions {
  setData: (data: string) => void;
}

type MyStore = MyState & MyActions;

export const useMyStore = create<MyStore>()(
  devtools(
    (set) => ({
      // Initial state
      data: "",

      // Actions
      setData: (data) => set({ data }),
    }),
    { name: "MyStore" }
  )
);
```

Export from `lib/stores/index.ts`:

```typescript
export { useMyStore } from "./my-new-store";
```

## Performance Tips

### Selective Subscriptions

**Bad** (subscribes to entire store):

```typescript
const store = useUIStore();
const searchTerm = store.searchTerm; // Component re-renders on ANY store change
```

**Good** (subscribes to specific value):

```typescript
const searchTerm = useUIStore((state) => state.searchTerm); // Only re-renders when searchTerm changes
```

### Actions Don't Cause Re-renders

```typescript
// These don't cause re-renders when retrieved
const setSearchTerm = useUIStore((state) => state.setSearchTerm);
const updateSettings = useSettingsStore((state) => state.updateSettings);
```

### Combining Multiple Selectors

**Option 1: Multiple hooks** (recommended for few selectors):

```typescript
const searchTerm = useUIStore((state) => state.searchTerm);
const isPanelOpen = useUIStore((state) => state.isPanelOpen);
```

**Option 2: Combined selector** (for many related values):

```typescript
const { searchTerm, isPanelOpen } = useUIStore((state) => ({
  searchTerm: state.searchTerm,
  isPanelOpen: state.isPanelOpen,
}));
```

## Debugging with DevTools

All stores have Zustand DevTools integration (development only):

1. Install Redux DevTools browser extension
2. Open browser DevTools
3. Navigate to Redux tab
4. Select store from dropdown (FlowStore, UIStore, etc.)
5. View state changes, actions, and time-travel debug

## localStorage Keys

The stores use these localStorage keys:

- `lrl-designer-settings` - Settings store state
- `lrl-designer-slot-metadata` - Slot metadata array
- `lrl-designer-slot-0` through `lrl-designer-slot-9` - Individual slot flow data
- `lrl-designer-current-slot` - Currently active slot index
- `lrl-designer-slots` (Zustand persist key) - SlotStore internal state

## Breaking Changes

### None

This refactoring maintains **100% backward compatibility**:

- ✅ All features work identically
- ✅ localStorage schema unchanged
- ✅ No API changes
- ✅ No UI/UX changes
- ✅ Automatic migration from old storage format

## Benefits Achieved

1. **Better organization**: State grouped by domain (UI, Settings, Slots, etc.)
2. **Improved performance**: Selective subscriptions prevent unnecessary re-renders
3. **Easier testing**: Store logic can be tested in isolation
4. **Better debugging**: DevTools integration for state inspection
5. **Type safety**: Full TypeScript support throughout
6. **Cleaner component**: Reduced from 1200+ lines to more manageable size
7. **Automatic persistence**: Settings and slots persist without manual localStorage calls

## Troubleshooting

### localStorage not persisting

**Issue**: Changes to settings/slots not saved across page reloads

**Solution**: Check browser console for quota exceeded errors. Clear other localStorage data if needed.

### Store not initializing on mount

**Issue**: Slot metadata not loading, migration not running

**Solution**: Ensure `useEffect` with `migrateOldStorage()` runs on component mount:

```typescript
useEffect(() => {
  migrateOldStorage();
  refreshSlots();
}, [migrateOldStorage, refreshSlots]);
```

### Component re-rendering too much

**Issue**: Component re-renders when unrelated state changes

**Solution**: Use selective subscriptions:

```typescript
// Bad - subscribes to everything
const store = useUIStore();

// Good - subscribes to specific value
const searchTerm = useUIStore((state) => state.searchTerm);
```

## Next Steps

For adding new state management:

1. Identify which store the state belongs to (UI, Settings, Slots, Flow, Production)
2. Add state and actions to appropriate store
3. Use selective subscriptions in components
4. Consider persistence needs (add persist middleware if needed)
5. Test in isolation and with DevTools

For questions or issues, refer to:

- Zustand docs: https://docs.pmnd.rs/zustand/getting-started/introduction
- Store implementations: `lib/stores/`
- Design document: `openspec/changes/refactor-state-management-zustand/design.md`
