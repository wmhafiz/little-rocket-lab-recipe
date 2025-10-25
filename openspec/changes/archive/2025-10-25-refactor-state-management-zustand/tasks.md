# Implementation Tasks

## 1. Setup and Dependencies

- [x] 1.1 Install Zustand core package (`pnpm add zustand@^5.0.2`)
- [x] 1.2 Install Zustand middleware packages (`pnpm add immer@^10.1.1` for Immer integration)
- [x] 1.3 Create store directory structure (`lib/stores/`)
- [x] 1.4 Add store-related types to `lib/types.ts`

## 2. Store Implementation

- [x] 2.1 Implement `FlowStore` (`lib/stores/flow-store.ts`)

  - [x] 2.1.1 Create store interface with ReactFlow instance state
  - [x] 2.1.2 Implement layout actions (horizontal, vertical)
  - [x] 2.1.3 Implement clear canvas action
  - [x] 2.1.4 Implement viewport utilities (fitView, setViewport)
  - [x] 2.1.5 Add DevTools middleware

- [x] 2.2 Implement `UIStore` (`lib/stores/ui-store.ts`)

  - [x] 2.2.1 Create store interface for UI state (search, filters, dialogs, panels)
  - [x] 2.2.2 Implement search and filter actions
  - [x] 2.2.3 Implement panel toggle actions
  - [x] 2.2.4 Implement dialog open/close actions
  - [x] 2.2.5 Implement mobile menu actions
  - [x] 2.2.6 Add DevTools middleware

- [x] 2.3 Implement `SlotStore` (`lib/stores/slot-store.ts`)

  - [x] 2.3.1 Create store interface for slot management
  - [x] 2.3.2 Implement migration function from old storage
  - [x] 2.3.3 Create custom storage adapter for backward compatibility
  - [x] 2.3.4 Implement save flow action (with title/description)
  - [x] 2.3.5 Implement restore flow action
  - [x] 2.3.6 Implement delete slot action
  - [x] 2.3.7 Implement edit slot metadata action
  - [x] 2.3.8 Implement switch active slot action
  - [x] 2.3.9 Add Persist middleware with custom storage
  - [x] 2.3.10 Add DevTools middleware

- [x] 2.4 Implement `SettingsStore` (`lib/stores/settings-store.ts`)

  - [x] 2.4.1 Create store interface for designer settings
  - [x] 2.4.2 Implement update settings action
  - [x] 2.4.3 Implement reset to defaults action
  - [x] 2.4.4 Implement individual setting update actions
  - [x] 2.4.5 Add Persist middleware with localStorage
  - [x] 2.4.6 Add Immer middleware for nested updates
  - [x] 2.4.7 Add DevTools middleware

- [x] 2.5 Implement `OptimalProductionStore` (`lib/stores/optimal-production-store.ts`)
  - [x] 2.5.1 Create store interface for production calculations
  - [x] 2.5.2 Implement calculate production action
  - [x] 2.5.3 Integrate with `optimal-production-calculator.ts`
  - [x] 2.5.4 Add DevTools middleware

## 3. Component Refactoring

- [x] 3.1 Refactor `ProductionDesignerFlow` - Settings integration

  - [x] 3.1.1 Replace `settings` useState with `useSettingsStore`
  - [x] 3.1.2 Replace settings update callbacks with store actions
  - [x] 3.1.3 Update `SettingsDialog` to use store
  - [x] 3.1.4 Remove `loadSettings()` and `saveSettings()` calls
  - [x] 3.1.5 Test settings persistence

- [x] 3.2 Refactor `ProductionDesignerFlow` - Slot management

  - [x] 3.2.1 Replace slot-related useState hooks with `useSlotStore`
  - [x] 3.2.2 Replace `onSave` callback with store action
  - [x] 3.2.3 Replace `onRestore` callback with store action
  - [x] 3.2.4 Replace `handleSaveAs` callback with store action
  - [x] 3.2.5 Replace `handleLoad` callback with store action
  - [x] 3.2.6 Replace `handleDeleteSlot` callback with store action
  - [x] 3.2.7 Replace `handleEditSlotMetadata` callback with store action
  - [x] 3.2.8 Update `SlotSelectorDialog` to use store
  - [x] 3.2.9 Test save/restore functionality
  - [x] 3.2.10 Test slot switching

- [x] 3.3 Refactor `ProductionDesignerFlow` - UI state

  - [x] 3.3.1 Replace `searchTerm` useState with `useUIStore`
  - [x] 3.3.2 Replace `isPanelOpen` useState with `useUIStore`
  - [x] 3.3.3 Replace `selectedCategory` useState with `useUIStore`
  - [x] 3.3.4 Replace dialog visibility states with `useUIStore`
  - [x] 3.3.5 Replace `showMobileMenu` useState with `useUIStore`
  - [x] 3.3.6 Update all UI callbacks to use store actions
  - [x] 3.3.7 Test search and filtering
  - [x] 3.3.8 Test panel toggling
  - [x] 3.3.9 Test dialog interactions

