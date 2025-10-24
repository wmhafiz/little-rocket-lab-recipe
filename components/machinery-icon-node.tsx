"use client"

import { memo } from "react"
import { Handle, Position, NodeToolbar, useHandleConnections, type NodeProps } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Trash2, AlertTriangle, Copy } from "lucide-react"
import type { RecipeNodeData } from "@/lib/types"
import Image from "next/image"

// Helper component for input handles with connection status
const InputHandle = memo(({ handleId }: { handleId: string }) => {
    const connections = useHandleConnections({ type: "target", id: handleId })
    const isConnected = connections.length > 0

    return (
        <Handle
            type="target"
            position={Position.Left}
            id={handleId}
            className={`!w-3 !h-3 !border-2 !border-background dark:!border-card transition-colors ${isConnected ? "!bg-green-500" : "!bg-red-500"
                }`}
        />
    )
})

InputHandle.displayName = "InputHandle"

/**
 * MachineryIconNode - Compact icon-only node for machinery (end products)
 * Displays only input handles (left side) since machinery are end products with no outputs
 */
export const MachineryIconNode = memo(({ data, id }: NodeProps) => {
    const typedData = data as RecipeNodeData
    const { recipe, onDelete, onDuplicate, optimalProduction, iconOnlyMode } = typedData
    const ingredientCount = recipe.ingredients.length

    // Calculate vertical spacing for input handles
    const nodeHeight = 64 // 16 * 4 (w-16 h-16)
    const handleSpacing = ingredientCount > 0 ? nodeHeight / (ingredientCount + 1) : nodeHeight / 2

    // Helper to get status color classes
    const getStatusColor = (status: string) => {
        switch (status) {
            case "optimal":
                return "bg-green-500 text-white hover:bg-green-600"
            case "deficit":
                return "bg-red-500 text-white hover:bg-red-600"
            case "excess":
                return "bg-yellow-500 text-white hover:bg-yellow-600"
            case "cycle":
                return "bg-orange-500 text-white hover:bg-orange-600"
            default:
                return "bg-gray-500 text-white hover:bg-gray-600"
        }
    }

    // Calculate number of machines needed based on consumption
    const calculateMachinesNeeded = () => {
        if (!optimalProduction || optimalProduction.status === "disconnected") {
            return null
        }

        // For machinery, we need to calculate based on input consumption rate
        // Find the highest consumption rate among all ingredients
        let maxConsumptionRate = 0
        recipe.ingredients.forEach(ingredient => {
            const rate = parseFloat(ingredient.quantityPerMin)
            if (!isNaN(rate) && rate > maxConsumptionRate) {
                maxConsumptionRate = rate
            }
        })

        if (maxConsumptionRate <= 0) {
            return null
        }

        return Math.ceil(optimalProduction.requiredPerMin / maxConsumptionRate)
    }

    // Format tooltip content
    const getTooltipContent = () => {
        if (!optimalProduction) return ""

        const machinesNeeded = calculateMachinesNeeded()
        const consumers = optimalProduction.consumers || []

        let content = `${recipe.name}\n\n`
        content += `Required: ${optimalProduction.requiredPerMin.toFixed(1)}/min\n`

        if (machinesNeeded) {
            content += `Machines needed: ${machinesNeeded}\n`
        }

        if (consumers.length > 0) {
            content += `\nSupplied by:\n`
            consumers.forEach(consumer => {
                content += `  • ${consumer.nodeName}: ${consumer.requiredAmount.toFixed(1)}/min\n`
            })
        }

        return content
    }

    return (
        <>
            <NodeToolbar
                isVisible={typedData.selected}
                position={Position.Top}
                offset={10}
                className="flex gap-1 bg-background border border-border rounded-lg shadow-lg p-1"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate?.(id)}
                    className="h-8 gap-2 hover:bg-primary hover:text-primary-foreground"
                    title="Duplicate node"
                >
                    <Copy className="h-4 w-4" />
                    Duplicate
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(id)}
                    className="h-8 gap-2 hover:bg-destructive hover:text-destructive-foreground"
                    title="Delete node"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </NodeToolbar>

            <div className="relative">
                {/* Production Indicator Badge - Always show for machinery */}
                <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                        <div className="absolute -top-2 -right-2 z-10">
                            {optimalProduction?.status === "cycle" ? (
                                <Badge className={getStatusColor("cycle")} variant="default">
                                    <AlertTriangle className="w-3 h-3" />
                                </Badge>
                            ) : optimalProduction && optimalProduction.status !== "disconnected" ? (
                                <Badge className={`${getStatusColor(optimalProduction.status)} text-xs px-2 py-0.5 font-semibold`} variant="default">
                                    {calculateMachinesNeeded() || optimalProduction.requiredPerMin.toFixed(0)}
                                </Badge>
                            ) : (
                                <Badge className="bg-gray-500 text-white text-xs px-2 py-0.5 font-semibold" variant="default">
                                    1
                                </Badge>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs whitespace-pre-line text-xs">
                        {optimalProduction && optimalProduction.status !== "disconnected"
                            ? getTooltipContent()
                            : `${recipe.name}\n\nMachinery (end product)\nNo production requirements`
                        }
                    </TooltipContent>
                </Tooltip>

                <div
                    className="relative w-16 h-16 rounded-lg border-2 border-border bg-background shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                    title={`${recipe.name}${recipe.ingredients.length > 0 ? `\nInputs: ${recipe.ingredients.map(i => i.item).join(", ")}` : ""}`}
                >
                    {/* Machinery Icon */}
                    <div className="absolute inset-2">
                        <Image
                            src={recipe.icon || "/placeholder.svg"}
                            alt={recipe.name}
                            fill
                            className="object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = "none"
                            }}
                        />
                    </div>

                    {/* Input Handles (left side, distributed vertically) */}
                    {recipe.ingredients.map((ingredient, index) => (
                        <div
                            key={`input-${index}`}
                            style={{ position: 'absolute', left: 0, top: `${handleSpacing * (index + 1)}px` }}
                        >
                            <InputHandle handleId={`input-${index}`} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
})

MachineryIconNode.displayName = "MachineryIconNode"

