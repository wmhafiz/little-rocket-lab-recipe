"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Pencil, Trash2, Save, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SlotInfo } from "@/lib/slot-storage"

export interface SlotSelectorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: "save" | "load"
    slots: SlotInfo[]
    currentSlot: number
    onSave?: (slotIndex: number, title: string, description: string) => void
    onLoad?: (slotIndex: number) => void
    onEdit?: (slotIndex: number, title: string, description: string) => void
    onDelete?: (slotIndex: number) => void
}

export function SlotSelectorDialog({
    open,
    onOpenChange,
    mode,
    slots,
    currentSlot,
    onSave,
    onLoad,
    onEdit,
    onDelete,
}: SlotSelectorDialogProps) {
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editingSlot, setEditingSlot] = useState<number | null>(null)
    const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<number | null>(null)
    const [overwriteConfirmSlot, setOverwriteConfirmSlot] = useState<number | null>(null)
    const [titleError, setTitleError] = useState("")

    const handleSlotClick = (slotIndex: number) => {
        if (mode === "save") {
            setSelectedSlot(slotIndex)
            const slot = slots[slotIndex]

            // If slot is occupied, show overwrite confirmation
            if (!slot.isEmpty) {
                setOverwriteConfirmSlot(slotIndex)
                return
            }

            // Show form for new save
            setTitle("")
            setDescription("")
            setShowForm(true)
            setTitleError("")
        } else if (mode === "load") {
            // Load mode - only allow loading occupied slots
            if (!slots[slotIndex].isEmpty && onLoad) {
                onLoad(slotIndex)
                onOpenChange(false)
            }
        }
    }

    const handleEdit = (slotIndex: number, e: React.MouseEvent) => {
        e.stopPropagation()
        const slot = slots[slotIndex]
        setEditingSlot(slotIndex)
        setTitle(slot.title)
        setDescription(slot.description)
        setTitleError("")
    }

    const handleDelete = (slotIndex: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setDeleteConfirmSlot(slotIndex)
    }

    const confirmDelete = () => {
        if (deleteConfirmSlot !== null && onDelete) {
            onDelete(deleteConfirmSlot)
            setDeleteConfirmSlot(null)
            // If we deleted the only slot being viewed, close dialog
            const remainingSlots = slots.filter((s) => !s.isEmpty && s.index !== deleteConfirmSlot)
            if (mode === "load" && remainingSlots.length === 0) {
                onOpenChange(false)
            }
        }
    }

    const confirmOverwrite = () => {
        if (overwriteConfirmSlot !== null) {
            setSelectedSlot(overwriteConfirmSlot)
            const slot = slots[overwriteConfirmSlot]
            setTitle(slot.title)
            setDescription(slot.description)
            setShowForm(true)
            setOverwriteConfirmSlot(null)
            setTitleError("")
        }
    }

    const validateAndSubmit = () => {
        const trimmedTitle = title.trim()

        if (!trimmedTitle) {
            setTitleError("Title is required")
            return
        }

        if (trimmedTitle.length > 50) {
            setTitleError("Title must be 50 characters or less")
            return
        }

        if (description.length > 200) {
            setTitleError("Description must be 200 characters or less")
            return
        }

        if (editingSlot !== null && onEdit) {
            onEdit(editingSlot, trimmedTitle, description)
            setEditingSlot(null)
            setTitle("")
            setDescription("")
            setTitleError("")
        } else if (selectedSlot !== null && onSave) {
            onSave(selectedSlot, trimmedTitle, description)
            setSelectedSlot(null)
            setShowForm(false)
            setTitle("")
            setDescription("")
            setTitleError("")
            onOpenChange(false)
        }
    }

    const cancelForm = () => {
        setShowForm(false)
        setEditingSlot(null)
        setSelectedSlot(null)
        setTitle("")
        setDescription("")
        setTitleError("")
    }

    const formatDate = (isoString: string) => {
        if (!isoString) return ""
        const date = new Date(isoString)
        return date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
    }

    // Filter slots based on mode
    const displaySlots = mode === "load" ? slots.filter((s) => !s.isEmpty) : slots

    return (
        <>
            <Dialog open={open && !showForm && editingSlot === null} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>{mode === "save" ? "Save As" : "Load Design"}</DialogTitle>
                        <DialogDescription>
                            {mode === "save"
                                ? "Select a slot to save your current design"
                                : "Select a design to load"}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-2">
                            {displaySlots.map((slot) => (
                                <Card
                                    key={slot.index}
                                    className={cn(
                                        "p-4 cursor-pointer hover:border-primary transition-colors",
                                        currentSlot === slot.index && "border-primary bg-primary/5",
                                    )}
                                    onClick={() => handleSlotClick(slot.index)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-muted-foreground">Slot {slot.index}</span>
                                                {currentSlot === slot.index && (
                                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold truncate">
                                                {slot.isEmpty ? "Empty Slot" : slot.title}
                                            </h4>
                                            {!slot.isEmpty && (
                                                <>
                                                    {slot.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                            {slot.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {formatDate(slot.lastModified)}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {!slot.isEmpty && (
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleEdit(slot.index, e)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleDelete(slot.index, e)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Save/Edit Form Dialog */}
            <Dialog open={showForm || editingSlot !== null} onOpenChange={(open) => !open && cancelForm()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSlot !== null ? "Edit Slot Metadata" : `Save to Slot ${selectedSlot}`}
                        </DialogTitle>
                        <DialogDescription>
                            {editingSlot !== null
                                ? "Update the title and description for this slot"
                                : "Give your design a title and optional description"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value)
                                    setTitleError("")
                                }}
                                placeholder="Enter a title..."
                                maxLength={50}
                                className={titleError ? "border-destructive" : ""}
                            />
                            {titleError && <p className="text-sm text-destructive">{titleError}</p>}
                            <p className="text-xs text-muted-foreground">{title.length}/50 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description..."
                                maxLength={200}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">{description.length}/200 characters</p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={cancelForm}>
                                Cancel
                            </Button>
                            <Button onClick={validateAndSubmit}>
                                <Save className="w-4 h-4 mr-2" />
                                {editingSlot !== null ? "Update" : "Save"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmSlot !== null} onOpenChange={(open) => !open && setDeleteConfirmSlot(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Slot?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteConfirmSlot !== null ? slots[deleteConfirmSlot].title : ""}"?
                            <br />
                            <span className="font-semibold text-destructive">This action cannot be undone.</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteConfirmSlot(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Overwrite Confirmation Dialog */}
            <Dialog
                open={overwriteConfirmSlot !== null}
                onOpenChange={(open) => !open && setOverwriteConfirmSlot(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Overwrite Existing Slot?</DialogTitle>
                        <DialogDescription>
                            Slot {overwriteConfirmSlot} already contains "{overwriteConfirmSlot !== null ? slots[overwriteConfirmSlot].title : ""}".
                            <br />
                            Last modified: {overwriteConfirmSlot !== null ? formatDate(slots[overwriteConfirmSlot].lastModified) : ""}
                            <br />
                            <br />
                            Do you want to overwrite it?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOverwriteConfirmSlot(null)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmOverwrite}>
                            <Save className="w-4 h-4 mr-2" />
                            Overwrite
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