- [x] 3.4 Refactor `ProductionDesignerFlow` - Flow utilities

  - [x] 3.4.1 Replace `rfInstance` useState with `useFlowStore`
  - [x] 3.4.2 Move `onLayout` callback logic to FlowStore
  - [x] 3.4.3 Move `clearCanvas` callback to use store action
  - [x] 3.4.4 Update ReactFlow `onInit` to use store action
  - [x] 3.4.5 Test layout functionality
  - [x] 3.4.6 Test clear canvas

- [x] 3.5 Refactor `ProductionDesignerFlow` - Optimal production

  - [x] 3.5.1 Replace `optimalProduction` useState with `useOptimalProductionStore`
  - [x] 3.5.2 Replace calculation useEffect with store subscription
  - [x] 3.5.3 Update nodes to read from store
  - [x] 3.5.4 Test production indicators update correctly

- [x] 3.6 Remove legacy code
  - [x] 3.6.1 Remove all replaced useState hooks
  - [x] 3.6.2 Remove all replaced useCallback hooks
  - [x] 3.6.3 Remove replaced useEffect hooks
  - [x] 3.6.4 Clean up unused imports
  - [x] 3.6.5 Verify component is significantly simplified

## 4. Storage Utilities Integration

- [x] 4.1 Integrate storage utilities into stores

  - [x] 4.1.1 Move `migrateOldStorage` logic into SlotStore initialization
  - [x] 4.1.2 Deprecate `lib/slot-storage.ts` (functions now in store)
  - [x] 4.1.3 Deprecate `lib/settings-storage.ts` (functions now in store)
  - [x] 4.1.4 Update any external references to storage utilities

- [x] 4.2 Test localStorage compatibility
  - [x] 4.2.1 Test migration from old storage format
  - [x] 4.2.2 Test save/restore across page reloads
  - [x] 4.2.3 Test settings persistence across page reloads
  - [x] 4.2.4 Verify all localStorage keys match expectations

## 5. Testing and Validation

- [x] 5.1 Manual testing

  - [x] 5.1.1 Test all flow operations (add nodes, connect, layout, clear)
  - [x] 5.1.2 Test save/restore functionality across all slots
  - [x] 5.1.3 Test settings changes and persistence
  - [x] 5.1.4 Test search and filtering
  - [x] 5.1.5 Test panel and dialog interactions
  - [x] 5.1.6 Test mobile menu functionality
  - [x] 5.1.7 Test optimal production indicators
  - [x] 5.1.8 Test viewport restore
  - [x] 5.1.9 Test theme switching (ensure no conflicts)

- [x] 5.2 Performance validation

  - [x] 5.2.1 Profile component re-renders before and after
  - [x] 5.2.2 Verify selective subscriptions prevent unnecessary renders
  - [x] 5.2.3 Test with large flow diagrams (50+ nodes)

- [x] 5.3 Cross-browser testing
  - [x] 5.3.1 Test in Chrome/Edge
  - [x] 5.3.2 Test in Firefox
  - [x] 5.3.3 Test in Safari (if available)

## 6. Documentation Updates

- [x] 6.1 Update `openspec/project.md`

  - [x] 6.1.1 Add Zustand to tech stack section
  - [x] 6.1.2 Update state management section with store architecture
  - [x] 6.1.3 Document store patterns and conventions
  - [x] 6.1.4 Add examples of store usage

- [x] 6.2 Update component documentation

  - [x] 6.2.1 Add JSDoc comments to store files
  - [x] 6.2.2 Document store interfaces and actions
  - [x] 6.2.3 Add usage examples in comments

- [x] 6.3 Create migration guide
  - [x] 6.3.1 Document how to add new state to stores
  - [x] 6.3.2 Document selector best practices
  - [x] 6.3.3 Document how to add new stores if needed

## 7. Final Validation

- [x] 7.1 Code review checklist

  - [x] 7.1.1 All TypeScript types are correct
  - [x] 7.1.2 No console errors or warnings
  - [x] 7.1.3 All existing features work as before
  - [x] 7.1.4 Component is significantly simplified
  - [x] 7.1.5 Store code is well-organized and documented

- [x] 7.2 Build verification

  - [x] 7.2.1 Run `pnpm build` successfully
  - [x] 7.2.2 Verify bundle size impact is acceptable
  - [x] 7.2.3 Run `pnpm lint` with no errors

- [x] 7.3 Deployment preparation
  - [x] 7.3.1 Test production build locally
  - [x] 7.3.2 Verify all features work in production mode
  - [x] 7.3.3 Ready for merge and deployment
