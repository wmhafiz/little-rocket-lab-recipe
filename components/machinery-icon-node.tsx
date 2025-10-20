"use client"

import { memo } from "react"
import { Handle, Position, NodeToolbar, type NodeProps } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { RecipeNodeData } from "@/lib/types"
import Image from "next/image"

/**
 * MachineryIconNode - Compact icon-only node for machinery (end products)
 * Displays only input handles (left side) since machinery are end products with no outputs
 */
export const MachineryIconNode = memo(({ data, id }: NodeProps<RecipeNodeData>) => {
    const { recipe, onDelete } = data
    const ingredientCount = recipe.ingredients.length

    // Calculate vertical spacing for input handles
    const nodeHeight = 64 // 16 * 4 (w-16 h-16)
    const handleSpacing = ingredientCount > 0 ? nodeHeight / (ingredientCount + 1) : nodeHeight / 2

    return (
        <>
            <NodeToolbar
                isVisible={data.selected}
                position={Position.Top}
                offset={10}
                className="flex gap-1 bg-background border border-border rounded-lg shadow-lg p-1"
            >
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
                    <Handle
                        key={`input-${index}`}
                        type="target"
                        position={Position.Left}
                        id={`input-${index}`}
                        style={{ top: `${handleSpacing * (index + 1)}px` }}
                        className="!w-3 !h-3 !bg-primary !border-2 !border-background dark:!border-card"
                    />
                ))}
            </div>
        </>
    )
})

MachineryIconNode.displayName = "MachineryIconNode"

