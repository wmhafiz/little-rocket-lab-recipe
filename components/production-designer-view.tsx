"use client"

import { useCallback, useState, useMemo, useRef, useEffect } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type ColorMode,
  type OnConnectEnd,
  type OnConnectStart,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Search, Trash2, ArrowRightToLine, PanelLeftClose, PanelLeft, Sparkles, Save, FolderOpen, FolderPlus, Files, Menu } from "lucide-react"
import type { CraftRecipe, RecipeNodeData, OptimalProductionMap } from "@/lib/types"
import { RecipeNode } from "./recipe-node"
import { ResourceIconNode } from "./resource-icon-node"
import { MachineryIconNode } from "./machinery-icon-node"
import { useTheme } from "@/lib/theme-provider"
import { ThemeToggle } from "./theme-toggle"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SlotSelectorDialog } from "./slot-selector-dialog"
import { MobileMenuSheet } from "./mobile-menu-sheet"
import {
  migrateOldStorage,
  getSlotMetadata,
  saveFlowToSlot,
  loadFlowFromSlot,
  deleteSlot,
  editSlotMetadata,
  getCurrentActiveSlot,
  setCurrentActiveSlot,
  type SlotInfo,
  type FlowData,
} from "@/lib/slot-storage"
import { toast } from "sonner"
import { calculateOptimalProduction } from "@/lib/optimal-production-calculator"

interface ProductionDesignerViewProps {
  recipes: CraftRecipe[]
}

const nodeTypes = {
  recipeNode: RecipeNode,
  resourceIconNode: ResourceIconNode,
  machineryIconNode: MachineryIconNode,
}

interface ConnectionState {
  nodeId: string | null
  handleId: string | null
  handleType: "source" | "target" | null
  material: string | null
}

const categorizeRecipes = (recipes: CraftRecipe[]) => {
  const categories = new Map<string, CraftRecipe[]>()

  recipes.forEach((recipe) => {
    const category = recipe.type || "Other"
    if (!categories.has(category)) {
      categories.set(category, [])
    }
    categories.get(category)?.push(recipe)
  })

  return Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}

/**
 * Determine the appropriate node type based on recipe type
 * - Resource nodes: output-only icon nodes (raw materials)
 * - Machinery nodes: input-only icon nodes (end products)
 * - Other nodes: full card display (components, materials, repair)
 */
const getNodeTypeForRecipe = (recipe: CraftRecipe): string => {
  if (recipe.type === "Resource") {
    return "resourceIconNode"
  }
  if (recipe.type === "Machinery") {
    return "machineryIconNode"
  }
  return "recipeNode"
}

/**
 * Get node dimensions based on node type
 * - Icon nodes (resource/machinery): 64x64
 * - Full card nodes: 280x200
 */
