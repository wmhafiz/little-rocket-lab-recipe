"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { DesignerSettings } from "@/lib/types"

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    settings: DesignerSettings
    onSave: (settings: DesignerSettings) => void
    currentZoom: number
}

export function SettingsDialog({
    open,
    onOpenChange,
    settings,
    onSave,
    currentZoom,
}: SettingsDialogProps) {
    const [localSettings, setLocalSettings] = useState<DesignerSettings>(settings)

    // Update local settings when dialog opens or settings prop changes
    useEffect(() => {
        setLocalSettings(settings)
    }, [settings, open])

    const handleSave = () => {
        onSave(localSettings)
        onOpenChange(false)
    }

    const handleCancel = () => {
        setLocalSettings(settings) // Reset to original settings
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Configure node display preferences and zoom behavior
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Node Display Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Node Display</h3>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="resource-icons" className="text-sm font-medium">
                                    Show Resource nodes as icons
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Display resource nodes (Coal, Iron Ore, etc.) as compact 64x64px icons instead of full cards
                                </p>
                            </div>
                            <Switch
                                id="resource-icons"
                                checked={localSettings.showResourceIconNodes}
                                onCheckedChange={(checked) =>
                                    setLocalSettings({ ...localSettings, showResourceIconNodes: checked })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="machinery-icons" className="text-sm font-medium">
                                    Show Machinery nodes as icons
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Display machinery nodes as compact 64x64px icons instead of full cards
                                </p>
                            </div>
                            <Switch
                                id="machinery-icons"
                                checked={localSettings.showMachineryIconNodes}
                                onCheckedChange={(checked) =>
                                    setLocalSettings({ ...localSettings, showMachineryIconNodes: checked })
                                }
                            />
                        </div>
                    </div>

                    {/* Zoom Behavior Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Zoom Behavior</h3>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="auto-icon-mode" className="text-sm font-medium">
                                    Auto icon-only mode when zoomed out
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically show all nodes as icons when zoom level is below threshold
                                </p>
                            </div>
                            <Switch
                                id="auto-icon-mode"
                                checked={localSettings.autoIconOnlyMode}
                                onCheckedChange={(checked) =>
                                    setLocalSettings({ ...localSettings, autoIconOnlyMode: checked })
                                }
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="zoom-threshold"
                                    className={`text-sm font-medium ${!localSettings.autoIconOnlyMode ? "text-muted-foreground" : ""}`}
                                >
                                    Zoom threshold
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                    {Math.round(localSettings.iconOnlyZoomThreshold * 100)}%
                                </span>
                            </div>
                            <Slider
                                id="zoom-threshold"
                                min={0.25}
                                max={1.0}
                                step={0.05}
                                value={[localSettings.iconOnlyZoomThreshold]}
                                onValueChange={([value]) =>
                                    setLocalSettings({ ...localSettings, iconOnlyZoomThreshold: value })
                                }
                                disabled={!localSettings.autoIconOnlyMode}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                                Current zoom: {Math.round(currentZoom * 100)}%
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

