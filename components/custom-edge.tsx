"use client"

import { useCallback } from "react"
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow, type EdgeProps } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    markerEnd,
    style,
}: EdgeProps) {
    const { setEdges } = useReactFlow()
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    const onDelete = useCallback(() => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id))
    }, [id, setEdges])

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
            {selected && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: "all",
                        }}
                        className="nodrag nopan"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="h-7 w-7 p-0 bg-background/90 hover:bg-destructive hover:text-destructive-foreground border border-border shadow-md backdrop-blur-sm"
                            title="Delete connection (or press Del)"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    )
}

