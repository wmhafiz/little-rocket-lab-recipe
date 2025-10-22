# Implementation Tasks

## 1. Data Model Updates

- [x] 1.1 Update `CraftRecipe` type to support alternative ingredients (OR logic)
- [x] 1.2 Add coal requirement (1 quantityPerMin) to Copper Bar recipe
- [x] 1.3 Add coal requirement (1 quantityPerMin) to Iron Bar recipe
- [x] 1.4 Update Plastic Scraps recipe to use OR logic for Computer Tower/Monitor
- [x] 1.5 Review other recipes for missing coal/fuel requirements

## 2. Calculation Logic

- [x] 2.1 Update optimal production calculator to handle OR logic
- [x] 2.2 Implement strategy for selecting optimal alternative (prefer lowest cost/rate)
- [x] 2.3 Update backward traversal to account for fuel/coal requirements
- [x] 2.4 Add tests for OR logic calculation scenarios

## 3. Visual Display Updates

- [x] 3.1 Add quantity badge to MachineryIconNode (similar to ResourceIconNode)
- [x] 3.2 Update RecipeNode to display OR relationships in ingredient lists
- [x] 3.3 Update connection validation to allow OR alternatives
- [x] 3.4 Add visual indicator (e.g., "OR" text) between alternative ingredients
- [x] 3.5 Update tooltips to explain OR logic and coal requirements

## 4. Testing & Validation

- [x] 4.1 Test coal requirement calculations in production chains
- [x] 4.2 Test OR logic with Plastic Scraps recipe
- [x] 4.3 Verify machinery quantity badges display correctly
- [x] 4.4 Test edge cases (multiple OR groups, nested chains with OR)
- [x] 4.5 Validate auto-layout handles OR connections properly
