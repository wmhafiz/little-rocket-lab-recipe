# Design Document: Coal Requirements, E-Waste Resource, and Machinery Quantity

## Context

The production designer currently has three limitations:

1. **Coal/fuel requirements are not modeled**: Smelting recipes (Copper Bar, Iron Bar) require coal as fuel but this isn't represented in the recipe data or calculations
2. **E-Waste not unified**: Computer Tower and Computer Monitor are separate resources when they should be grouped as a single E-Waste resource for Plastic Scraps production
3. **Machinery nodes lack quantity indicators**: Unlike resource nodes which show how many are needed, machinery nodes only show the icon

These limitations make it difficult to accurately plan production chains and understand total resource requirements.

## Goals / Non-Goals

**Goals:**

- Add coal as a fuel requirement to all smelting recipes
- Create unified E-Waste resource combining Computer Tower and Computer Monitor
- Display both icons in E-Waste node to show it represents both items
- Display quantity requirements on machinery nodes
- Maintain backward compatibility with existing recipes

**Non-Goals:**

- OR logic / alternative ingredients (simplified to single E-Waste resource instead)
- User-editable recipes or custom fuel types
- Dynamic fuel consumption rates (always 1 per minute for now)
- Multiple icon display for other resources

## Decisions

### Decision 1: Coal as Regular Ingredient vs. Separate Fuel Field

**Chosen**: Add coal as a regular ingredient in the ingredients array

**Rationale**:

- Simpler data model - no need for separate fuel field
- Reuses existing ingredient handling logic
- Coal flows through the graph like any other material
- Easier to visualize and connect in the node graph

**Alternatives considered**:

- Separate `fuel` field in recipe: More complex, requires parallel handling logic
- Global fuel constant: Doesn't allow for recipe-specific fuel requirements

### Decision 2: E-Waste as Unified Resource vs. OR Logic

**Chosen**: Create E-Waste as a single unified resource that visually displays both Computer Tower and Computer Monitor icons

**Rationale**:

- Simpler data model - no need for OR logic complexity
- Clearer user intent - E-Waste represents both items together
- Easier to implement - special case rendering for one resource
- Better UX - users see both icons at all zoom levels

**Alternatives considered**:

- OR logic with alternatives array: More complex, harder to understand
- Separate Computer Tower/Monitor resources: Current state, confusing for Plastic Scraps
- Create intermediate E-Waste recipe: Adds unnecessary node to production chain

### Decision 3: Dual-Icon Display Implementation

**Chosen**: Special-case E-Waste in ResourceIconNode and RecipeNode to render both icons side-by-side

**Implementation**:

```tsx
{
  recipe.name === "E-Waste" ? (
    <>
      <div className="left-half">
        <Image src="Computer Tower.png" />
      </div>
      <div className="right-half">
        <Image src="Computer Monitor.png" />
      </div>
    </>
  ) : (
    <Image src={recipe.icon} />
  );
}
```

**Rationale**:

- Simple conditional rendering
- Works at all zoom levels (ResourceIconNode, RecipeNode icon-only, RecipeNode card)
- No impact on other resources
- Easy to extend if needed for other multi-icon resources

**Alternatives considered**:

- Generic multi-icon system: Over-engineered for single use case
- Composite icon image: Less flexible, harder to update
- Show only one icon: Loses information about what E-Waste represents

### Decision 4: Machinery Quantity Display

**Chosen**: Add the same badge system used in ResourceIconNode to MachineryIconNode

**Rationale**:

- Consistent UX across node types
- Reuses existing calculation logic (`calculateNodesNeeded`)
- Same visual language (color-coded badges)
- Minimal code duplication

**Implementation**:

- Copy badge rendering logic from ResourceIconNode
- Reuse status color helper function
- Position badge at top-right corner (same as resource nodes)

## Risks / Trade-offs

**Risk**: E-Waste dual-icon display may not scale well if more multi-icon resources are needed

- **Mitigation**: Current implementation is simple conditional; can refactor to generic system if needed

**Risk**: Coal requirements increase complexity of production chains

- **Mitigation**: This reflects actual game mechanics - better to be accurate

**Risk**: Removing Computer Tower/Monitor as separate resources may confuse existing users

- **Mitigation**: E-Waste clearly shows both icons, tooltip explains it represents both items

**Trade-off**: Adding coal to existing recipes may break saved production chains

- **Mitigation**: No persistence layer yet, so no saved chains to break

**Trade-off**: Machinery badges may clutter small icon nodes

- **Mitigation**: Use same compact badge design as resource nodes, only show when connected

## Migration Plan

**Phase 1: Data Model** (Non-breaking)

1. Add coal to smelting recipes (Copper Bar, Iron Bar)
2. Create E-Waste resource
3. Remove Computer Tower and Computer Monitor resources
4. Update Plastic Scraps to use E-Waste ingredient

**Phase 2: Visual** (Non-breaking)

5. Add dual-icon display to ResourceIconNode for E-Waste
6. Add dual-icon display to RecipeNode (icon-only mode) for E-Waste
7. Add dual-icon display to RecipeNode (card mode) for E-Waste
8. Add quantity badges to MachineryIconNode

**Rollback**: Each phase is straightforward. If issues arise, can:

- Revert to separate Computer Tower/Monitor resources
- Remove dual-icon conditional rendering
- Revert to previous node components

## Open Questions

1. **Should we support multiple coal sources in the future?** (e.g., charcoal, biofuel)

   - Answer: Not in this change, could create separate resources or use OR logic if needed later

2. **Should other resources get dual-icon display?**

   - Answer: No immediate need, E-Waste is unique case for now

3. **Should E-Waste icon be a composite image instead of two separate icons?**

   - Answer: Separate icons more flexible, easier to update, works at all zoom levels

4. **Do any other recipes have missing fuel requirements?**
   - Answer: Need to review all recipes, but focus on Copper/Iron Bar for now
