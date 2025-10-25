# Zustand State Management Refactoring - Design Document

## Context

The Production Designer application has grown in complexity with multiple features:

- Node-based flow diagram with ReactFlow
- Multi-slot save/restore system
- Designer settings with multiple configuration options
- Optimal production calculations
- Complex UI state (panels, dialogs, search, filters)

The current implementation uses React's built-in hooks scattered across a monolithic component, which creates maintenance and performance challenges as the application scales.

## Goals / Non-Goals

**Goals:**

- Centralize state management in well-organized, testable Zustand stores
- Improve performance through selective component re-renders
- Maintain full backward compatibility with existing localStorage data
- Preserve all current functionality without UI/UX changes
- Enable easier future feature development with shared state
- Follow Zustand and React best practices

**Non-Goals:**

- Migrate ReactFlow's internal state (nodes/edges managed by ReactFlow hooks)
- Change localStorage schema or keys
- Modify component UI or user-facing behavior
- Introduce new features (pure refactoring)
- Replace theme management (next-themes works well)

## Decisions

### 1. Store Architecture: Slice Pattern

**Decision:** Use the slice pattern to organize stores by domain concern.

**Rationale:**

- **Modularity**: Each slice is self-contained and can be developed/tested independently
- **Scalability**: Easy to add new slices as features grow
- **Type Safety**: TypeScript inference works naturally with slices
- **Best Practice**: Recommended by Zustand documentation for large applications
- **Separation of Concerns**: Clear boundaries between different state domains

**Store Slices:**

1. **FlowStore** (`lib/stores/flow-store.ts`)

   - Manages: ReactFlow instance reference, viewport utilities
   - Actions: Layout management, canvas clearing, fit view
   - Integration: Works with ReactFlow hooks (`useNodesState`, `useEdgesState`)

2. **UIStore** (`lib/stores/ui-store.ts`)

   - Manages: Search term, panel visibility, category filter, dialogs, menus
   - Actions: Toggle panels, open/close dialogs, set search/filter
   - No persistence: Session-only UI state

3. **SlotStore** (`lib/stores/slot-store.ts`)

   - Manages: Current slot, slot metadata, flow save/restore
   - Actions: Save/restore/delete slots, edit metadata, switch slots
   - Persistence: localStorage via Zustand persist middleware
   - Integration: Replaces `lib/slot-storage.ts` functions with store actions

4. **SettingsStore** (`lib/stores/settings-store.ts`)

   - Manages: All designer settings (icon modes, thresholds, production lines)
   - Actions: Update settings, reset to defaults
   - Persistence: localStorage via Zustand persist middleware
   - Integration: Replaces `lib/settings-storage.ts` functions

5. **OptimalProductionStore** (`lib/stores/optimal-production-store.ts`)
   - Manages: Production calculations map
   - Actions: Calculate optimal production, update calculations
   - Computed: Derived from nodes and edges (reactive recalculation)

**Alternatives considered:**

- **Single monolithic store**: Rejected - would still have poor separation of concerns
- **Redux Toolkit**: Rejected - more boilerplate, overkill for this app's needs
- **Jotai/Recoil**: Rejected - atomic state not ideal for our domain groupings
- **Keep useState**: Rejected - current maintenance problems would persist

### 2. ReactFlow State Management

**Decision:** Keep ReactFlow's built-in `useNodesState` and `useEdgesState` hooks in the component, only store the ReactFlow instance reference in Zustand.

**Rationale:**

- ReactFlow hooks are optimized for flow diagram performance
- Moving nodes/edges to Zustand would duplicate ReactFlow's internal state
- ReactFlow's API expects to work with its hooks directly
- Node/edge updates are frequent; external state management would add overhead
- Instance reference is needed globally for save/restore operations

**Implementation:**

```typescript
// FlowStore only stores instance reference
const useFlowStore = create<FlowStore>((set) => ({
  rfInstance: null,
  setRfInstance: (instance) => set({ rfInstance: instance }),
  // Layout and utility functions that need the instance
}));

// Component still uses ReactFlow hooks
function ProductionDesignerFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const setRfInstance = useFlowStore((state) => state.setRfInstance);
}
```