const getNodeDimensions = (node: Node): { width: number; height: number } => {
  if (node.type === "resourceIconNode" || node.type === "machineryIconNode") {
    return { width: 64, height: 64 }
  }
  return { width: 280, height: 200 }
}

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: "horizontal" | "vertical" = "horizontal") => {
  const defaultNodeWidth = 280
  const defaultNodeHeight = 200
  const horizontalSpacing = 200
  const verticalSpacing = 150

  // Build adjacency list for graph traversal
  const adjacencyList = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  // Initialize
  nodes.forEach((node) => {
    adjacencyList.set(node.id, [])
    inDegree.set(node.id, 0)
  })

  // Build graph
  edges.forEach((edge) => {
    const sourceId = edge.source
    const targetId = edge.target
    adjacencyList.get(sourceId)?.push(targetId)
    inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1)
  })

  // Topological sort to determine layers (using Kahn's algorithm)
  const layers: string[][] = []
  const queue: string[] = []
  const nodeLayer = new Map<string, number>()

  // Find all nodes with no incoming edges (root nodes)
  nodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id)
      nodeLayer.set(node.id, 0)
    }
  })

  // Process nodes layer by layer
  while (queue.length > 0) {
    const currentLayerSize = queue.length
    const currentLayer: string[] = []

    for (let i = 0; i < currentLayerSize; i++) {
      const nodeId = queue.shift()!
      currentLayer.push(nodeId)

      const neighbors = adjacencyList.get(nodeId) || []
      neighbors.forEach((neighborId) => {
        const newInDegree = (inDegree.get(neighborId) || 0) - 1
        inDegree.set(neighborId, newInDegree)

        if (newInDegree === 0) {
          queue.push(neighborId)
          const currentNodeLayer = nodeLayer.get(nodeId) || 0
          nodeLayer.set(neighborId, currentNodeLayer + 1)
        }
      })
    }

    if (currentLayer.length > 0) {
      layers.push(currentLayer)
    }
  }

  // Handle disconnected nodes (nodes not in any layer yet)
  nodes.forEach((node) => {
    if (!nodeLayer.has(node.id)) {
      if (layers.length === 0) {
        layers.push([])
      }
      layers[0].push(node.id)
      nodeLayer.set(node.id, 0)
    }
  })

  // Position nodes based on layers
  const layoutedNodes = nodes.map((node) => {
    const layer = nodeLayer.get(node.id) || 0
    const nodesInLayer = layers[layer] || []
    const indexInLayer = nodesInLayer.indexOf(node.id)
    const { width: nodeWidth, height: nodeHeight } = getNodeDimensions(node)

    let x: number, y: number

    if (direction === "horizontal") {
      x = layer * (defaultNodeWidth + horizontalSpacing)
      y =
        indexInLayer * (defaultNodeHeight + verticalSpacing) - ((nodesInLayer.length - 1) * (defaultNodeHeight + verticalSpacing)) / 2
    } else {
      // vertical layout
      x =
        indexInLayer * (defaultNodeWidth + horizontalSpacing) -
        ((nodesInLayer.length - 1) * (defaultNodeWidth + horizontalSpacing)) / 2
      y = layer * (defaultNodeHeight + verticalSpacing)
    }

    return {
      ...node,
      position: { x, y },
    }
  })

  return { nodes: layoutedNodes, edges }
}

