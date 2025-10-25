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
  reconnectEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useViewport,
  type Connection,
  type ColorMode,
  type OnConnectEnd,
  type OnConnectStart,
  type OnReconnect,
  BackgroundVariant,
  type Edge,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Search, Trash2, ArrowRightToLine, PanelLeftClose, PanelLeft, Sparkles, Save, FolderOpen, FolderPlus, Files, Menu, Settings, Info } from "lucide-react"
import type { CraftRecipe, RecipeNodeData, OptimalProductionMap, DesignerSettings } from "@/lib/types"
import { DUPLICATABLE_NODE_TYPES } from "@/lib/types"
import { RecipeNode } from "./recipe-node"
import { ResourceIconNode } from "./resource-icon-node"
import { MachineryIconNode } from "./machinery-icon-node"
import { CustomEdge } from "./custom-edge"
import { useTheme } from "@/lib/theme-provider"
import { ThemeToggle } from "./theme-toggle"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SlotSelectorDialog } from "./slot-selector-dialog"
import { MobileMenuSheet } from "./mobile-menu-sheet"
import { toast } from "sonner"
import { calculateOptimalProduction } from "@/lib/optimal-production-calculator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SettingsDialog } from "./settings-dialog"
import { AboutDialog } from "./about-dialog"
import { useSettingsStore, useUIStore, useSlotStore, useFlowStore, useOptimalProductionStore } from "@/lib/stores"

interface ProductionDesignerViewProps {
  recipes: CraftRecipe[]
}

const nodeTypes = {
  recipeNode: RecipeNode,
  resourceIconNode: ResourceIconNode,
  machineryIconNode: MachineryIconNode,
}

