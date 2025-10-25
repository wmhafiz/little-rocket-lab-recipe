# Store Architecture Diagram

This document provides visual representations of the Zustand store architecture.

## 🏗️ Store Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Production Designer App                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              ProductionDesignerFlow Component                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Fine-grained Zustand Store Subscriptions                  │ │
│  │                                                             │ │
│  │  const search = useUIStore(s => s.searchTerm)             │ │
│  │  const settings = useSettingsStore(s => s.settings)       │ │
│  │  const saveFlow = useSlotStore(s => s.saveFlow)           │ │
│  │  const production = useOptimalProductionStore(s => s.map) │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ReactFlow Hooks (kept as-is for performance)             │ │
│  │                                                             │ │
│  │  const [nodes, setNodes, onNodesChange] = useNodesState() │ │
│  │  const [edges, setEdges, onEdgesChange] = useEdgesState() │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────┐
        │        Zustand Store Layer (Slices)        │
        └───────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
        │  FlowStore   │ │   UIStore   │ │  SlotStore  │
        │              │ │             │ │             │
        │ - rfInstance │ │ - search    │ │ - slots[]   │
        │ - layout()   │ │ - panel     │ │ - metadata  │
        │ - clear()    │ │ - dialogs   │ │ - save()    │
        │              │ │ - filters   │ │ - restore() │
        └──────────────┘ └─────────────┘ └─────────────┘
                │               │               │
                │               │               ▼
                │               │         ┌──────────────┐
                │               │         │   Persist    │
                │               │         │  Middleware  │
                │               │         └──────────────┘
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
        │ SettingsStore│ │OptimalProd  │ │ localStorage│
        │              │ │   Store     │ │             │
        │ - iconModes  │ │             │ │ - slot-0    │
        │ - thresholds │ │ - prodMap   │ │ - slot-1    │
        │ - dedLines   │ │ - calc()    │ │ - ...       │
        │              │ │             │ │ - settings  │
        └──────────────┘ └─────────────┘ └─────────────┘
                │
                ▼
        ┌──────────────┐
        │   Persist    │
        │  Middleware  │
        └──────────────┘
                │
                ▼
        ┌──────────────┐
        │ localStorage │
        │  - settings  │
        └──────────────┘
```

## 🔄 Data Flow Diagram

### Example: Saving a Flow

```
    User Action                  Component                    Store                    Persistence
        │                            │                          │                          │
        │  Click "Save"              │                          │                          │
        ├───────────────────────────▶│                          │                          │
        │                            │  useSlotStore(s =>       │                          │
        │                            │    s.saveFlow)           │                          │
        │                            ├─────────────────────────▶│                          │
        │                            │                          │  Zustand set()           │
        │                            │                          │  + Persist middleware    │
        │                            │                          ├─────────────────────────▶│
        │                            │                          │                          │
        │                            │                          │          localStorage    │
        │                            │                          │          .setItem()      │
        │                            │                          │◀─────────────────────────┤
        │                            │                          │                          │
        │                            │  State updated           │                          │
        │                            │◀─────────────────────────┤                          │
        │                            │                          │                          │
        │  Toast: "Saved!"           │  Component re-renders    │                          │
        │◀───────────────────────────┤  (selective subscription)│                          │
        │                            │                          │                          │
```

### Example: Searching Recipes

```
    User Input                   Component                    Store
        │                            │                          │
        │  Type "copper"             │                          │
        ├───────────────────────────▶│                          │
        │                            │  useUIStore(s =>         │
        │                            │    s.setSearchTerm)      │
        │                            ├─────────────────────────▶│
        │                            │                          │  Zustand set()
        │                            │                          │  { searchTerm: "copper" }
        │                            │                          │
        │                            │  Only searchTerm         │
        │                            │  subscribers re-render   │
        │                            │◀─────────────────────────┤
        │                            │                          │
        │  Filtered results          │  useMemo recalculates    │
        │  displayed                 │  filteredRecipes         │
        │◀───────────────────────────┤                          │
        │                            │                          │