function ProductionDesignerFlow({ recipes }: ProductionDesignerViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RecipeNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAutoBuilding, setIsAutoBuilding] = useState(false)
  const [rfInstance, setRfInstance] = useState<any>(null)
  const [currentSlot, setCurrentSlot] = useState<number>(0)
  const [slots, setSlots] = useState<SlotInfo[]>([])
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [optimalProduction, setOptimalProduction] = useState<OptimalProductionMap>(new Map())
  const { theme } = useTheme()
  const { screenToFlowPosition, fitView, deleteElements, setViewport } = useReactFlow()
  const connectionState = useRef<ConnectionState>({
    nodeId: null,
    handleId: null,
    handleType: null,
    material: null,
  })

  // Run migration and load slot metadata on mount
  useEffect(() => {
    migrateOldStorage()
    setCurrentSlot(getCurrentActiveSlot())
    setSlots(getSlotMetadata())
  }, [])

  // Calculate optimal production requirements when nodes or edges change
  useEffect(() => {
    const calculations = calculateOptimalProduction(nodes, edges, recipes)
    setOptimalProduction(calculations)
  }, [nodes, edges, recipes])

  const existingRecipeNames = useMemo(() => {
    return new Set(nodes.map((node) => node.data.recipe.name))
  }, [nodes])

  const categorizedRecipes = useMemo(() => categorizeRecipes(recipes), [recipes])

  const filteredRecipes = useMemo(() => {
    let filtered = recipes

    if (selectedCategory) {
      filtered = filtered.filter((recipe) => recipe.type === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter((recipe) => recipe.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    return filtered
  }, [recipes, searchTerm, selectedCategory])

  const findNodeByRecipeName = useCallback(
    (recipeName: string): Node<RecipeNodeData> | undefined => {
      return nodes.find((node) => node.data.recipe.name === recipeName)
    },
    [nodes],
  )

  const findRecipesProducing = useCallback(
    (material: string): CraftRecipe[] => {
      return recipes.filter((recipe) => recipe.name === material)
    },
    [recipes],
  )

  const findRecipesUsing = useCallback(
    (material: string): CraftRecipe[] => {
      return recipes.filter((recipe) => recipe.ingredients.some((ing) => ing.item === material))
    },
    [recipes],
  )

  const onLayout = useCallback(
    (direction: "horizontal" | "vertical") => {
      console.log("[v0] onLayout called with direction:", direction)
      console.log("[v0] Current nodes count:", nodes.length)
      console.log("[v0] Current edges count:", edges.length)

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction)

      console.log("[v0] Layout calculation complete")
      console.log(
        "[v0] Layouted node positions:",
        layoutedNodes.map((n) => ({ name: n.data.recipe.name, x: n.position.x, y: n.position.y })),
      )

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)

      console.log("[v0] State updated, fitting view")
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 })
        console.log("[v0] View fitted")
      }, 50)
    },
    [nodes, edges, setNodes, setEdges, fitView],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds))
    },
    [setEdges],
  )

  const onConnectStart: OnConnectStart = useCallback(
    (_, { nodeId, handleId, handleType }) => {
      const node = nodes.find((n) => n.id === nodeId)
      let material: string | null = null

      if (node && handleId && handleType) {
        const recipe = node.data.recipe

        if (handleType === "source") {
          material = recipe.name
        } else if (handleType === "target" && handleId.startsWith("input-")) {
          const inputIndex = Number.parseInt(handleId.split("-")[1])
          material = recipe.ingredients[inputIndex]?.item || null
        }
      }

      connectionState.current = {
        nodeId,
        handleId,
        handleType,
        material,
      }
    },
    [nodes],
  )

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, reactFlowConnectionState) => {
      if (!reactFlowConnectionState.isValid && connectionState.current.nodeId) {
        const { clientX, clientY } = "changedTouches" in event ? event.changedTouches[0] : event
        const position = screenToFlowPosition({ x: clientX, y: clientY })

        const { nodeId, handleId, handleType, material } = connectionState.current

        if (!material) {
          connectionState.current = { nodeId: null, handleId: null, handleType: null, material: null }
          return
        }

        if (handleType === "target") {
          const producingRecipes = findRecipesProducing(material)

          if (producingRecipes.length > 0) {
            const recipe = producingRecipes[0]
            const existingNode = findNodeByRecipeName(recipe.name)

            if (existingNode) {
              const newEdge: Edge = {
                id: `${existingNode.id}-${nodeId}`,
                source: existingNode.id,
                sourceHandle: "output",
                target: nodeId!,
                targetHandle: handleId!,
                animated: true,
              }
              setEdges((eds) => [...eds, newEdge])
            } else {
              const newNodeId = `${recipe.name}-${Date.now()}`

              const newNode: Node<RecipeNodeData> = {
                id: newNodeId,
                type: getNodeTypeForRecipe(recipe),
                position,
                data: { recipe, label: recipe.name },
              }

              setNodes((nds) => [...nds, newNode])

              const newEdge: Edge = {
                id: `${newNodeId}-${nodeId}`,
                source: newNodeId,
                sourceHandle: "output",
                target: nodeId!,
                targetHandle: handleId!,
                animated: true,
              }

              setEdges((eds) => [...eds, newEdge])
            }
          }
        } else if (handleType === "source") {
          const consumingRecipes = findRecipesUsing(material)

          if (consumingRecipes.length > 0) {
            const recipe = consumingRecipes[0]
            const existingNode = findNodeByRecipeName(recipe.name)

            const inputIndex = recipe.ingredients.findIndex((ing) => ing.item === material)
            const targetHandle = `input-${inputIndex}`

            if (existingNode) {
              const newEdge: Edge = {
                id: `${nodeId}-${existingNode.id}`,
                source: nodeId!,
                sourceHandle: handleId!,
                target: existingNode.id,
                targetHandle,
                animated: true,
              }
              setEdges((eds) => [...eds, newEdge])
            } else {
              const newNodeId = `${recipe.name}-${Date.now()}-${Math.random()}`

              const newNode: Node<RecipeNodeData> = {
                id: newNodeId,
                type: getNodeTypeForRecipe(recipe),
                position,
                data: { recipe, label: recipe.name },
              }

              setNodes((nds) => [...nds, newNode])

              const newEdge: Edge = {
                id: `${nodeId}-${newNodeId}`,
                source: nodeId!,
                sourceHandle: handleId!,
                target: newNodeId,
                targetHandle,
                animated: true,
              }

              setEdges((eds) => [...eds, newEdge])

              const newNodesToCreate: Node<RecipeNodeData>[] = []
              const newEdgesToCreate: Edge[] = []

              recipe.ingredients.forEach((ingredient, idx) => {
                if (ingredient.item === material) return

                const producingRecipes = findRecipesProducing(ingredient.item)
                if (producingRecipes.length > 0) {
                  const inputRecipe = producingRecipes[0]
                  const existingInputNode = findNodeByRecipeName(inputRecipe.name)

                  if (existingInputNode) {
                    const inputEdge: Edge = {
                      id: `${existingInputNode.id}-${newNodeId}-${idx}`,
                      source: existingInputNode.id,
                      sourceHandle: "output",
                      target: newNodeId,
                      targetHandle: `input-${idx}`,
                      animated: true,
                    }
                    newEdgesToCreate.push(inputEdge)
                  } else {
                    const inputNodeId = `${inputRecipe.name}-${Date.now()}-${idx}`

                    const inputNode: Node<RecipeNodeData> = {
                      id: inputNodeId,
                      type: "recipeNode",
                      position: {
                        x: position.x - 350,
                        y: position.y + (idx - recipe.ingredients.length / 2) * 150,
                      },
                      data: { recipe: inputRecipe, label: inputRecipe.name },
                    }

                    newNodesToCreate.push(inputNode)

                    const inputEdge: Edge = {
                      id: `${inputNodeId}-${newNodeId}`,
                      source: inputNodeId,
                      sourceHandle: "output",
                      target: newNodeId,
                      targetHandle: `input-${idx}`,
                      animated: true,
                    }

                    newEdgesToCreate.push(inputEdge)
                  }
                }
              })

              if (newNodesToCreate.length > 0) {
                setNodes((nds) => [...nds, ...newNodesToCreate])
              }
              if (newEdgesToCreate.length > 0) {
                setEdges((eds) => [...eds, ...newEdgesToCreate])
              }
            }
          }
        }
      }

      connectionState.current = { nodeId: null, handleId: null, handleType: null, material: null }
    },
    [screenToFlowPosition, findRecipesProducing, findRecipesUsing, findNodeByRecipeName, setNodes, setEdges],
  )

  const addRecipeNode = useCallback(
    (recipe: CraftRecipe) => {
      if (existingRecipeNames.has(recipe.name)) {
        return
      }

      const newNode: Node<RecipeNodeData> = {
        id: `${recipe.name}-${Date.now()}`,
        type: getNodeTypeForRecipe(recipe),
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          recipe,
          label: recipe.name,
          onDelete: () => { },
        },
      }
      setNodes((nds) => [...nds, newNode])
    },
    [setNodes, existingRecipeNames],
  )

  const clearCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
  }, [setNodes, setEdges])

  // Quick save to current active slot
  const onSave = useCallback(() => {
    if (!rfInstance) {
      toast.error("Unable to save: Flow not initialized")
      return
    }

    try {
      const flow = rfInstance.toObject()
      const slot = slots[currentSlot]

      // If current slot is empty, use "Save As" instead
      if (slot.isEmpty) {
        setShowSaveAsDialog(true)
        return
      }

      // Save to current slot with existing metadata
      saveFlowToSlot(currentSlot, flow, slot.title, slot.description)
      setSlots(getSlotMetadata())
      toast.success(`Saved to "${slot.title}"`)
    } catch (error) {
      console.error("Save failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save")
    }
  }, [rfInstance, currentSlot, slots])

  // Quick restore from current active slot
  const onRestore = useCallback(() => {
    try {
      const flowData = loadFlowFromSlot(currentSlot)

      if (!flowData) {
        toast.error("No saved flow in current slot")
        return
      }

      const { x = 0, y = 0, zoom = 1 } = flowData.viewport || {}
      setNodes(flowData.nodes || [])
      setEdges(flowData.edges || [])
      setViewport({ x, y, zoom }, { duration: 300 })

      const slot = slots[currentSlot]
      toast.success(`Restored "${slot.title}"`)
    } catch (error) {
      console.error("Restore failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to restore")
    }
  }, [currentSlot, setNodes, setEdges, setViewport, slots])

  // Save As - select slot and enter metadata
  const handleSaveAs = useCallback(
    (slotIndex: number, title: string, description: string) => {
      if (!rfInstance) {
        toast.error("Unable to save: Flow not initialized")
        return
      }

      try {
        const flow = rfInstance.toObject()
        saveFlowToSlot(slotIndex, flow, title, description)
        setCurrentActiveSlot(slotIndex)
        setCurrentSlot(slotIndex)
        setSlots(getSlotMetadata())
        toast.success(`Saved to slot ${slotIndex}: "${title}"`)
      } catch (error) {
        console.error("Save As failed:", error)
        toast.error(error instanceof Error ? error.message : "Failed to save")
      }
    },
    [rfInstance],
  )

  // Load - select different slot to load
  const handleLoad = useCallback(
    (slotIndex: number) => {
      try {
        const flowData = loadFlowFromSlot(slotIndex)

        if (!flowData) {
          toast.error("Slot is empty")
          return
        }

        const { x = 0, y = 0, zoom = 1 } = flowData.viewport || {}
        setNodes(flowData.nodes || [])
        setEdges(flowData.edges || [])
        setViewport({ x, y, zoom }, { duration: 300 })
        setCurrentActiveSlot(slotIndex)
        setCurrentSlot(slotIndex)

        const slot = slots[slotIndex]
        toast.success(`Loaded "${slot.title}"`)
      } catch (error) {
        console.error("Load failed:", error)
        toast.error(error instanceof Error ? error.message : "Failed to load")
      }
    },
    [setNodes, setEdges, setViewport, slots],
  )

  // Delete slot
  const handleDeleteSlot = useCallback((slotIndex: number) => {
    try {
      deleteSlot(slotIndex)
      setSlots(getSlotMetadata())
      setCurrentSlot(getCurrentActiveSlot())
      toast.success("Slot deleted")
    } catch (error) {
      console.error("Delete failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete slot")
    }
  }, [])

  // Edit slot metadata
  const handleEditSlotMetadata = useCallback((slotIndex: number, title: string, description: string) => {
    try {
      editSlotMetadata(slotIndex, title, description)
      setSlots(getSlotMetadata())
      toast.success("Slot metadata updated")
    } catch (error) {
      console.error("Edit failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update metadata")
    }
  }, [])

  const deleteNode = useCallback(
    (nodeId: string) => {
      deleteElements({ nodes: [{ id: nodeId }] })
    },
    [deleteElements],
  )

  const autoBuild = useCallback(() => {
    if (isAutoBuilding) {
      console.log("[v0] Auto Build already running, skipping")
      return
    }

    setIsAutoBuilding(true)
    console.log("[v0] Auto Build started")
    console.log(
      "[v0] Current nodes:",
      nodes.map((n) => n.data.recipe.name),
    )

    const newNodesToAdd: Node<RecipeNodeData>[] = []
    const newEdgesToAdd: Edge[] = []

    const allRecipeNames = new Set<string>(nodes.map((n) => n.data.recipe.name))
    const nodesToProcess: Array<{ node: Node<RecipeNodeData>; depth: number }> = []

    nodes.forEach((node) => {
      nodesToProcess.push({ node, depth: 0 })
    })

    console.log("[v0] Processing", nodesToProcess.length, "initial nodes")

    const findNodeByRecipeName = (recipeName: string): Node<RecipeNodeData> | undefined => {
      return (
        nodes.find((n) => n.data.recipe.name === recipeName) ||
        newNodesToAdd.find((n) => n.data.recipe.name === recipeName)
      )
    }

    while (nodesToProcess.length > 0) {
      const { node: currentNode, depth } = nodesToProcess.shift()!
      const recipe = currentNode.data.recipe

      console.log("[v0] Processing node:", recipe.name, "with", recipe.ingredients.length, "ingredients")

      recipe.ingredients.forEach((ingredient, ingredientIndex) => {
        const material = ingredient.item

        const existingProducerNode = findNodeByRecipeName(material)

        if (existingProducerNode) {
          console.log("[v0] Found existing producer for", material, "- creating edge only")
          const edgeId = `${existingProducerNode.id}-${currentNode.id}-${ingredientIndex}`
          const edgeExists = edges.some((e) => e.id === edgeId) || newEdgesToAdd.some((e) => e.id === edgeId)

          if (!edgeExists) {
            newEdgesToAdd.push({
              id: edgeId,
              source: existingProducerNode.id,
              sourceHandle: "output",
              target: currentNode.id,
              targetHandle: `input-${ingredientIndex}`,
              animated: true,
            })
          }
        } else {
          if (allRecipeNames.has(material)) {
            console.log("[v0] Recipe", material, "already planned to be added, skipping")
            return
          }

          const producingRecipes = recipes.filter((r) => r.name === material)

          if (producingRecipes.length > 0) {
            const producerRecipe = producingRecipes[0]
            console.log("[v0] Creating new node for", material)

            allRecipeNames.add(material)

            const newNodeId = `${producerRecipe.name}-${Date.now()}-${Math.random()}`
            const newNode: Node<RecipeNodeData> = {
              id: newNodeId,
              type: getNodeTypeForRecipe(producerRecipe),
              position: {
                x: currentNode.position.x - 350,
                y: currentNode.position.y + (ingredientIndex - recipe.ingredients.length / 2) * 250,
              },
              data: { recipe: producerRecipe, label: producerRecipe.name },
            }

            newNodesToAdd.push(newNode)

            newEdgesToAdd.push({
              id: `${newNodeId}-${currentNode.id}`,
              source: newNodeId,
              sourceHandle: "output",
              target: currentNode.id,
              targetHandle: `input-${ingredientIndex}`,
              animated: true,
            })

            nodesToProcess.push({ node: newNode, depth: depth + 1 })
          }
        }
      })
    }

    console.log("[v0] Auto Build complete - adding", newNodesToAdd.length, "nodes and", newEdgesToAdd.length, "edges")
    console.log(
      "[v0] New nodes:",
      newNodesToAdd.map((n) => n.data.recipe.name),
    )

    if (newNodesToAdd.length > 0 || newEdgesToAdd.length > 0) {
      console.log("[v0] Setting nodes and edges...")
      setNodes((nds) => [...nds, ...newNodesToAdd])
      setEdges((eds) => [...eds, ...newEdgesToAdd])
      console.log("[v0] Auto Build finished - nodes and edges added")
    } else {
      console.log("[v0] No new nodes or edges to add")
    }

    setIsAutoBuilding(false)
  }, [nodes, edges, recipes, setNodes, setEdges, isAutoBuilding])

  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        selected: node.selected,
        onDelete: deleteNode,
        optimalProduction: optimalProduction.get(node.id),
      },
    }))
  }, [nodes, deleteNode, optimalProduction])

  return (
    <div className="relative h-screen w-screen">
      <div
        className={cn(
          "absolute top-4 left-4 z-10 transition-transform duration-300 ease-in-out",
          !isPanelOpen && "-translate-x-[calc(100%+1rem)]",
        )}
      >
        <Card className="w-80 shadow-lg">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Recipes</h2>
                <p className="text-xs text-muted-foreground text-pretty">More coming soon!</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)} className="shrink-0">
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Filter by Category</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {categorizedRecipes.map(([category]) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2 pr-4">
                {filteredRecipes.map((recipe, idx) => {
                  const isDisabled = existingRecipeNames.has(recipe.name)
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 bg-transparent hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => addRecipeNode(recipe)}
                      disabled={isDisabled}
                      title={isDisabled ? "This component is already on the canvas" : "Click to add to canvas"}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative w-8 h-8 shrink-0 rounded-md overflow-hidden bg-secondary/50">
                          <Image
                            src={recipe.icon || "/placeholder.svg"}
                            alt={recipe.name}
                            fill
                            className="object-contain p-0.5"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="font-medium text-sm flex items-center justify-between gap-2">
                            <span className="truncate">{recipe.name}</span>
                            {isDisabled && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Added
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{recipe.type}</div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>

      {!isPanelOpen && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 z-10 shadow-lg"
          onClick={() => setIsPanelOpen(true)}
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
      )}

      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        colorMode={theme as ColorMode}
        fitView
        className="h-full w-full"
      >
        <Background variant="dots" gap={16} size={1} className="opacity-40 dark:opacity-20" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return "hsl(var(--primary))"
          }}
          maskColor="hsl(var(--background) / 0.5)"
        />
        <Panel position="top-right" className="flex gap-2">
          {/* Desktop buttons - hidden on mobile */}
          <div className="hidden lg:flex gap-2">
            <Button variant="secondary" size="sm" onClick={autoBuild} className="gap-2" disabled={isAutoBuilding}>
              <Sparkles className="w-4 h-4" />
              {isAutoBuilding ? "Building..." : "Auto Build"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onLayout("horizontal")} className="gap-2">
              <ArrowRightToLine className="w-4 h-4" />
              Auto Layout
            </Button>
            <Button variant="secondary" size="sm" onClick={onRestore} className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Restore
            </Button>
            <Button variant="secondary" size="sm" onClick={onSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowSaveAsDialog(true)} className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Save As
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowLoadDialog(true)} className="gap-2">
              <Files className="w-4 h-4" />
              Load
            </Button>
            <Button variant="destructive" size="sm" onClick={clearCanvas} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear Canvas
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile hamburger menu button - visible on mobile only */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden gap-2"
          >
            <Menu className="w-4 h-4" />
            Menu
          </Button>
        </Panel>
      </ReactFlow>

      {/* Slot Management Dialogs */}
      <SlotSelectorDialog
        open={showSaveAsDialog}
        onOpenChange={setShowSaveAsDialog}
        mode="save"
        slots={slots}
        currentSlot={currentSlot}
        onSave={handleSaveAs}
        onEdit={handleEditSlotMetadata}
        onDelete={handleDeleteSlot}
      />

      <SlotSelectorDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        mode="load"
        slots={slots}
        currentSlot={currentSlot}
        onLoad={handleLoad}
        onEdit={handleEditSlotMetadata}
        onDelete={handleDeleteSlot}
      />

      {/* Mobile Menu */}
      <MobileMenuSheet
        open={showMobileMenu}
        onOpenChange={setShowMobileMenu}
        onAutoBuild={autoBuild}
        onAutoLayout={() => onLayout("horizontal")}
        onRestore={onRestore}
        onSave={onSave}
        onSaveAs={() => setShowSaveAsDialog(true)}
        onLoad={() => setShowLoadDialog(true)}
        onClearCanvas={clearCanvas}
        isAutoBuilding={isAutoBuilding}
      />
    </div>
  )
}

export function ProductionDesignerView({ recipes }: ProductionDesignerViewProps) {
  return (
    <ReactFlowProvider>
      <ProductionDesignerFlow recipes={recipes} />
    </ReactFlowProvider>
  )
}
