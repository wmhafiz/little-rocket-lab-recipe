# Refactor State Management to Zustand

## Why

The Production Designer component currently manages complex state through 13+ `useState` hooks, 19+ `useCallback` hooks, 5+ `useMemo` hooks, and 3+ `useEffect` hooks scattered throughout a 1200+ line component. This leads to:

1. **Poor maintainability**: State logic is tightly coupled to the component, making it difficult to test, debug, and reason about
2. **Performance concerns**: Multiple state updates trigger unnecessary re-renders across the entire component tree
3. **Code complexity**: Related state updates are scattered across multiple callbacks, making state transitions hard to follow
4. **Testing difficulties**: Component state cannot be easily tested in isolation without mounting the entire component
5. **Code reusability**: State logic cannot be shared across components or extracted for reuse

Zustand provides a lightweight, modern state management solution that:
- Centralizes state logic in testable stores with clear boundaries
- Enables fine-grained subscriptions to prevent unnecessary re-renders
- Offers built-in middleware for persistence, devtools, and state synchronization
- Maintains TypeScript type safety throughout the application
- Follows React best practices with minimal boilerplate

## What Changes

This refactoring will reorganize the application's state management using Zustand stores following the **slice pattern** for modularity and maintainability:

1. **Add Zustand dependency** (`zustand@^5.0.2`)

2. **Create modular Zustand stores** (slice pattern):
   - `useFlowStore` - Nodes, edges, and ReactFlow instance management
   - `useUIStore` - UI state (panels, dialogs, menus, search, filters)
   - `useSlotStore` - Multi-slot save/restore system with localStorage persistence
   - `useSettingsStore` - Designer settings with localStorage persistence
   - `useOptimalProductionStore` - Production calculations and requirements

3. **Implement middleware**:
   - Persist middleware for `useSlotStore` and `useSettingsStore`
   - Devtools middleware for all stores (development only)
   - Immer middleware for simpler immutable updates

4. **Refactor components**:
   - Extract state logic from `ProductionDesignerFlow` component
   - Replace `useState`/`useCallback`/`useEffect` with Zustand store hooks
   - Create custom selectors for optimal performance
   - Simplify component to focus on presentation logic

5. **Update type definitions**:
   - Add store types and action types
   - Ensure full TypeScript safety across stores

6. **Update project documentation**:
   - Update `openspec/project.md` to reflect Zustand as state management solution
   - Document store architecture and patterns

## Impact

**Affected specs:**
- `production-designer` - Core state management refactored to Zustand

**Affected code:**
- `components/production-designer-view.tsx` - Major refactor to use stores
- `lib/types.ts` - Add store-related types
- `lib/stores/` (new) - Store implementations with slices
- `lib/slot-storage.ts` - Integrate with Zustand persist middleware
- `lib/settings-storage.ts` - Integrate with Zustand persist middleware
- `package.json` - Add Zustand dependencies

**Breaking changes:** None
- All existing functionality preserved
- UI/UX unchanged
- localStorage schema remains compatible
- API contracts unchanged

**Benefits:**
- Improved code organization and maintainability
- Better performance through selective subscriptions
- Easier testing of state logic in isolation
- Foundation for future features requiring shared state
- Better debugging experience with Zustand DevTools
- Reduced component complexity (1200+ lines → ~400 lines)