```

## 📦 Store Slice Responsibilities

```
┌──────────────────────────────────────────────────────────────┐
│                        FlowStore                              │
├──────────────────────────────────────────────────────────────┤
│ State:                                                        │
│  - rfInstance: ReactFlowInstance | null                      │
│                                                               │
│ Actions:                                                      │
│  - setRfInstance(instance)                                   │
│  - layoutHorizontal()                                        │
│  - layoutVertical()                                          │
│  - clearCanvas()                                             │
│                                                               │
│ No Persistence                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         UIStore                               │
├──────────────────────────────────────────────────────────────┤
│ State:                                                        │
│  - searchTerm: string                                        │
│  - isPanelOpen: boolean                                      │
│  - selectedCategory: string | null                           │
│  - showSaveAsDialog: boolean                                 │
│  - showLoadDialog: boolean                                   │
│  - showMobileMenu: boolean                                   │
│  - showSettingsDialog: boolean                               │
│                                                               │
│ Actions:                                                      │
│  - setSearchTerm(term)                                       │
│  - togglePanel()                                             │
│  - setSelectedCategory(category)                             │
│  - openSaveAsDialog(), closeSaveAsDialog()                   │
│  - openLoadDialog(), closeLoadDialog()                       │
│  - toggleMobileMenu()                                        │
│  - openSettingsDialog(), closeSettingsDialog()               │
│                                                               │
│ No Persistence (Session only)                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                        SlotStore                              │
├──────────────────────────────────────────────────────────────┤
│ State:                                                        │
│  - currentSlot: number                                       │
│  - slots: Array<FlowData | null>  (10 slots)                │
│  - metadata: Array<SlotInfo>                                 │
│                                                               │
│ Actions:                                                      │
│  - saveFlow(data, title, description)                        │
│  - restoreFlow() → FlowData | null                           │
│  - switchSlot(index)                                         │
│  - deleteSlot(index)                                         │
│  - editSlotMetadata(index, title, description)               │
│  - migrate() (runs on init)                                  │
│                                                               │
│ Persistence: localStorage (custom adapter)                   │
│  Keys: lrl-designer-slot-0, slot-1, ..., slot-9             │
│        lrl-designer-slot-metadata                            │
│        lrl-designer-current-slot                             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      SettingsStore                            │
├──────────────────────────────────────────────────────────────┤
│ State:                                                        │
│  - showResourceIconNodes: boolean                            │
│  - showMachineryIconNodes: boolean                           │
│  - autoIconOnlyMode: boolean                                 │
│  - iconOnlyZoomThreshold: number                             │
│  - useDedicatedProductionLines: boolean                      │
│  - dedicatedLineConsumers: {                                 │
│      gear: boolean,                                          │
│      bearing: boolean,                                       │
│      ironPlate: boolean,                                     │
│      heatsink: boolean,                                      │
│      copperWire: boolean                                     │
│    }                                                          │
│                                                               │
│ Actions:                                                      │
│  - updateSettings(partial)                                   │
│  - updateSetting(key, value)                                 │
│  - toggleDedicatedLineConsumer(key)                          │
│  - resetToDefaults()                                         │
│                                                               │
│ Persistence: localStorage                                    │
│  Key: lrl-designer-settings                                  │
│                                                               │
│ Middleware: Immer (for nested updates)                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  OptimalProductionStore                       │
├──────────────────────────────────────────────────────────────┤
│ State:                                                        │
│  - productionMap: Map<nodeId, OptimalProductionData>         │
│                                                               │
│ Actions:                                                      │
│  - calculateProduction(nodes, edges, recipes)                │
│  - getProductionData(nodeId) → OptimalProductionData         │
│  - clearProduction()                                         │
│                                                               │
│ No Persistence (Computed on demand)                          │
└──────────────────────────────────────────────────────────────┘
```

## 🔌 Middleware Stack Visualization

```
Store Creation Flow:

