/**
 * Optimal Production Calculator
 * 
 * Calculates the required production rates for each node in a production chain
 * by traversing backward from machinery/consumer nodes to resource/producer nodes.
 */

import type { Node, Edge } from "@xyflow/react"
import type { RecipeNodeData, OptimalProductionMap, OptimalProductionData, CraftRecipe } from "./types"

/**
 * Calculate optimal production requirements for all nodes in the graph
 * 
 * Algorithm:
 * 1. Build adjacency lists for forward and backward traversal
 * 2. Identify consumer nodes (nodes with no outgoing edges or machinery type)
 * 3. For each consumer, traverse backward collecting requirements
 * 4. Aggregate requirements when multiple paths converge
 * 5. Detect cycles and mark affected nodes
 */
export function calculateOptimalProduction(
    nodes: Node<RecipeNodeData>[],
    edges: Edge[],
    recipes: CraftRecipe[]
): OptimalProductionMap {
    const result: OptimalProductionMap = new Map()

    // Build recipe lookup map for fast access
    const recipeMap = new Map<string, CraftRecipe>()
    recipes.forEach(recipe => recipeMap.set(recipe.name, recipe))

    // Build adjacency lists
    const outgoingEdges = new Map<string, Edge[]>() // nodeId -> edges going out
    const incomingEdges = new Map<string, Edge[]>() // nodeId -> edges coming in

    edges.forEach(edge => {
        // Outgoing edges (from source)
        if (!outgoingEdges.has(edge.source)) {
            outgoingEdges.set(edge.source, [])
        }
        outgoingEdges.get(edge.source)!.push(edge)

        // Incoming edges (to target)
        if (!incomingEdges.has(edge.target)) {
            incomingEdges.set(edge.target, [])
        }
        incomingEdges.get(edge.target)!.push(edge)
    })

    // Node lookup for quick access
    const nodeMap = new Map<string, Node<RecipeNodeData>>()
    nodes.forEach(node => nodeMap.set(node.id, node))

    // Track requirements per node (aggregated from all consumers)
    const requirements = new Map<string, Array<{
        nodeId: string
        nodeName: string
        requiredAmount: number
    }>>()

    /**
     * Traverse backward from a consumer node to calculate requirements
     * Uses DFS with cycle detection
     */
    function traverseBackward(
        nodeId: string,
        visited: Set<string>,
        cycleNodes: Set<string>
    ): void {
        // Cycle detection
        if (visited.has(nodeId)) {
            cycleNodes.add(nodeId)
            return
        }

        visited.add(nodeId)

        const node = nodeMap.get(nodeId)
        if (!node) return

        const recipe = node.data.recipe
        const incoming = incomingEdges.get(nodeId) || []

        // For each incoming edge (ingredient), calculate requirement
        incoming.forEach(edge => {
            const sourceNodeId = edge.source
            const sourceNode = nodeMap.get(sourceNodeId)
            if (!sourceNode) return

            const sourceRecipe = sourceNode.data.recipe

            // Find the ingredient this edge represents
            // The edge's targetHandle tells us which input (e.g., "input-0")
            const targetHandleId = edge.targetHandle || ""
            const ingredientIndex = targetHandleId.startsWith("input-")
                ? parseInt(targetHandleId.split("-")[1])
                : 0

            const ingredient = recipe.ingredients[ingredientIndex]
            if (!ingredient) return

            // Parse quantityPerMin (handle "N/A" and invalid values)
            const quantityPerMin = parseFloat(ingredient.quantityPerMin)
            if (isNaN(quantityPerMin) || quantityPerMin <= 0) return

            // Add requirement for the source node
            if (!requirements.has(sourceNodeId)) {
                requirements.set(sourceNodeId, [])
            }

            requirements.get(sourceNodeId)!.push({
                nodeId: nodeId,
                nodeName: recipe.name,
                requiredAmount: quantityPerMin,
            })

            // Continue traversing backward
            traverseBackward(sourceNodeId, new Set(visited), cycleNodes)
        })

        visited.delete(nodeId) // Backtrack for other paths
    }

    // Identify all consumer nodes (machinery or nodes with no outgoing edges)
    const consumerNodes = nodes.filter(node => {
        const hasOutgoing = outgoingEdges.has(node.id) && outgoingEdges.get(node.id)!.length > 0
        const isMachinery = node.data.recipe.type === "Machinery"
        return !hasOutgoing || isMachinery
    })

    // Traverse from each consumer node
    const allCycleNodes = new Set<string>()
    consumerNodes.forEach(consumerNode => {
        const visited = new Set<string>()
        const cycleNodes = new Set<string>()
        traverseBackward(consumerNode.id, visited, cycleNodes)

        cycleNodes.forEach(nodeId => allCycleNodes.add(nodeId))
    })

    // Calculate aggregated requirements and status for each node
    nodes.forEach(node => {
        const nodeId = node.id
        const recipe = node.data.recipe

        // Check if node is in a cycle
        if (allCycleNodes.has(nodeId)) {
            result.set(nodeId, {
                requiredPerMin: 0,
                status: "cycle",
                consumers: [],
            })
            return
        }

        // Check if node has any requirements
        const nodeRequirements = requirements.get(nodeId) || []

        if (nodeRequirements.length === 0) {
            // No downstream consumers
            result.set(nodeId, {
                requiredPerMin: 0,
                status: "disconnected",
                consumers: [],
            })
            return
        }

        // Calculate total required production
        const totalRequired = nodeRequirements.reduce(
            (sum, req) => sum + req.requiredAmount,
            0
        )

        // Parse node's output rate
        const outputPerMin = parseFloat(recipe.outputPerMin)
        const hasValidOutput = !isNaN(outputPerMin) && outputPerMin > 0

        // Determine status
        let status: OptimalProductionData["status"] = "disconnected"

        if (hasValidOutput && totalRequired > 0) {
            if (outputPerMin >= totalRequired) {
                // Check if significantly excess (>10% margin)
                if (outputPerMin > totalRequired * 1.1) {
                    status = "excess"
                } else {
                    status = "optimal"
                }
            } else {
                status = "deficit"
            }
        } else if (totalRequired > 0) {
            // Has requirements but invalid output - treat as deficit
            status = "deficit"
        }

        result.set(nodeId, {
            requiredPerMin: totalRequired,
            status,
            consumers: nodeRequirements,
        })
    })

    return result
}

/**
 * Helper function to parse numeric values with fallback
 */
function parseNumericValue(value: string, fallback: number = 0): number {
    if (value === "N/A" || value === "") return fallback
    const parsed = parseFloat(value)
    return isNaN(parsed) ? fallback : parsed
}

