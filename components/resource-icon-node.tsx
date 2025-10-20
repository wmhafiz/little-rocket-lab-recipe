"use client"

import { memo } from "react"
import { Handle, Position, NodeToolbar, type NodeProps } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { RecipeNodeData } from "@/lib/types"
import Image from "next/image"

/**
 * ResourceIconNode - Compact icon-only node for raw material resources
 * Displays only an output handle (right side) since resources have no inputs
 */
export const ResourceIconNode = memo(({ data, id }: NodeProps<RecipeNodeData>) => {
    const { recipe, onDelete } = data

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
                title={`${recipe.name}${recipe.outputPerMin !== "N/A" ? ` (${recipe.outputPerMin}/min)` : ""}`}
            >
                {/* Resource Icon */}
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

                {/* Output Handle (right side) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    className="!w-3 !h-3 !bg-accent !border-2 !border-background dark:!border-card !top-1/2 !-translate-y-1/2"
                />
            </div>
        </>
    )
})

ResourceIconNode.displayName = "ResourceIconNode"