create<Store>()(                        ← Entry point
  devtools(                             ← Layer 4: DevTools (outermost)
    persist(                            ← Layer 3: Persistence
      immer(                            ← Layer 2: Immer (innermost)
        (set, get) => ({                ← Layer 1: Store logic
          // state and actions
        })
      ),
      {
        name: 'storage-key',
        storage: customAdapter
      }
    ),
    { name: 'StoreName' }
  )
)

Data Flow (set operation):

1. Store logic calls set()
2. Immer: Converts mutations to immutable updates
3. Persist: Serializes state to localStorage
4. DevTools: Sends action to Redux DevTools
5. Subscribers: Components re-render if subscribed
```

## 🎯 Component Simplification

### Before (Current)

```
ProductionDesignerFlow Component (1200+ lines)
├── useState hooks (13+)
│   ├── nodes, edges (ReactFlow)
│   ├── searchTerm
│   ├── isPanelOpen
│   ├── selectedCategory
│   ├── isAutoBuilding
│   ├── rfInstance
│   ├── currentSlot
│   ├── slots
│   ├── showSaveAsDialog
│   ├── showLoadDialog
│   ├── showMobileMenu
│   ├── showSettingsDialog
│   ├── settings
│   └── optimalProduction
│
├── useCallback hooks (19+)
│   ├── findNodeByRecipeName
│   ├── findRecipesProducing
│   ├── findRecipesUsing
│   ├── onLayout
│   ├── onConnect
│   ├── onConnectStart
│   ├── onConnectEnd
│   ├── addRecipeNode
│   ├── clearCanvas
│   ├── onSave
│   ├── onRestore
│   ├── handleSaveAs
│   ├── handleLoad
│   ├── handleDeleteSlot
│   ├── handleEditSlotMetadata
│   ├── deleteNode
│   ├── duplicateNode
│   ├── onReconnect
│   └── autoBuild
│
├── useMemo hooks (5+)
│   ├── iconOnlyMode
│   ├── existingRecipeNames
│   ├── categorizedRecipes
│   ├── filteredRecipes
│   └── nodesWithCallbacks
│
├── useEffect hooks (3+)
│   ├── Migration & slot loading
│   ├── Optimal production calculation
│   └── Settings-based node updates
│
└── JSX (complex nested structure)
```

### After (Proposed)

```
ProductionDesignerFlow Component (~400 lines)
├── Fine-grained store subscriptions (15-20 lines)
│   ├── useUIStore selectors
│   ├── useSlotStore selectors
│   ├── useSettingsStore selectors
│   ├── useFlowStore selectors
│   └── useOptimalProductionStore selectors
│
├── ReactFlow hooks (kept as-is)
│   ├── useNodesState()
│   ├── useEdgesState()
│   └── useReactFlow()
│
├── Minimal useMemo hooks (computed values only)
│   ├── iconOnlyMode (derived from settings + viewport)
│   ├── existingRecipeNames
│   ├── filteredRecipes
│   └── nodesWithCallbacks
│
└── Clean JSX (same structure, cleaner logic)

Complexity moved to:
├── lib/stores/flow-store.ts
├── lib/stores/ui-store.ts
├── lib/stores/slot-store.ts
├── lib/stores/settings-store.ts
└── lib/stores/optimal-production-store.ts
```

## 📈 Performance Optimization

```
Current Approach:
┌──────────────────────────────────────────────────┐
│ Any useState update triggers component re-render │
│ → All useMemo/useCallback deps checked           │
│ → All children potentially re-render             │
└──────────────────────────────────────────────────┘

Zustand Approach:
┌──────────────────────────────────────────────────┐
│ Only components subscribed to changed state      │
│ re-render                                        │
│                                                   │
│ Example:                                         │
│  - Search changes → Only search bar re-renders   │
│  - Panel toggles → Only panel re-renders         │
│  - Setting changes → Only affected nodes re-render│
└──────────────────────────────────────────────────┘

Performance Win: Selective, fine-grained updates
```

---

This architecture provides:

- ✅ Clear separation of concerns
- ✅ Testable state logic
- ✅ Optimal performance
- ✅ Easy to extend
- ✅ Type-safe throughout
- ✅ Backward compatible persistence
