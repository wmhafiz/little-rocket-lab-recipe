# Implementation Tasks

## 1. Type Definitions

- [x] 1.1 Add `OptimalProductionData` interface in `lib/types.ts`
- [x] 1.2 Add `requiredPerMin` field to node data types
- [x] 1.3 Add `productionStatus` enum (optimal, excess, deficit)

## 2. Calculation Algorithm

- [x] 2.1 Implement graph traversal function to calculate optimal production requirements
- [x] 2.2 Handle multiple downstream consumers (aggregate requirements)
- [x] 2.3 Handle cycles in the production graph gracefully
- [x] 2.4 Calculate from machinery nodes (sinks) backward to resource nodes (sources)
- [x] 2.5 Account for `outputPerMin` rates and `quantityPerMin` ingredient rates

## 3. State Management

- [x] 3.1 Add state for storing optimal production calculations per node
- [x] 3.2 Trigger recalculation when nodes or edges are added/removed
- [x] 3.3 Use useCallback/useMemo for performance optimization

## 4. UI Components

- [x] 4.1 Add badge/indicator to ResourceIconNode showing required production rate
- [x] 4.2 Add badge/indicator to RecipeNode showing required production rate
- [x] 4.3 Style indicators with color coding (green=optimal, yellow=excess, red=deficit)
- [x] 4.4 Add tooltip showing calculation details on hover
- [x] 4.5 Ensure indicators don't obscure node icons or connections

## 5. Visual Feedback

- [x] 5.1 Implement color coding for production status
- [x] 5.2 Add border/glow effect for nodes with deficit production (via color coding)
- [x] 5.3 Ensure theme compatibility (dark/light mode)

## 6. Edge Cases

- [x] 6.1 Handle disconnected nodes (show no requirement indicator)
- [x] 6.2 Handle nodes with no downstream consumers
- [x] 6.3 Handle invalid or missing quantityPerMin/outputPerMin data
- [x] 6.4 Handle division by zero edge cases

## 7. Documentation

- [x] 7.1 Add tooltip explanations for optimal production indicators
- [x] 7.2 Update inline code comments for calculation algorithm