const edgeTypes = {
  default: CustomEdge,
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
 * Determine the appropriate node type based on recipe type and settings
 * - Resource nodes: icon nodes if enabled, otherwise full card
 * - Machinery nodes: icon nodes if enabled, otherwise full card
 * - Other nodes: full card display (components, materials, repair)
 */
const getNodeTypeForRecipe = (recipe: CraftRecipe, settings: DesignerSettings): string => {
  if (recipe.type === "Resource") {
    return settings.showResourceIconNodes ? "resourceIconNode" : "recipeNode"
  }
  if (recipe.type === "Machinery") {
    return settings.showMachineryIconNodes ? "machineryIconNode" : "recipeNode"
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
  const [isAutoBuilding, setIsAutoBuilding] = useState(false)

  // Zustand stores
  const settings = useSettingsStore((state) => state.settings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const searchTerm = useUIStore((state) => state.searchTerm)
  const setSearchTerm = useUIStore((state) => state.setSearchTerm)
  const isPanelOpen = useUIStore((state) => state.isPanelOpen)
  const setIsPanelOpen = useUIStore((state) => state.setIsPanelOpen)
  const selectedCategory = useUIStore((state) => state.selectedCategory)
  const setSelectedCategory = useUIStore((state) => state.setSelectedCategory)
  const showSaveAsDialog = useUIStore((state) => state.showSaveAsDialog)
  const closeSaveAsDialog = useUIStore((state) => state.closeSaveAsDialog)
  const openSaveAsDialog = useUIStore((state) => state.openSaveAsDialog)
  const showLoadDialog = useUIStore((state) => state.showLoadDialog)
  const closeLoadDialog = useUIStore((state) => state.closeLoadDialog)
  const openLoadDialog = useUIStore((state) => state.openLoadDialog)
  const showSettingsDialog = useUIStore((state) => state.showSettingsDialog)
  const closeSettingsDialog = useUIStore((state) => state.closeSettingsDialog)
  const openSettingsDialog = useUIStore((state) => state.openSettingsDialog)
  const showAboutDialog = useUIStore((state) => state.showAboutDialog)
  const closeAboutDialog = useUIStore((state) => state.closeAboutDialog)
  const openAboutDialog = useUIStore((state) => state.openAboutDialog)
  const showMobileMenu = useUIStore((state) => state.showMobileMenu)
  const closeMobileMenu = useUIStore((state) => state.closeMobileMenu)
  const openMobileMenu = useUIStore((state) => state.openMobileMenu)
  const rfInstance = useFlowStore((state) => state.rfInstance)
  const setRfInstance = useFlowStore((state) => state.setRfInstance)
  const optimalProduction = useOptimalProductionStore((state) => state.optimalProduction)
  const setOptimalProduction = useOptimalProductionStore((state) => state.setOptimalProduction)
  const currentSlot = useSlotStore((state) => state.currentSlot)
  const setCurrentSlot = useSlotStore((state) => state.setCurrentSlot)
  const slots = useSlotStore((state) => state.slots)
  const refreshSlots = useSlotStore((state) => state.refreshSlots)
  const saveFlow = useSlotStore((state) => state.saveFlow)
  const loadFlow = useSlotStore((state) => state.loadFlow)
  const deleteSlotFromStore = useSlotStore((state) => state.deleteSlot)
  const editSlotMetadata = useSlotStore((state) => state.editSlotMetadata)
  const migrateOldStorage = useSlotStore((state) => state.migrateOldStorage)

  const { theme } = useTheme()
  const { screenToFlowPosition, fitView, deleteElements, setViewport } = useReactFlow()
  const viewport = useViewport()
  const connectionState = useRef<ConnectionState>({
    nodeId: null,
    handleId: null,
    handleType: null,
    material: null,
  })

  // Run migration and load slot metadata on mount
  useEffect(() => {
    migrateOldStorage()
    refreshSlots()
  }, [migrateOldStorage, refreshSlots])

  // Calculate optimal production requirements when nodes or edges change
  useEffect(() => {
    const calculations = calculateOptimalProduction(nodes, edges, recipes)
    setOptimalProduction(calculations)
  }, [nodes, edges, recipes, setOptimalProduction])

  // Determine if icon-only mode should be active based on zoom and settings
  const iconOnlyMode = useMemo(() => {
    return settings.autoIconOnlyMode && viewport.zoom < settings.iconOnlyZoomThreshold
  }, [settings.autoIconOnlyMode, settings.iconOnlyZoomThreshold, viewport.zoom])

  // Update nodes when settings change to apply new node types
  useEffect(() => {
    setNodes((nds: Node<RecipeNodeData>[]) =>
      nds.map((node: Node<RecipeNodeData>) => ({
        ...node,
        type: getNodeTypeForRecipe(node.data.recipe, settings),
        data: {
          ...node.data,
          iconOnlyMode,
        },
      }))
    )
  }, [settings, iconOnlyMode, setNodes])

  const existingRecipeNames = useMemo(() => {
    return new Set(nodes.map((node: Node<RecipeNodeData>) => node.data.recipe.name))
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
      return nodes.find((node: Node<RecipeNodeData>) => node.data.recipe.name === recipeName)
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
        layoutedNodes.map((n) => ({ name: (n.data as RecipeNodeData).recipe.name, x: n.position.x, y: n.position.y })),
      )

      setNodes(layoutedNodes as Node<RecipeNodeData>[])
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
      setEdges((eds: Edge[]) => addEdge({ ...connection, animated: true }, eds))
    },
    [setEdges],
  )

  const onConnectStart: OnConnectStart = useCallback(
    (_, { nodeId, handleId, handleType }) => {
      const node = nodes.find((n: Node<RecipeNodeData>) => n.id === nodeId)
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
              setEdges((eds: Edge[]) => [...eds, newEdge])
            } else {
              const newNodeId = `${recipe.name}-${Date.now()}`

              const newNode: Node<RecipeNodeData> = {
                id: newNodeId,
                type: getNodeTypeForRecipe(recipe, settings),
                position,
                data: { recipe, label: recipe.name, iconOnlyMode },
              }

              setNodes((nds: Node<RecipeNodeData>[]) => [...nds, newNode])

              const newEdge: Edge = {
                id: `${newNodeId}-${nodeId}`,
                source: newNodeId,
                sourceHandle: "output",
                target: nodeId!,
                targetHandle: handleId!,
                animated: true,
              }

              setEdges((eds: Edge[]) => [...eds, newEdge])
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
              setEdges((eds: Edge[]) => [...eds, newEdge])
            } else {
              const newNodeId = `${recipe.name}-${Date.now()}-${Math.random()}`

              const newNode: Node<RecipeNodeData> = {
                id: newNodeId,
                type: getNodeTypeForRecipe(recipe, settings),
                position,
                data: { recipe, label: recipe.name, iconOnlyMode },
              }

              setNodes((nds: Node<RecipeNodeData>[]) => [...nds, newNode])

              const newEdge: Edge = {
                id: `${nodeId}-${newNodeId}`,
                source: nodeId!,
                sourceHandle: handleId!,
                target: newNodeId,
                targetHandle,
                animated: true,
              }

              setEdges((eds: Edge[]) => [...eds, newEdge])

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
                setNodes((nds: Node<RecipeNodeData>[]) => [...nds, ...newNodesToCreate])
              }
              if (newEdgesToCreate.length > 0) {
                setEdges((eds: Edge[]) => [...eds, ...newEdgesToCreate])
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
      // Check if duplicates are allowed for this recipe type
      const isDuplicatable = DUPLICATABLE_NODE_TYPES.includes(recipe.name as any)

      if (!isDuplicatable && existingRecipeNames.has(recipe.name)) {
        return
      }

      const newNode: Node<RecipeNodeData> = {
        id: `${recipe.name}-${Date.now()}-${Math.random()}`,
        type: getNodeTypeForRecipe(recipe, settings),
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: {
          recipe,
          label: recipe.name,
          iconOnlyMode,
          onDelete: () => { },
        },
      }
      setNodes((nds: Node<RecipeNodeData>[]) => [...nds, newNode])
    },
    [setNodes, existingRecipeNames, settings, iconOnlyMode],
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
        openSaveAsDialog()
        return
      }

      // Save to current slot with existing metadata
      saveFlow(currentSlot, flow, slot.title, slot.description)
      refreshSlots()
      toast.success(`Saved to "${slot.title}"`)
    } catch (error) {
      console.error("Save failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save")
    }
  }, [rfInstance, currentSlot, slots, openSaveAsDialog, saveFlow, refreshSlots])

  // Quick restore from current active slot
  const onRestore = useCallback(() => {
    try {
      const flowData = loadFlow(currentSlot)

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
  }, [currentSlot, setNodes, setEdges, setViewport, slots, loadFlow])

  // Save As - select slot and enter metadata
  const handleSaveAs = useCallback(
    (slotIndex: number, title: string, description: string) => {
      if (!rfInstance) {
        toast.error("Unable to save: Flow not initialized")
        return
      }

      try {
        const flow = rfInstance.toObject()
        saveFlow(slotIndex, flow, title, description)
        setCurrentSlot(slotIndex)
        refreshSlots()
        toast.success(`Saved to slot ${slotIndex}: "${title}"`)
      } catch (error) {
        console.error("Save As failed:", error)
        toast.error(error instanceof Error ? error.message : "Failed to save")
      }
    },
    [rfInstance, saveFlow, setCurrentSlot, refreshSlots],
  )

  // Load - select different slot to load
  const handleLoad = useCallback(
    (slotIndex: number) => {
      try {
        const flowData = loadFlow(slotIndex)

        if (!flowData) {
          toast.error("Slot is empty")
          return
        }

        const { x = 0, y = 0, zoom = 1 } = flowData.viewport || {}
        setNodes(flowData.nodes || [])
        setEdges(flowData.edges || [])
        setViewport({ x, y, zoom }, { duration: 300 })
        setCurrentSlot(slotIndex)

        const slot = slots[slotIndex]
        toast.success(`Loaded "${slot.title}"`)
      } catch (error) {
        console.error("Load failed:", error)
        toast.error(error instanceof Error ? error.message : "Failed to load")
      }
    },
    [setNodes, setEdges, setViewport, slots, loadFlow, setCurrentSlot],
  )

  // Delete slot
  const handleDeleteSlot = useCallback((slotIndex: number) => {
    try {
      deleteSlotFromStore(slotIndex)
      refreshSlots()
      toast.success("Slot deleted")
    } catch (error) {
      console.error("Delete failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete slot")
    }
  }, [deleteSlotFromStore, refreshSlots])

  // Edit slot metadata
  const handleEditSlotMetadata = useCallback((slotIndex: number, title: string, description: string) => {
    try {
      editSlotMetadata(slotIndex, title, description)
      refreshSlots()
      toast.success("Slot metadata updated")
    } catch (error) {
      console.error("Edit failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update metadata")
    }
  }, [editSlotMetadata, refreshSlots])

  const deleteNode = useCallback(
    (nodeId: string) => {
      deleteElements({ nodes: [{ id: nodeId }] })
    },
    [deleteElements],
  )

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find((n: Node<RecipeNodeData>) => n.id === nodeId)
      if (!nodeToDuplicate) return

      const recipe = nodeToDuplicate.data.recipe

      // Check if this node type can be duplicated
      const isDuplicatable = DUPLICATABLE_NODE_TYPES.includes(recipe.name as any)

      if (!isDuplicatable && existingRecipeNames.has(recipe.name)) {
        toast.error(`Cannot duplicate ${recipe.name} - only one instance allowed`)
        return
      }

      const newNode: Node<RecipeNodeData> = {
        ...nodeToDuplicate,
        id: `${recipe.name}-${Date.now()}-${Math.random()}`,
        position: {
          x: nodeToDuplicate.position.x + 50,
          y: nodeToDuplicate.position.y + 50,
        },
        data: {
          ...nodeToDuplicate.data,
        },
        selected: true,
      }

      // Deselect all other nodes and add the new one
      setNodes((nds: Node<RecipeNodeData>[]) => [...nds.map((n: Node<RecipeNodeData>) => ({ ...n, selected: false })), newNode])
      toast.success(`Duplicated ${recipe.name}`)
    },
    [nodes, existingRecipeNames, setNodes],
  )

  const onReconnect: OnReconnect = useCallback(
    (oldEdge, newConnection) => {
      setEdges((els: Edge[]) => reconnectEdge(oldEdge, newConnection, els))
    },
    [setEdges],
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
      nodes.map((n: Node<RecipeNodeData>) => n.data.recipe.name),
    )

    const newNodesToAdd: Node<RecipeNodeData>[] = []
    const newEdgesToAdd: Edge[] = []

    const allRecipeNames = new Set<string>(nodes.map((n: Node<RecipeNodeData>) => n.data.recipe.name))
    const nodesToProcess: Array<{ node: Node<RecipeNodeData>; depth: number; requiresDedicated: boolean }> = []

    // Helper to check if a recipe requires dedicated production lines
    const requiresDedicatedLine = (recipeName: string): boolean => {
      if (!settings.useDedicatedProductionLines) return false

      const normalizedName = recipeName.toLowerCase().replace(/\s+/g, '')
      if (normalizedName === 'gear') return settings.dedicatedLineConsumers.gear
      if (normalizedName === 'bearing') return settings.dedicatedLineConsumers.bearing
      if (normalizedName === 'ironplate') return settings.dedicatedLineConsumers.ironPlate
      if (normalizedName === 'heatsink') return settings.dedicatedLineConsumers.heatsink
      if (normalizedName === 'copperwire') return settings.dedicatedLineConsumers.copperWire
      return false
    }

    nodes.forEach((node: Node<RecipeNodeData>) => {
      nodesToProcess.push({ node, depth: 0, requiresDedicated: requiresDedicatedLine(node.data.recipe.name) })
    })

    console.log("[v0] Processing", nodesToProcess.length, "initial nodes")

    const findNodeByRecipeName = (recipeName: string): Node<RecipeNodeData> | undefined => {
      return (
        nodes.find((n: Node<RecipeNodeData>) => n.data.recipe.name === recipeName) ||
        newNodesToAdd.find((n: Node<RecipeNodeData>) => n.data.recipe.name === recipeName)
      )
    }

    // Track which producer nodes are claimed by dedicated consumers
    // Map: producerNodeId -> Set of consumer node IDs that require dedicated lines
    const dedicatedProducerClaims = new Map<string, Set<string>>()

    // First pass: identify existing connections from producers to dedicated consumers
    nodes.forEach((node: Node<RecipeNodeData>) => {
      if (requiresDedicatedLine(node.data.recipe.name)) {
        node.data.recipe.ingredients.forEach((ingredient: any) => {
          const material = ingredient.item
          const isDuplicatable = DUPLICATABLE_NODE_TYPES.includes(material as any)

          if (isDuplicatable) {
            // Find if this node already has a producer connected
            const producerNode = nodes.find((n: Node<RecipeNodeData>) =>
              n.data.recipe.name === material &&
              edges.some((e: Edge) => e.source === n.id && e.target === node.id)
            )

            if (producerNode) {
              if (!dedicatedProducerClaims.has(producerNode.id)) {
                dedicatedProducerClaims.set(producerNode.id, new Set())
              }
              dedicatedProducerClaims.get(producerNode.id)!.add(node.id)
            }
          }
        })
      }
    })

    while (nodesToProcess.length > 0) {
      const { node: currentNode, depth, requiresDedicated } = nodesToProcess.shift()!
      const recipe = currentNode.data.recipe

      console.log("[v0] Processing node:", recipe.name, "with", recipe.ingredients.length, "ingredients", requiresDedicated ? "(dedicated line)" : "")

      recipe.ingredients.forEach((ingredient: any, ingredientIndex: number) => {
        const material = ingredient.item
        const isDuplicatable = DUPLICATABLE_NODE_TYPES.includes(material as any)

        // If this consumer requires dedicated lines and the material is duplicatable, check if we can reuse
        const shouldCreateDedicated = requiresDedicated && isDuplicatable

        let existingProducerNode: Node<RecipeNodeData> | undefined = undefined

        if (!shouldCreateDedicated) {
          // Normal case: can reuse any producer
          existingProducerNode = findNodeByRecipeName(material)
        } else {
          // Dedicated case: only reuse if not already claimed by another dedicated consumer
          const candidates = [
            ...nodes.filter((n: Node<RecipeNodeData>) => n.data.recipe.name === material),
            ...newNodesToAdd.filter((n: Node<RecipeNodeData>) => n.data.recipe.name === material)
          ]

          existingProducerNode = candidates.find((producer) => {
            const claims = dedicatedProducerClaims.get(producer.id)
            // Can reuse if: no claims, or only claimed by this same consumer
            return !claims || (claims.size === 1 && claims.has(currentNode.id))
          })

          // If we found a producer, claim it for this consumer
          if (existingProducerNode) {
            if (!dedicatedProducerClaims.has(existingProducerNode.id)) {
              dedicatedProducerClaims.set(existingProducerNode.id, new Set())
            }
            dedicatedProducerClaims.get(existingProducerNode.id)!.add(currentNode.id)
            console.log("[v0] Claiming producer", material, "for dedicated consumer", recipe.name)
          } else {
            console.log("[v0] No available producer for", material, "- will create dedicated one for", recipe.name)
          }
        }

        if (existingProducerNode) {
          console.log("[v0] Found existing producer for", material, "- creating edge only", shouldCreateDedicated ? "(dedicated)" : "")
          const edgeId = `${existingProducerNode.id}-${currentNode.id}-${ingredientIndex}`
          const edgeExists = edges.some((e: Edge) => e.id === edgeId) || newEdgesToAdd.some((e: Edge) => e.id === edgeId)

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
          // For non-duplicatable nodes, check if already planned
          if (!isDuplicatable && allRecipeNames.has(material)) {
            console.log("[v0] Recipe", material, "already planned to be added, skipping")
            return
          }

          const producingRecipes = recipes.filter((r) => r.name === material)

          if (producingRecipes.length > 0) {
            const producerRecipe = producingRecipes[0]
            console.log("[v0] Creating new node for", material, shouldCreateDedicated ? "(dedicated)" : "")

            if (!isDuplicatable) {
              allRecipeNames.add(material)
            }

            const newNodeId = `${producerRecipe.name}-${Date.now()}-${Math.random()}`
            const newNode: Node<RecipeNodeData> = {
              id: newNodeId,
              type: getNodeTypeForRecipe(producerRecipe, settings),
              position: {
                x: currentNode.position.x - 350,
                y: currentNode.position.y + (ingredientIndex - recipe.ingredients.length / 2) * 250,
              },
              data: { recipe: producerRecipe, label: producerRecipe.name, iconOnlyMode },
            }

            newNodesToAdd.push(newNode)

            // If this is a dedicated producer, claim it immediately
            // Claim if: parent requires dedicated lines OR the material itself is a dedicated consumer
            const materialIsDedicated = requiresDedicatedLine(material)
            if (shouldCreateDedicated || materialIsDedicated) {
              if (!dedicatedProducerClaims.has(newNodeId)) {
                dedicatedProducerClaims.set(newNodeId, new Set())
              }
              dedicatedProducerClaims.get(newNodeId)!.add(currentNode.id)
              console.log("[v0] Immediately claiming new producer", material, "for dedicated consumer", recipe.name)
            }

            newEdgesToAdd.push({
              id: `${newNodeId}-${currentNode.id}`,
              source: newNodeId,
              sourceHandle: "output",
              target: currentNode.id,
              targetHandle: `input-${ingredientIndex}`,
              animated: true,
            })

            // Check if the newly created node itself requires dedicated lines
            const newNodeRequiresDedicated = requiresDedicatedLine(producerRecipe.name)
            nodesToProcess.push({ node: newNode, depth: depth + 1, requiresDedicated: newNodeRequiresDedicated })
          }
        }
      })
    }

    console.log("[v0] Auto Build complete - adding", newNodesToAdd.length, "nodes and", newEdgesToAdd.length, "edges")
    console.log(
      "[v0] New nodes:",
      newNodesToAdd.map((n: Node<RecipeNodeData>) => n.data.recipe.name),
    )

    if (newNodesToAdd.length > 0 || newEdgesToAdd.length > 0) {
      console.log("[v0] Setting nodes and edges...")
      setNodes((nds: Node<RecipeNodeData>[]) => [...nds, ...newNodesToAdd])
      setEdges((eds: Edge[]) => [...eds, ...newEdgesToAdd])
      console.log("[v0] Auto Build finished - nodes and edges added")
    } else {
      console.log("[v0] No new nodes or edges to add")
    }

    setIsAutoBuilding(false)
  }, [nodes, edges, recipes, setNodes, setEdges, isAutoBuilding, settings])

  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node: Node<RecipeNodeData>) => ({
      ...node,
      data: {
        ...node.data,
        selected: node.selected,
        onDelete: deleteNode,
        onDuplicate: duplicateNode,
        optimalProduction: optimalProduction.get(node.id),
      },
    }))
  }, [nodes, deleteNode, duplicateNode, optimalProduction])

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
        onReconnect={onReconnect}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={theme as ColorMode}
        fitView
        className="h-full w-full"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="opacity-40 dark:opacity-20" />
        <Controls />
        <MiniMap
          nodeColor={(node: Node<RecipeNodeData>) => {
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
            <Button variant="secondary" size="sm" onClick={openSaveAsDialog} className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Save As
            </Button>
            <Button variant="secondary" size="sm" onClick={openLoadDialog} className="gap-2">
              <Files className="w-4 h-4" />
              Load
            </Button>
            <Button variant="destructive" size="sm" onClick={clearCanvas} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear Canvas
            </Button>
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={openSettingsDialog}
              className="rounded-full bg-transparent"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={openAboutDialog}
              className="rounded-full bg-transparent"
              aria-label="About"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile hamburger menu button - visible on mobile only */}
          <Button
            variant="secondary"
            size="sm"
            onClick={openMobileMenu}
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
        onOpenChange={closeSaveAsDialog}
        mode="save"
        slots={slots}
        currentSlot={currentSlot}
        onSave={handleSaveAs}
        onEdit={handleEditSlotMetadata}
        onDelete={handleDeleteSlot}
      />

      <SlotSelectorDialog
        open={showLoadDialog}
        onOpenChange={closeLoadDialog}
        mode="load"
        slots={slots}
        currentSlot={currentSlot}
        onLoad={handleLoad}
        onEdit={handleEditSlotMetadata}
        onDelete={handleDeleteSlot}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={closeSettingsDialog}
        settings={settings}
        onSave={(newSettings) => {
          updateSettings(newSettings)
          toast.success("Settings saved")
        }}
        currentZoom={viewport.zoom}
      />

      {/* About Dialog */}
      <AboutDialog
        open={showAboutDialog}
        onOpenChange={closeAboutDialog}
      />

      {/* Mobile Menu */}
      <MobileMenuSheet
        open={showMobileMenu}
        onOpenChange={closeMobileMenu}
        onAutoBuild={autoBuild}
        onAutoLayout={() => onLayout("horizontal")}
        onRestore={onRestore}
        onSave={onSave}
        onSaveAs={openSaveAsDialog}
        onLoad={openLoadDialog}
        onClearCanvas={clearCanvas}
        onSettings={openSettingsDialog}
        onAbout={openAboutDialog}
        isAutoBuilding={isAutoBuilding}
      />
    </div>
  )
}

export function ProductionDesignerView({ recipes }: ProductionDesignerViewProps) {
  return (
    <TooltipProvider>
      <ReactFlowProvider>
        <ProductionDesignerFlow recipes={recipes} />
      </ReactFlowProvider>
    </TooltipProvider>
  )
}
