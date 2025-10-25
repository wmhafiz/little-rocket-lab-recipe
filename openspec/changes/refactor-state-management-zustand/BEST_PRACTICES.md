# Zustand Best Practices - Implementation Guide

This document outlines the Zustand best practices that this refactoring follows, ensuring the implementation is well-designed and easy to extend.

## 🏆 Core Best Practices

### 1. Slice Pattern for Store Organization ✅

**Why**: Recommended by Zustand for applications with multiple state domains.

**Implementation**:

```typescript
// ✅ GOOD: Separate stores by domain
lib/stores/
  ├── flow-store.ts          // Flow operations
  ├── ui-store.ts            // UI state
  ├── slot-store.ts          // Persistence
  ├── settings-store.ts      // Configuration
  └── optimal-production-store.ts  // Calculations

// ❌ BAD: Single monolithic store
lib/stores/
  └── app-store.ts  // Everything in one file
```

**Benefits**:

- Clear separation of concerns
- Independent testing per domain
- Easier to understand and maintain
- Team members can work on different slices simultaneously

---

### 2. Fine-Grained Selectors for Performance ✅

**Why**: Prevents unnecessary re-renders by subscribing only to needed state.

**Implementation**:

```typescript
// ✅ GOOD: Selective subscription
function MyComponent() {
  const searchTerm = useUIStore((state) => state.searchTerm);
  const setSearchTerm = useUIStore((state) => state.setSearchTerm);
  // Only re-renders when searchTerm changes
}

// ❌ BAD: Subscribe to entire store
function MyComponent() {
  const store = useUIStore();
  // Re-renders on ANY state change in store
}

// ✅ GOOD: Multiple fine-grained selectors
function ComplexComponent() {
  const searchTerm = useUIStore((state) => state.searchTerm);
  const isPanelOpen = useUIStore((state) => state.isPanelOpen);
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  // Only re-renders when these specific values change
}
```

**Pro Tip**: Extract actions (functions) separately from state - actions don't cause re-renders:

```typescript
const searchTerm = useUIStore((state) => state.searchTerm);
const setSearchTerm = useUIStore((state) => state.setSearchTerm);
```

---

### 3. TypeScript-First Design ✅

**Why**: Full type safety prevents bugs and improves developer experience.

**Implementation**:

```typescript
// ✅ GOOD: Separate state and actions interfaces
interface UIState {
  searchTerm: string;
  isPanelOpen: boolean;
  selectedCategory: string | null;
}

interface UIActions {
  setSearchTerm: (term: string) => void;
  togglePanel: () => void;
  setSelectedCategory: (category: string | null) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // State
      searchTerm: "",
      isPanelOpen: true,
      selectedCategory: null,

      // Actions
      setSearchTerm: (term) => set({ searchTerm: term }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
    }),
    { name: "UIStore" }
  )
);
```

**Benefits**:

- Autocomplete in IDE
- Compile-time error checking
- Clear documentation of store shape
- Easier refactoring

---

### 4. Middleware Composition ✅

**Why**: Middleware adds powerful features without cluttering store logic.

**Implementation**:

```typescript
// ✅ GOOD: Composed middleware stack
export const useSlotStore = create<SlotStore>()(
  devtools(
    // Outermost: DevTools for debugging
    persist(
      // Middle: Persistence to localStorage
      immer((set, get) => ({
        // Innermost: Immer for easy updates
        // Store implementation
      })),
      {
        name: "lrl-designer-slots",
        storage: createJSONStorage(() => customStorageAdapter),
      }
    ),
    { name: "SlotStore" }
  )
);

// Middleware order matters:
// 1. DevTools (outermost) sees all state including persisted
// 2. Persist handles localStorage sync
// 3. Immer (innermost) handles immutable updates
```

**Middleware We're Using**:

1. **DevTools** - For all stores (development only)

   ```typescript
   devtools(storeImplementation, { name: "StoreName" });
   ```

2. **Persist** - For SlotStore and SettingsStore

   ```typescript
   persist(storeImplementation, {
     name: "storage-key",
     storage: createJSONStorage(() => localStorage),
   });
   ```

3. **Immer** - For stores with nested updates
   ```typescript
   immer((set, get) => ({
     // Can use direct mutation syntax
     updateNestedValue: () =>
       set((state) => {
         state.nested.value = newValue; // Immer handles immutability
       }),
   }));
   ```

---

### 5. Custom Storage Adapters for Backward Compatibility ✅

**Why**: Maintain existing localStorage schema while using Zustand persist.

**Implementation**:

