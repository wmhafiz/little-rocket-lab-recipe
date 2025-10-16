import type { CraftRecipe } from "./types"

const CRAFTING_RECIPES: CraftRecipe[] = [
  // Machinery
  {
    type: "Machinery",
    name: "Assembler (Level 1)",
    outputPerMin: "10",
    icon: "/recipes/Assembler 1.png",
    ingredients: [{ item: "Iron Plate", quantity: "9", quantityPerMin: "90" }],
  },
  {
    type: "Machinery",
    name: "Assembler (Level 2)",
    outputPerMin: "3",
    icon: "/recipes/Assembler 2.png",
    ingredients: [
      { item: "Iron Plate", quantity: "30", quantityPerMin: "90" },
      { item: "Heatsink", quantity: "10", quantityPerMin: "30" },
    ],
  },
  {
    type: "Machinery",
    name: "Assembler (Level 3)",
    outputPerMin: "1",
    icon: "/recipes/Assembler 3.png",
    ingredients: [
      { item: "Lightweight Frame", quantity: "9", quantityPerMin: "9" },
      { item: "Ceramic Plate", quantity: "6", quantityPerMin: "6" },
    ],
  },
  {
    type: "Machinery",
    name: "Assembler (Level 4)",
    outputPerMin: "0",
    icon: "/recipes/Assembler 4.png",
    ingredients: [
      { item: "Gear", quantity: "200", quantityPerMin: "0" },
      { item: "Steel Beam", quantity: "100", quantityPerMin: "0" },
      { item: "Circuit Board", quantity: "50", quantityPerMin: "0" },
      { item: "Servo", quantity: "50", quantityPerMin: "0" },
    ],
  },
  {
    type: "Machinery",
    name: "Bumper",
    outputPerMin: "10",
    icon: "/recipes/Bumper.png",
    ingredients: [
      { item: "Winch", quantity: "1", quantityPerMin: "10" },
      { item: "Iron Plate", quantity: "2", quantityPerMin: "20" },
    ],
  },
  {
    type: "Machinery",
    name: "Cable Crane",
    outputPerMin: "3",
    icon: "/recipes/Cable Crane.png",
    ingredients: [
      { item: "Steel Beam", quantity: "15", quantityPerMin: "45" },
      { item: "Winch", quantity: "2", quantityPerMin: "6" },
    ],
  },
  {
    type: "Machinery",
    name: "Chemical Plant",
    outputPerMin: "2",
    icon: "/recipes/Chemical Plant.png",
    ingredients: [
      { item: "Flow Meter", quantity: "1", quantityPerMin: "2" },
      { item: "Servo", quantity: "3", quantityPerMin: "6" },
    ],
  },
  {
    type: "Machinery",
    name: "Conveyor Belt",
    outputPerMin: "45",
    icon: "/recipes/Conveyor Belt.png",
    ingredients: [{ item: "Iron Plate", quantity: "2", quantityPerMin: "90" }],
  },
  {
    type: "Machinery",
    name: "Drill (Level 1)",
    outputPerMin: "10",
    icon: "/recipes/Drill (Level 1).png",
    ingredients: [
      { item: "Iron Plate", quantity: "9", quantityPerMin: "90" },
      { item: "Gear", quantity: "6", quantityPerMin: "60" },
    ],
  },
  {
    type: "Machinery",
    name: "Drill (Level 2)",
    outputPerMin: "6",
    icon: "/recipes/Drill (Level 2).png",
    ingredients: [
      { item: "Fiberglass", quantity: "3", quantityPerMin: "18" },
      { item: "Heavy Duty Motor", quantity: "1", quantityPerMin: "6" },
    ],
  },
  {
    type: "Machinery",
    name: "Filtering Splitter",
    outputPerMin: "2",
    icon: "/recipes/Filtering Splitter.png",
    ingredients: [
      { item: "Servo", quantity: "3", quantityPerMin: "6" },
      { item: "Gear", quantity: "15", quantityPerMin: "30" },
    ],
  },
  {
    type: "Machinery",
    name: "Furnace (Level 1)",
    outputPerMin: "10",
    icon: "/recipes/Furnace (Level 1).png",
    ingredients: [{ item: "Stone", quantity: "9", quantityPerMin: "90" }],
  },
  {
    type: "Machinery",
    name: "Furnace (Level 2)",
    outputPerMin: "3",
    icon: "/recipes/Furnace (Level 2).png",
    ingredients: [
      { item: "Stone", quantity: "30", quantityPerMin: "90" },
      { item: "Small Motor", quantity: "3", quantityPerMin: "9" },
    ],
  },
  {
    type: "Machinery",
    name: "Item Buffer",
    outputPerMin: "6",
    icon: "/recipes/Item Buffer.png",
    ingredients: [
      { item: "Iron Plate", quantity: "15", quantityPerMin: "90" },
      { item: "Small Motor", quantity: "2", quantityPerMin: "12" },
    ],
  },
  {
    type: "Machinery",
    name: "Item Dispenser",
    outputPerMin: "10",
    icon: "/recipes/Item Dispenser.png",
    ingredients: [
      { item: "Iron Plate", quantity: "6", quantityPerMin: "60" },
      { item: "Gear", quantity: "6", quantityPerMin: "60" },
    ],
  },
  {
    type: "Machinery",
    name: "Item Receiver",
    outputPerMin: "15",
    icon: "/recipes/Item Receiver.png",
    ingredients: [
      { item: "Iron Plate", quantity: "6", quantityPerMin: "90" },
      { item: "Gear", quantity: "3", quantityPerMin: "45" },
    ],
  },
  {
    type: "Machinery",
    name: "Large Wind Turbine",
    outputPerMin: "2",
    icon: "/recipes/Large Wind Turbine.png",
    ingredients: [
      { item: "Lightweight Frame", quantity: "6", quantityPerMin: "12" },
      { item: "Heavy Duty Motor", quantity: "2", quantityPerMin: "4" },
    ],
  },
  {
    type: "Machinery",
    name: "Loader",
    outputPerMin: "2",
    icon: "/recipes/Loader.png",
    ingredients: [
      { item: "Steel Beam", quantity: "9", quantityPerMin: "18" },
      { item: "Heavy Duty Motor", quantity: "2", quantityPerMin: "4" },
    ],
  },
  {
    type: "Machinery",
    name: "Pipe",
    outputPerMin: "10",
    icon: "/recipes/Pipe.png",
    ingredients: [
      { item: "Iron Plate", quantity: "3", quantityPerMin: "30" },
      { item: "Copper Bar", quantity: "1", quantityPerMin: "10" },
    ],
  },
  {
    type: "Machinery",
    name: "Power Pole (Level 1)",
    outputPerMin: "30",
    icon: "/recipes/Power Pole (Level 1).png",
    ingredients: [
      { item: "Iron Plate", quantity: "3", quantityPerMin: "90" },
      { item: "Copper Wire", quantity: "2", quantityPerMin: "60" },
    ],
  },
  {
    type: "Machinery",
    name: "Power Pole (Level 2)",
    outputPerMin: "6",
    icon: "/recipes/Power Pole (Level 2).png",
    ingredients: [
      { item: "Iron Plate", quantity: "9", quantityPerMin: "54" },
      { item: "Heatsink", quantity: "15", quantityPerMin: "90" },
    ],
  },
  {
    type: "Machinery",
    name: "Power Pole (with light)",
    outputPerMin: "10",
    icon: "/recipes/Power Pole (with light).png",
    ingredients: [
      { item: "Iron Plate", quantity: "6", quantityPerMin: "60" },
      { item: "Copper Wire", quantity: "9", quantityPerMin: "90" },
    ],
  },
  {
    type: "Machinery",
    name: "Recycler",
    outputPerMin: "2",
    icon: "/recipes/Recycler.png",
    ingredients: [
      { item: "Heavy Duty Motor", quantity: "2", quantityPerMin: "4" },
      { item: "Steel Beam", quantity: "6", quantityPerMin: "12" },
    ],
  },
  {
    type: "Machinery",
    name: "Small Wind Turbine",
    outputPerMin: "6",
    icon: "/recipes/Small Wind Turbine.png",
    ingredients: [
      { item: "Gear", quantity: "15", quantityPerMin: "90" },
      { item: "Copper Wire", quantity: "10", quantityPerMin: "60" },
    ],
  },
  {
    type: "Machinery",
    name: "Sorter",
    outputPerMin: "1",
    icon: "/recipes/Sorter.png",
    ingredients: [
      { item: "Steel Beam", quantity: "15", quantityPerMin: "15" },
      { item: "Logic Chip", quantity: "9", quantityPerMin: "9" },
    ],
  },
  {
    type: "Machinery",
    name: "Splitter",
    outputPerMin: "15",
    icon: "/recipes/Splitter.png",
    ingredients: [
      { item: "Gear", quantity: "6", quantityPerMin: "90" },
      { item: "Copper Wire", quantity: "3", quantityPerMin: "45" },
    ],
  },
  {
    type: "Machinery",
    name: "Synthesizer",
    outputPerMin: "2",
    icon: "/recipes/Synthesizer.png",
    ingredients: [
      { item: "Lightweight Frame", quantity: "2", quantityPerMin: "4" },
      { item: "Fiberglass", quantity: "3", quantityPerMin: "6" },
    ],
  },
  {
    type: "Machinery",
    name: "Underground Pipe",
    outputPerMin: "3",
    icon: "/recipes/Underground Pipe.png",
    ingredients: [
      { item: "Iron Plate", quantity: "6", quantityPerMin: "18" },
      { item: "Stone", quantity: "6", quantityPerMin: "18" },
    ],
  },
  {
    type: "Machinery",
    name: "Underpass",
    outputPerMin: "10",
    icon: "/recipes/Underpass.png",
    ingredients: [
      { item: "Iron Plate", quantity: "9", quantityPerMin: "90" },
      { item: "Stone", quantity: "9", quantityPerMin: "90" },
    ],
  },
  {
    type: "Machinery",
    name: "Unloader",
    outputPerMin: "2",
    icon: "/recipes/Unloader.png",
    ingredients: [
      { item: "Steel Beam", quantity: "9", quantityPerMin: "18" },
      { item: "Heavy Duty Motor", quantity: "2", quantityPerMin: "4" },
    ],
  },
  {
    type: "Machinery",
    name: "Utility Light",
    outputPerMin: "6",
    icon: "/recipes/Utility Light.png",
    ingredients: [
      { item: "Iron Plate", quantity: "2", quantityPerMin: "12" },
      { item: "Copper Wire", quantity: "6", quantityPerMin: "36" },
    ],
  },
  {
    type: "Machinery",
    name: "Water Pump",
    outputPerMin: "3",
    icon: "/recipes/Water Pump.png",
    ingredients: [
      { item: "Flow Meter", quantity: "1", quantityPerMin: "3" },
      { item: "Heavy Duty Motor", quantity: "1", quantityPerMin: "3" },
    ],
  },
  {
    type: "Machinery",
    name: "Wooden Chest",
    outputPerMin: "15",
    icon: "/recipes/Wooden Chest.png",
    ingredients: [{ item: "Wood", quantity: "4", quantityPerMin: "60" }],
  },
  // Components
  {
    type: "Component",
    name: "Battery",
    outputPerMin: "6",
    icon: "/recipes/Battery.png",
    ingredients: [
      { item: "Iron Plate", quantity: "1", quantityPerMin: "6" },
      { item: "Copper Wire", quantity: "1", quantityPerMin: "6" },
      { item: "Plastic Bar", quantity: "1", quantityPerMin: "6" },
    ],
  },
  {
    type: "Component",
    name: "Bearing",
    outputPerMin: "30",
    icon: "/recipes/Bearing.png",
    ingredients: [{ item: "Iron Plate", quantity: "2", quantityPerMin: "60" }],
  },
  {
    type: "Component",
    name: "Ceramic Plate",
    outputPerMin: "10",
    icon: "/recipes/Ceramic Plate.png",
    ingredients: [
      { item: "Stone", quantity: "3", quantityPerMin: "30" },
      { item: "Quartz", quantity: "1", quantityPerMin: "10" },
    ],
  },
  {
    type: "Component",
    name: "Circuit Board",
    outputPerMin: "15",
    icon: "/recipes/Circuit Board.png",
    ingredients: [
      { item: "Logic Chip", quantity: "1", quantityPerMin: "15" },
      { item: "Copper Wire", quantity: "2", quantityPerMin: "30" },
    ],
  },
  {
    type: "Component",
    name: "Copper Wire",
    outputPerMin: "30",
    icon: "/recipes/Copper Wire.png",
    ingredients: [{ item: "Copper Bar", quantity: "2", quantityPerMin: "60" }],
  },
  {
    type: "Component",
    name: "Fiberglass",
    outputPerMin: "15",
    icon: "/recipes/Fiberglass.png",
    ingredients: [
      { item: "Quartz", quantity: "2", quantityPerMin: "30" },
      { item: "Plastic Bar", quantity: "1", quantityPerMin: "15" },
    ],
  },
  {
    type: "Component",
    name: "Flow Meter",
    outputPerMin: "10",
    icon: "/recipes/Flow Meter.png",
    ingredients: [
      { item: "Circuit Board", quantity: "1", quantityPerMin: "10" },
      { item: "Gear", quantity: "3", quantityPerMin: "30" },
    ],
  },
  {
    type: "Component",
    name: "Gear",
    outputPerMin: "45",
    icon: "/recipes/Gear.png",
    ingredients: [{ item: "Iron Plate", quantity: "1", quantityPerMin: "45" }],
  },
  {
    type: "Component",
    name: "Glass Lens",
    outputPerMin: "2",
    icon: "/recipes/Glass Lens.png",
    ingredients: [
      { item: "Quartz", quantity: "1", quantityPerMin: "2" },
      { item: "Copper Bar", quantity: "1", quantityPerMin: "2" },
    ],
  },
  {
    type: "Component",
    name: "Heatsink",
    outputPerMin: "45",
    icon: "/recipes/Heatsink.png",
    ingredients: [{ item: "Copper Bar", quantity: "1", quantityPerMin: "45" }],
  },
  {
    type: "Component",
    name: "Heavy Duty Motor",
    outputPerMin: "15",
    icon: "/recipes/Heavy Duty Motor.png",
    ingredients: [
      { item: "Small Motor", quantity: "1", quantityPerMin: "15" },
      { item: "Heatsink", quantity: "2", quantityPerMin: "30" },
    ],
  },
  {
    type: "Component",
    name: "Iron Plate",
    outputPerMin: "90",
    icon: "/recipes/Iron Plate.png",
    ingredients: [{ item: "Iron Bar", quantity: "1", quantityPerMin: "90" }],
  },
  {
    type: "Component",
    name: "Lightweight Frame",
    outputPerMin: "15",
    icon: "/recipes/Lightweight Frame.png",
    ingredients: [
      { item: "Steel Beam", quantity: "1", quantityPerMin: "15" },
      { item: "Plastic Bar", quantity: "2", quantityPerMin: "30" },
    ],
  },
  {
    type: "Component",
    name: "Logic Chip",
    outputPerMin: "10",
    icon: "/recipes/Logic Chip.png",
    ingredients: [
      { item: "Computer Tower", quantity: "1", quantityPerMin: "10" },
      { item: "Computer Monitor", quantity: "1", quantityPerMin: "10" },
    ],
  },
  {
    type: "Component",
    name: "Oxygen Tank",
    outputPerMin: "15",
    icon: "/recipes/Oxygen Tank.png",
    ingredients: [
      { item: "Iron Plate", quantity: "2", quantityPerMin: "30" },
      { item: "Copper Bar", quantity: "1", quantityPerMin: "15" },
    ],
  },
  {
    type: "Component",
    name: "Rocket Fuel",
    outputPerMin: "6",
    icon: "/recipes/Rocket Fuel.png",
    ingredients: [
      { item: "Coal", quantity: "15", quantityPerMin: "90" },
      { item: "Iron Plate", quantity: "3", quantityPerMin: "18" },
    ],
  },
  {
    type: "Component",
    name: "Servo",
    outputPerMin: "15",
    icon: "/recipes/Servo.png",
    ingredients: [
      { item: "Circuit Board", quantity: "1", quantityPerMin: "15" },
      { item: "Small Motor", quantity: "1", quantityPerMin: "15" },
    ],
  },
  {
    type: "Component",
    name: "Small Motor",
    outputPerMin: "30",
    icon: "/recipes/Small Motor.png",
    ingredients: [
      { item: "Bearing", quantity: "2", quantityPerMin: "60" },
      { item: "Stator", quantity: "1", quantityPerMin: "30" },
    ],
  },
  {
    type: "Component",
    name: "Stator",
    outputPerMin: "30",
    icon: "/recipes/Stator.png",
    ingredients: [
      { item: "Gear", quantity: "1", quantityPerMin: "30" },
      { item: "Copper Wire", quantity: "1", quantityPerMin: "30" },
    ],
  },
  {
    type: "Component",
    name: "Steel Beam",
    outputPerMin: "30",
    icon: "/recipes/Steel Beam.png",
    ingredients: [
      { item: "Iron Plate", quantity: "3", quantityPerMin: "90" },
      { item: "Coal", quantity: "1", quantityPerMin: "30" },
    ],
  },
  {
    type: "Component",
    name: "Steel Cable",
    outputPerMin: "30",
    icon: "/recipes/Steel Cable.png",
    ingredients: [{ item: "Iron Bar", quantity: "3", quantityPerMin: "90" }],
  },
  {
    type: "Component",
    name: "Supercomputer",
    outputPerMin: "6",
    icon: "/recipes/Supercomputer.png",
    ingredients: [
      { item: "Circuit Board", quantity: "3", quantityPerMin: "18" },
      { item: "Lightweight Frame", quantity: "1", quantityPerMin: "6" },
      { item: "Battery", quantity: "1", quantityPerMin: "6" },
    ],
  },
  {
    type: "Component",
    name: "Winch",
    outputPerMin: "15",
    icon: "/recipes/Winch.png",
    ingredients: [
      { item: "Heavy Duty Motor", quantity: "1", quantityPerMin: "15" },
      { item: "Steel Cable", quantity: "2", quantityPerMin: "30" },
    ],
  },
  {
    type: "Component",
    name: "Copper Bar",
    outputPerMin: "45",
    icon: "/recipes/Copper Bar.png",
    ingredients: [{ item: "Copper Ore", quantity: "1", quantityPerMin: "45" }],
  },
  {
    type: "Component",
    name: "Iron Bar",
    outputPerMin: "45",
    icon: "/recipes/Iron Bar.png",
    ingredients: [{ item: "Iron Ore", quantity: "1", quantityPerMin: "45" }],
  },
  // Materials
  {
    type: "Material",
    name: "Plastic Bar",
    outputPerMin: "30",
    icon: "/recipes/Plastic Bar.png",
    ingredients: [
      { item: "Plastic Scraps", quantity: "2", quantityPerMin: "60" },
      { item: "Coal", quantity: "1", quantityPerMin: "30" },
    ],
  },
  {
    type: "Material",
    name: "Plastic Scraps",
    outputPerMin: "10",
    icon: "/recipes/Plastic Scraps.png",
    ingredients: [
      { item: "Computer Tower", quantity: "1", quantityPerMin: "10" },
      { item: "Computer Monitor", quantity: "1", quantityPerMin: "10" },
    ],
  },
  // Repair
  {
    type: "Repair",
    name: "Boardwalk Plank",
    outputPerMin: "10",
    icon: "/recipes/Boardwalk Plank.png",
    ingredients: [
      { item: "Wood", quantity: "2", quantityPerMin: "20" },
      { item: "Iron Plate", quantity: "1", quantityPerMin: "10" },
    ],
  },
  {
    type: "Repair",
    name: "Roof Tile",
    outputPerMin: "10",
    icon: "/recipes/Roof Tile.png",
    ingredients: [
      { item: "Stone", quantity: "3", quantityPerMin: "30" },
      { item: "Steel Beam", quantity: "1", quantityPerMin: "10" },
    ],
  },
]

export async function fetchCraftingData(): Promise<CraftRecipe[]> {
  // Return hardcoded recipes with icon paths
  return CRAFTING_RECIPES
}

export function getAllMaterials(recipes: CraftRecipe[]): string[] {
  const materials = new Set<string>()

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      materials.add(ingredient.item)
    })
  })

  return Array.from(materials).sort()
}

export function getAllOutputs(recipes: CraftRecipe[]): string[] {
  return recipes.map((recipe) => recipe.name).sort()
}

export function findRecipesByOutput(recipes: CraftRecipe[], output: string): CraftRecipe[] {
  return recipes.filter((recipe) => recipe.name === output)
}

export function findRecipesByMaterials(recipes: CraftRecipe[], materials: string[]): CraftRecipe[] {
  if (materials.length === 0) return []

  return recipes.filter((recipe) => {
    return recipe.ingredients.some((ingredient) => materials.includes(ingredient.item))
  })
}