### 3. Persistence Strategy

**Decision:** Use Zustand's persist middleware for SlotStore and SettingsStore, with custom storage adapter to maintain current localStorage schema.

**Rationale:**

- **Backward Compatibility**: Custom storage adapters preserve existing keys and format
- **Built-in Middleware**: Zustand persist is battle-tested and optimized
- **Automatic Sync**: Middleware handles hydration, serialization, and sync automatically
- **Type Safety**: Fully typed with proper TypeScript support
- **Simplification**: Eliminates manual localStorage read/write functions

**Implementation:**

```typescript
// Custom storage adapter for backward compatibility
const slotStorageAdapter = {
  getItem: (name: string) => {
    // Read from multiple localStorage keys (slot-0, slot-1, etc.)
    // Return merged state
  },
  setItem: (name: string, value: string) => {
    // Parse state and write to appropriate keys
  },
  removeItem: (name: string) => {
    // Handle slot deletion
  },
};

const useSlotStore = create(
  persist(
    (set, get) => ({
      // store implementation
    }),
    {
      name: "lrl-designer-slots",
      storage: createJSONStorage(() => slotStorageAdapter),
    }
  )
);
```

### 4. Selective Subscriptions

**Decision:** Use fine-grained selectors throughout components to minimize re-renders.

**Rationale:**

- **Performance**: Components only re-render when their specific data changes
- **Best Practice**: Zustand's recommended usage pattern
- **Easy to Implement**: Selector syntax is simple and readable

**Implementation:**

```typescript
// ❌ Bad: Subscribes to entire store
const store = useUIStore();

// ✅ Good: Subscribes only to specific values
const searchTerm = useUIStore((state) => state.searchTerm);
const isPanelOpen = useUIStore((state) => state.isPanelOpen);

// ✅ Good: Subscribes to specific actions (don't cause re-renders)
const setSearchTerm = useUIStore((state) => state.setSearchTerm);
```

### 5. Middleware Stack

**Decision:** Use Immer and DevTools middleware for all stores, Persist middleware for SlotStore and SettingsStore.

**Middleware Stack:**

```typescript
// Development: DevTools + Immer + Persist (if applicable)
// Production: Immer + Persist (if applicable)

const useSlotStore = create<SlotStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // store implementation with direct mutations via Immer
      })),
      { name: "lrl-designer-slots" }
    ),
    { name: "SlotStore" }
  )
);
```

**Rationale:**

- **Immer**: Simplifies complex state updates with direct mutation syntax
- **DevTools**: Essential for debugging state changes during development
- **Persist**: Required for SlotStore and SettingsStore only
- **Order**: DevTools outermost to see persisted state in devtools

### 6. Migration Strategy

**Decision:** Refactor incrementally by store slice, maintain parallel functionality until fully migrated.

**Migration Steps:**

1. Add Zustand dependency
2. Create store files and types (parallel to existing code)
3. Test stores in isolation (unit tests)
4. Migrate component slice by slice:
   - Settings → SettingsStore
   - Slots → SlotStore
   - UI → UIStore
   - Flow utils → FlowStore
   - Production → OptimalProductionStore
5. Remove old state management code
6. Clean up storage utilities (integrate into stores)
7. Validate all features work
8. Update documentation

**Rollback Plan:**

- Each commit focuses on one store migration
- If issues arise, revert specific commits
- Old storage utilities remain until fully replaced
- localStorage keys unchanged, so data persists across rollbacks

## Risks / Trade-offs

### Risks

1. **Migration Complexity**

   - Risk: Large refactor touches critical component
   - Mitigation: Incremental migration, thorough testing, maintain parallel code during transition

2. **Bundle Size Increase**

   - Risk: Zustand adds ~3KB to bundle
   - Mitigation: Acceptable given benefits; smaller than Redux or MobX; tree-shakeable