```typescript
// ✅ GOOD: Custom adapter preserves existing keys
const slotStorageAdapter: StateStorage = {
  getItem: (name) => {
    // Read from existing keys: lrl-designer-slot-0, lrl-designer-slot-1, etc.
    const slots = Array.from({ length: 10 }, (_, i) => {
      const data = localStorage.getItem(`lrl-designer-slot-${i}`);
      return data ? JSON.parse(data) : null;
    });
    return JSON.stringify({ slots, currentSlot: getCurrentActiveSlot() });
  },

  setItem: (name, value) => {
    // Write back to existing keys
    const state = JSON.parse(value);
    state.slots.forEach((slot, index) => {
      if (slot) {
        localStorage.setItem(
          `lrl-designer-slot-${index}`,
          JSON.stringify(slot)
        );
      }
    });
  },

  removeItem: (name) => {
    // Clean up all slot keys
  },
};

export const useSlotStore = create<SlotStore>()(
  persist(
    immer((set, get) => ({
      /* store */
    })),
    {
      name: "slots", // Not used with custom adapter
      storage: createJSONStorage(() => slotStorageAdapter),
    }
  )
);
```

**Benefits**:

- Zero migration needed for existing users
- Data survives refactoring
- Can gradually change schema in future

---

### 6. Computed Values with Selectors ✅

**Why**: Derive state instead of storing duplicates.

**Implementation**:

```typescript
// ✅ GOOD: Compute values in selectors
export const useUIStore = create<UIStore>((set, get) => ({
  searchTerm: "",
  selectedCategory: null,

  // Computed selector (not stored state)
  getFilteredRecipes: (recipes: Recipe[]) => {
    const { searchTerm, selectedCategory } = get();
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || recipe.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  },
}));

// Usage in component
const filteredRecipes = useUIStore((state) =>
  state.getFilteredRecipes(allRecipes)
);

// ❌ BAD: Store derived state
export const useUIStore = create<UIStore>((set) => ({
  searchTerm: "",
  selectedCategory: null,
  filteredRecipes: [], // ❌ Duplicate data

  setSearchTerm: (term) =>
    set((state) => ({
      searchTerm: term,
      filteredRecipes: state.allRecipes.filter(/* ... */), // Must update manually
    })),
}));
```

---

### 7. Actions Co-located with State ✅

**Why**: Keep related logic together for maintainability.

**Implementation**:

```typescript
// ✅ GOOD: State and actions in same store
export const useSlotStore = create<SlotStore>()(
  persist(
    immer((set, get) => ({
      // State
      currentSlot: 0,
      slots: [],

      // Actions that modify this state
      saveFlow: (data) =>
        set((state) => {
          state.slots[state.currentSlot] = data;
        }),

      switchSlot: (index) => set({ currentSlot: index }),

      deleteSlot: (index) =>
        set((state) => {
          state.slots[index] = null;
        }),
    })),
    { name: "slots" }
  )
);

// ❌ BAD: Separate state and actions
const useSlotState = create(() => ({ currentSlot: 0, slots: [] }));
const useSlotActions = create(() => ({
  saveFlow: () => {
    /* how to access state? */
  },
}));
```

---

### 8. Initialization and Migration Logic ✅

**Why**: Handle first-time users and data migrations gracefully.

**Implementation**:

```typescript
export const useSlotStore = create<SlotStore>()(
  persist(
    immer((set, get) => ({
      // Default state
      currentSlot: 0,
      slots: Array(10).fill(null),
      metadata: [],

      // Run once on initialization
      _hasHydrated: false,

      migrate: () => {
        const oldData = localStorage.getItem("lrl-designer-flow");
        if (oldData && !get()._hasHydrated) {
          // Migrate old single-slot to new multi-slot
          set((state) => {
            state.slots[0] = JSON.parse(oldData);
            state._hasHydrated = true;
          });
          localStorage.removeItem("lrl-designer-flow");
        }
      },
    })),
    {
      name: "lrl-designer-slots",
      onRehydrateStorage: () => (state) => {
        // Run after store rehydrates from localStorage
        state?.migrate();
      },
    }
  )
);
```

---

### 9. DevTools Integration ✅

**Why**: Essential for debugging complex state changes.

**Implementation**:

```typescript
// ✅ GOOD: Named stores with DevTools
export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      searchTerm: "",
      setSearchTerm: (term) =>
        set({ searchTerm: term }, false, "ui/setSearchTerm"),
      //                                                  ^^^^  ^^^^^^^^^^^^^^^^^^
      //                                                  replace?  action name
    }),
    {
      name: "UIStore", // Shows in Redux DevTools
      enabled: process.env.NODE_ENV === "development", // Dev only
    }
  )
);
```

**Action Naming Convention**:

```typescript
set({ value: newValue }, false, "storeName/actionName");
//                        ^^^^^  ^^^^^^^^^^^^^^^^^^^^^^
//                        replace  action name in DevTools
```

---

### 10. Testing Best Practices ✅

**Why**: Isolated state logic is easy to test without mounting components.

**Implementation**:

```typescript
// tests/stores/ui-store.test.ts
import { useUIStore } from "@/lib/stores/ui-store";

describe("UIStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({
      searchTerm: "",
      isPanelOpen: true,
      selectedCategory: null,
    });
  });

  it("should update search term", () => {
    const { setSearchTerm } = useUIStore.getState();

    setSearchTerm("copper");

    expect(useUIStore.getState().searchTerm).toBe("copper");
  });

  it("should toggle panel", () => {
    const { togglePanel } = useUIStore.getState();

    expect(useUIStore.getState().isPanelOpen).toBe(true);
    togglePanel();
    expect(useUIStore.getState().isPanelOpen).toBe(false);
    togglePanel();
    expect(useUIStore.getState().isPanelOpen).toBe(true);
  });

  it("should filter by category", () => {
    const { setSelectedCategory } = useUIStore.getState();

    setSelectedCategory("Machinery");

    expect(useUIStore.getState().selectedCategory).toBe("Machinery");
  });
});
```

**Testing Without React**:

```typescript
// Direct store access without hooks
const store = useUIStore.getState();
store.setSearchTerm("test");
expect(store.searchTerm).toBe("test");
```

---

## 🚫 Anti-Patterns to Avoid

### 1. Don't Subscribe to Entire Store

```typescript
// ❌ BAD
const store = useStore();

// ✅ GOOD
const value = useStore((state) => state.value);
```

### 2. Don't Create Stores Inside Components

```typescript
// ❌ BAD
function MyComponent() {
  const useLocalStore = create(...)  // New store every render!
}

// ✅ GOOD
const useLocalStore = create(...)  // At module level

function MyComponent() {
  const value = useLocalStore(state => state.value)
}
```

### 3. Don't Mutate State Directly (Without Immer)

```typescript
// ❌ BAD (without Immer middleware)
set((state) => {
  state.nested.value = newValue; // Direct mutation!
  return state;
});

// ✅ GOOD (without Immer)
set((state) => ({
  nested: {
    ...state.nested,
    value: newValue,
  },
}));

// ✅ GOOD (with Immer)
immer((set) => ({
  updateValue: () =>
    set((state) => {
      state.nested.value = newValue; // Immer handles immutability
    }),
}));
```

### 4. Don't Use Stores for Props

```typescript
// ❌ BAD: Trying to store component props
function MyComponent({ userId }) {
  const setUserId = useStore((state) => state.setUserId);
  useEffect(() => {
    setUserId(userId); // Don't do this!
  }, [userId]);
}

// ✅ GOOD: Use props directly
function MyComponent({ userId }) {
  // Use userId directly, or pass to store actions as parameters
  const loadUserData = useStore((state) => state.loadUserData);

  useEffect(() => {
    loadUserData(userId); // Pass as parameter
  }, [userId]);
}
```

### 5. Don't Over-Normalize State

```typescript
// ❌ BAD: Too normalized (overengineering)
interface Store {
  slotIds: number[];
  slotsById: Record<number, Slot>;
  slotMetadataIds: number[];
  slotMetadataById: Record<number, Metadata>;
}

// ✅ GOOD: Simple structure
interface Store {
  slots: Array<Slot | null>;
  metadata: Array<Metadata>;
  currentSlot: number;
}
```

---

## 📚 Further Reading

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
- [Slice Pattern](https://docs.pmnd.rs/zustand/guides/slices-pattern)
- [Testing Guide](https://docs.pmnd.rs/zustand/guides/testing)
- [Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [Immer Middleware](https://docs.pmnd.rs/zustand/integrations/immer-middleware)

---

## ✅ Checklist for Review

When implementing stores, ensure:

- [ ] Store uses slice pattern (one domain per store)
- [ ] TypeScript interfaces separate state from actions
- [ ] Fine-grained selectors used in components
- [ ] DevTools middleware added with descriptive name
- [ ] Persist middleware configured correctly (if needed)
- [ ] Immer middleware used for nested updates (if needed)
- [ ] Custom storage adapter maintains backward compatibility
- [ ] Actions have clear, descriptive names
- [ ] Store is tested in isolation
- [ ] No anti-patterns present

---

**This refactoring follows all Zustand best practices to ensure the code is:**

- ✅ Well-designed
- ✅ Easy to extend
- ✅ Performant
- ✅ Maintainable
- ✅ Testable
