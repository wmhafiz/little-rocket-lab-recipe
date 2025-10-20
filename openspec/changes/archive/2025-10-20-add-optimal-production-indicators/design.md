# Design Document: Optimal Production Indicators

## Context

The production designer currently allows users to build production chains by connecting recipe nodes, but provides no feedback on whether the production rates are balanced. Users must manually calculate how many input nodes are needed to satisfy downstream requirements, which is error-prone and time-consuming.

**Current State:**

- Recipes have `outputPerMin` (how many items produced per minute)
- Recipe ingredients have `quantityPerMin` (how many of that ingredient consumed per minute)
- No system to propagate these requirements backward through the graph

**Constraints:**

- All calculations happen client-side (no backend)
- Must work with dynamic graph topology (nodes/edges added/removed)
- Must handle cycles gracefully (though ideally production chains shouldn't have cycles)
- Performance considerations: recalculation triggered on every graph change

**Stakeholders:**

- Players designing production lines
- Players optimizing factory layouts

## Goals / Non-Goals

**Goals:**

- Calculate and display optimal production requirements for each input node
- Provide visual feedback on production balance (deficit/optimal/excess)
- Update calculations automatically when graph topology changes
- Support aggregation when multiple paths require the same resource
- Clear tooltips explaining the calculation

**Non-Goals:**

- Real-time simulation of production flows
- Handling time-based production cycles (assume steady-state)
- Optimizing graph layout based on production requirements
- Supporting multiple outputs per recipe (current data model has single output)
- User-editable production multipliers (future enhancement)

## Decisions

### Decision 1: Backward Propagation Algorithm

**What:** Calculate requirements by traversing the graph backward from machinery nodes (sinks) to resource nodes (sources).

**Why:**

- Machinery nodes define the final production goals
- Resources are adjusted to meet those goals
- Natural fit for dependency graphs
- Matches player mental model (start with goal, calculate what's needed)

**Algorithm:**

```
1. Identify all machinery nodes (no outgoing edges)
2. For each machinery node:
   - For each ingredient input:
     - Calculate required production: ingredient.quantityPerMin
     - Find source nodes connected to this input
     - Propagate requirement backward
3. For nodes with multiple consumers:
   - Aggregate all requirements (sum)
4. Store calculated requirement per node
```

**Alternatives considered:**

- Forward propagation (resource → machinery): Doesn't work well when machinery requirements define goals
- Constraint solver: Overkill for current use case, complex implementation

### Decision 2: Visual Indicator Design

**What:** Display a small badge on nodes showing required production rate and status color.

**Why:**

- Minimal visual clutter
- Color provides instant feedback
- Numeric value allows precise planning
- Consistent with existing node styling

**Placement:**

- Resource/Component nodes: Top-right corner badge
- Machinery nodes: No badge (they are consumers, not producers)

**Color coding:**

- Green: Node's `outputPerMin` ≥ required rate (optimal or excess)
- Yellow: Node's `outputPerMin` > required but within 10% margin (nearly optimal)
- Red: Node's `outputPerMin` < required rate (deficit)
- Gray: No downstream consumers or disconnected

**Alternatives considered:**

- Edge labels showing flow rates: Clutters the graph
- Sidebar panel with requirements: Requires context switching
- Highlights/glow effects only: Less precise, no numeric values

### Decision 3: Calculation Trigger Strategy

**What:** Recalculate optimal production on every nodes or edges state change using `useEffect`.

**Why:**

- Ensures calculations stay in sync with graph
- React's built-in change detection handles trigger logic
- Acceptable performance for typical graph sizes (<100 nodes)

**Implementation:**

```typescript
useEffect(() => {
  const calculations = calculateOptimalProduction(nodes, edges, recipes);
  setOptimalProductionData(calculations);
}, [nodes, edges, recipes]);
```

**Alternatives considered:**

- Manual trigger button: Poor UX, requires extra user action
- Debounced recalculation: Added complexity, not needed for current scale
- Memoization only: Still need trigger mechanism for updates

### Decision 4: Handling Cycles

**What:** Detect cycles and skip optimal calculation for nodes involved in cycles, showing a warning indicator.

**Why:**

- Production chains shouldn't logically have cycles (A produces B produces A)
- Cycle detection prevents infinite loops in traversal
- Warning helps users identify graph errors

**Detection:**

- Track visited nodes during backward traversal
- If we revisit a node in the same path, mark as cycle
- Display warning icon instead of production indicator

**Alternatives considered:**

- Allow cycles and use iterative solver: Complex, unnecessary for current domain
- Break cycles arbitrarily: Produces incorrect results
- Ignore issue: Risk of infinite loops/crashes

### Decision 5: Data Storage

**What:** Store optimal production data in component state (not in node data).

**Why:**

- Derived data, not persistent state
- Recalculated on every graph change
- Cleaner separation: node data = recipe info, calculations = separate state
- Avoids triggering ReactFlow re-renders unnecessarily

**Structure:**

```typescript
type OptimalProductionMap = Map<
  string,
  {
    requiredPerMin: number;
    status: "optimal" | "excess" | "deficit" | "disconnected" | "cycle";
  }
>;
```

**Alternatives considered:**

- Store in node.data: Triggers unnecessary ReactFlow updates
- Store in localStorage: Derived data shouldn't persist
- Global state library: Overkill for single-component concern

## Risks / Trade-offs

### Risk 1: Performance with Large Graphs

**Risk:** Recalculating on every change could be slow for graphs with >100 nodes.

**Mitigation:**

- Use memoization for traversal functions
- Consider debouncing if performance issues arise
- Profile with realistic production chains (typically 20-50 nodes)

**Trade-off:** Immediate feedback vs. computational cost. Prioritize immediate feedback initially.

### Risk 2: Complex Aggregation Scenarios

**Risk:** Multiple paths to the same resource with different rates could be confusing.

**Mitigation:**

- Sum all requirements (conservative approach)
- Show breakdown in tooltip (e.g., "Required: 180/min (90 from Assembler A, 90 from Assembler B)")

**Trade-off:** Simple sum vs. detailed optimization. Start with simple sum.

### Risk 3: User Confusion About Indicators

**Risk:** Users may not understand what the numbers mean without explanation.

**Mitigation:**

- Always show tooltips with clear explanations
- Use consistent color coding throughout
- Consider adding a help dialog explaining the feature

**Trade-off:** Minimal UI vs. clarity. Prioritize clarity with tooltips.

### Risk 4: Handling Incomplete Data

**Risk:** Some recipes might have missing or invalid `quantityPerMin`/`outputPerMin` values.

**Mitigation:**

- Validate data on load
- Fall back to "N/A" or skip calculation for invalid data
- Log warnings in console for debugging

**Trade-off:** Strictness vs. resilience. Be resilient, skip invalid data gracefully.

## Migration Plan

**Phase 1: Core Implementation**

1. Add calculation algorithm (non-UI)
2. Test with various graph topologies
3. Add unit tests for calculation logic

**Phase 2: UI Integration** 4. Add indicators to ResourceIconNode 5. Add indicators to RecipeNode 6. Implement color coding

**Phase 3: Polish** 7. Add tooltips with explanations 8. Handle edge cases (cycles, disconnected nodes) 9. Performance testing and optimization

**Rollback:**

- Feature is purely additive (no breaking changes)
- Can be disabled by removing indicator rendering
- No persistent state to migrate

## Open Questions

1. **Should machinery nodes show total consumption rates?**

   - Pro: Useful for understanding total factory throughput
   - Con: Adds visual complexity
   - Decision: Defer to future enhancement

2. **Should users be able to manually override production rates?**

   - Pro: Allows planning for partial builds or future expansion
   - Con: Adds UI complexity and state management
   - Decision: Defer to future enhancement

3. **How to handle intermediate buffers/storage?**

   - Current: Ignore storage nodes in calculations (flow through)
   - Alternative: Model storage capacity and fill rates
   - Decision: Keep simple, treat as pass-through

4. **Should we support production multipliers (e.g., "build 2x Assemblers")?**
   - Pro: Useful for scaling production
   - Con: Changes node data model significantly
   - Decision: Defer to future enhancement, note as potential feature