3. **Learning Curve**

   - Risk: Team needs to learn Zustand patterns
   - Mitigation: Simple API, excellent documentation, similar to useState

4. **ReactFlow Integration**
   - Risk: Interaction between Zustand and ReactFlow hooks
   - Mitigation: Keep ReactFlow hooks as-is, minimal integration surface

### Trade-offs

**Pros:**

- ✅ Much better code organization and maintainability
- ✅ Improved performance through selective subscriptions
- ✅ State logic testable in isolation
- ✅ Better debugging with DevTools
- ✅ Foundation for advanced features (undo/redo, collaboration, etc.)
- ✅ Reduced component complexity

**Cons:**

- ❌ Additional dependency (3KB)
- ❌ Refactoring effort required
- ❌ Slight learning curve for new patterns
- ❌ More files to navigate (store files)

## Implementation Guidelines

### Store File Structure

```typescript
// lib/stores/ui-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  // State
  searchTerm: string;
  isPanelOpen: boolean;
  selectedCategory: string | null;
  showSaveAsDialog: boolean;
  showLoadDialog: boolean;
  showMobileMenu: boolean;
  showSettingsDialog: boolean;
}

interface UIActions {
  // Actions
  setSearchTerm: (term: string) => void;
  togglePanel: () => void;
  setSelectedCategory: (category: string | null) => void;
  openSaveAsDialog: () => void;
  closeSaveAsDialog: () => void;
  // ... more actions
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // Initial state
      searchTerm: "",
      isPanelOpen: true,
      selectedCategory: null,
      showSaveAsDialog: false,
      showLoadDialog: false,
      showMobileMenu: false,
      showSettingsDialog: false,

      // Actions
      setSearchTerm: (term) => set({ searchTerm: term }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      openSaveAsDialog: () => set({ showSaveAsDialog: true }),
      closeSaveAsDialog: () => set({ showSaveAsDialog: false }),
      // ... more actions
    }),
    { name: "UIStore" }
  )
);
```

### Component Usage Pattern

```typescript
function ProductionDesignerFlow({ recipes }: Props) {
  // Selective subscriptions
  const searchTerm = useUIStore((state) => state.searchTerm);
  const isPanelOpen = useUIStore((state) => state.isPanelOpen);
  const setSearchTerm = useUIStore((state) => state.setSearchTerm);
  const togglePanel = useUIStore((state) => state.togglePanel);

  // ReactFlow hooks remain
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <div>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* ... */}
    </div>
  );
}
```

### Testing Pattern

```typescript
// tests/stores/ui-store.test.ts
import { useUIStore } from "@/lib/stores/ui-store";

describe("UIStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState(useUIStore.getInitialState());
  });

  it("should set search term", () => {
    const { setSearchTerm } = useUIStore.getState();
    setSearchTerm("copper");
    expect(useUIStore.getState().searchTerm).toBe("copper");
  });

  it("should toggle panel", () => {
    const { togglePanel } = useUIStore.getState();
    expect(useUIStore.getState().isPanelOpen).toBe(true);
    togglePanel();
    expect(useUIStore.getState().isPanelOpen).toBe(false);
  });
});
```

## Migration Plan

### Phase 1: Setup (Tasks 1.1-1.3)

- Install dependencies
- Create store directory structure
- Set up type definitions

### Phase 2: Store Implementation (Tasks 2.1-2.5)

- Implement each store with tests
- Validate localStorage compatibility
- Test stores in isolation

### Phase 3: Component Migration (Tasks 3.1-3.6)

- Gradually replace hooks with store subscriptions
- Test each slice migration
- Remove parallel code

### Phase 4: Cleanup & Documentation (Tasks 4.1-4.3)

- Remove unused storage utilities
- Update documentation
- Final validation

### Rollback Strategy

- Each phase can be rolled back independently
- Old code remains until phase completion
- localStorage schema unchanged for data safety

## Open Questions

None - all architectural decisions finalized based on Zustand best practices and the application's current state management needs.
