# Zustand State Management Refactoring - Change Proposal

## 📋 Overview

This change proposal refactors the Little Rocket Lab Designer's state management from scattered React hooks to a centralized, modular Zustand store architecture following the slice pattern.

## 🎯 Goals

- **Improve Maintainability**: Centralize state logic in well-organized stores
- **Enhance Performance**: Use selective subscriptions to minimize re-renders
- **Enable Testing**: Make state logic testable in isolation
- **Reduce Complexity**: Simplify the main component from 1200+ lines to ~400 lines
- **Preserve Compatibility**: Maintain all existing functionality and localStorage format

## 📚 Documentation Files

- **`proposal.md`** - High-level overview of why, what, and impact
- **`design.md`** - Detailed technical decisions, architecture, patterns, and trade-offs
- **`tasks.md`** - Comprehensive implementation checklist (93 tasks across 7 phases)
- **`specs/production-designer/spec.md`** - Specification deltas (ADDED/MODIFIED requirements)

## 🏗️ Store Architecture

### Store Slices (by domain)

1. **FlowStore** - ReactFlow instance and utilities

   - Layout operations (horizontal/vertical)
   - Clear canvas
   - Viewport management

2. **UIStore** - User interface state

   - Search and filters
   - Panel visibility
   - Dialog states
   - Mobile menu

3. **SlotStore** - Multi-slot save/restore system

   - Save/restore flows
   - Slot metadata management
   - Migration from old storage
   - **Persistence**: localStorage (backward compatible)

4. **SettingsStore** - Designer settings

   - Icon node modes
   - Zoom thresholds
   - Dedicated production lines
   - **Persistence**: localStorage

5. **OptimalProductionStore** - Production calculations
   - Calculate optimal production
   - Store production requirements
   - Update on flow changes

### Middleware Stack

- **Persist**: SlotStore, SettingsStore (localStorage with custom adapters)
- **Immer**: All stores with nested updates (especially SettingsStore)
- **DevTools**: All stores (development only)

## 🔑 Key Technical Decisions

### ✅ What We're Doing

- Using Zustand slice pattern for modularity
- Keeping ReactFlow hooks (`useNodesState`, `useEdgesState`) in component
- Custom storage adapters for backward compatibility
- Fine-grained selectors for performance
- Incremental migration strategy

### ❌ What We're NOT Doing

- NOT moving ReactFlow state to Zustand (performance reasons)
- NOT changing localStorage schema (compatibility)
- NOT replacing theme management (next-themes works well)
- NOT adding new features (pure refactoring)

## 📦 Dependencies

```json
{
  "zustand": "^5.0.2",
  "immer": "^10.1.1"
}
```

**Bundle Impact**: ~3KB (acceptable trade-off for benefits)

## 🔄 Migration Strategy

### Phase 1: Setup (Tasks 1.1-1.3)

Install dependencies, create directory structure, add types

### Phase 2: Store Implementation (Tasks 2.1-2.5)

Implement all 5 stores with middleware, test in isolation

### Phase 3: Component Migration (Tasks 3.1-3.6)

Incrementally replace hooks with stores, validate each slice

### Phase 4: Storage Integration (Tasks 4.1-4.2)

Integrate storage utilities, test localStorage compatibility

### Phase 5: Testing (Tasks 5.1-5.3)

Manual testing, performance validation, cross-browser testing

### Phase 6: Documentation (Tasks 6.1-6.3)

Update project docs, add JSDoc comments, create migration guide

### Phase 7: Final Validation (Tasks 7.1-7.3)

Code review, build verification, deployment preparation

## 🎨 Code Examples

### Before (Current)

```typescript
function ProductionDesignerFlow() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [settings, setSettings] = useState(loadSettings())
  const [currentSlot, setCurrentSlot] = useState(0)
  // ... 9+ more useState hooks

  const onSave = useCallback(() => {
    // Complex save logic
  }, [/* dependencies */])

  useEffect(() => {
    // Side effects
  }, [/* dependencies */])

  // ... 15+ more useCallbacks, 5+ more useMemos

  return (/* 1200+ lines of JSX */)
}
```

### After (Proposed)

```typescript
function ProductionDesignerFlow() {
  // Fine-grained subscriptions
  const searchTerm = useUIStore(state => state.searchTerm)
  const setSearchTerm = useUIStore(state => state.setSearchTerm)
  const isPanelOpen = useUIStore(state => state.isPanelOpen)
  const settings = useSettingsStore(state => state.settings)
  const saveFlow = useSlotStore(state => state.saveFlow)

  // ReactFlow hooks remain
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  return (/* ~400 lines of JSX */)
}
```

### Store Implementation Example

```typescript
// lib/stores/ui-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIStore {
  searchTerm: string;
  isPanelOpen: boolean;
  setSearchTerm: (term: string) => void;
  togglePanel: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      searchTerm: "",
      isPanelOpen: true,
      setSearchTerm: (term) => set({ searchTerm: term }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
    }),
    { name: "UIStore" }
  )
);
```

## ✅ Validation

Run OpenSpec validation:

```bash
openspec validate refactor-state-management-zustand --strict
```

**Status**: ✅ Valid (all requirements have scenarios, proper format)

## 🚀 Implementation Readiness

- [x] Proposal written
- [x] Design decisions documented
- [x] Tasks broken down (93 detailed tasks)
- [x] Spec deltas created (8 ADDED, 2 MODIFIED)
- [x] OpenSpec validation passed
- [ ] **Waiting for approval** ⏳

## 📊 Expected Outcomes

### Quantitative

- Component lines: 1200+ → ~400 (67% reduction)
- Bundle size: +3KB (zustand + immer)
- Re-renders: Significant reduction (selective subscriptions)
- Testable state logic: 100% (stores can be tested in isolation)

### Qualitative

- **Maintainability**: Much easier to understand and modify
- **Debugging**: Better with Zustand DevTools
- **Developer Experience**: Cleaner code, better TypeScript support
- **Future-Proofing**: Foundation for advanced features (undo/redo, collaboration)

## 🎓 Best Practices Followed

1. **Zustand slice pattern** - Recommended for larger applications
2. **Fine-grained selectors** - Optimal performance
3. **Persist middleware** - Automatic localStorage sync
4. **Backward compatibility** - Custom storage adapters
5. **TypeScript first** - Full type safety
6. **Incremental migration** - Low-risk refactoring
7. **Comprehensive testing** - Validation at every phase

## ⚠️ Important Notes

- **No breaking changes**: All existing functionality preserved
- **Data safety**: localStorage schema unchanged
- **Rollback ready**: Each phase can be reverted independently
- **Performance tested**: Must validate re-render improvements
- **Documentation required**: Must update project.md and add JSDoc

## 🔗 References

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/typescript)
- [Slice Pattern Guide](https://docs.pmnd.rs/zustand/guides/slices-pattern)
- [Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

## 📝 Next Steps

1. **Review this proposal** and provide feedback
2. **Approve the proposal** if design is acceptable
3. **Begin implementation** following tasks.md sequentially
4. **Track progress** by checking off tasks
5. **Validate thoroughly** at each phase
6. **Deploy** after final validation passes

---

**Change ID**: `refactor-state-management-zustand`  
**Status**: Awaiting Approval  
**Estimated Effort**: Large (93 tasks across 7 phases)  
**Risk Level**: Medium (large refactor, but incremental with rollback plan)  
**Impact**: High (improves maintainability, performance, testability)
