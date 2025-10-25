"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRightToLine, FolderOpen, Save, FolderPlus, Files, Trash2, Settings, Info } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export interface MobileMenuSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAutoBuild: () => void
    onAutoLayout: () => void
    onRestore: () => void
    onSave: () => void
    onSaveAs: () => void
    onLoad: () => void
    onClearCanvas: () => void
    onSettings?: () => void
    onAbout?: () => void
    isAutoBuilding: boolean
}

export function MobileMenuSheet({
    open,
    onOpenChange,
    onAutoBuild,
    onAutoLayout,
    onRestore,
    onSave,
    onSaveAs,
    onLoad,
    onClearCanvas,
    onSettings,
    onAbout,
    isAutoBuilding,
}: MobileMenuSheetProps) {
    const handleAction = (action: () => void) => {
        action()
        onOpenChange(false) // Auto-close menu after action
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Controls</SheetTitle>
                    <SheetDescription>Production designer actions and settings</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-2 mt-6">
                    <Button
                        variant="secondary"
                        className="w-full justify-start gap-2"
                        onClick={() => handleAction(onAutoBuild)}
                        disabled={isAutoBuilding}
                    >
                        <Sparkles className="w-4 h-4" />
                        {isAutoBuilding ? "Building..." : "Auto Build"}
                    </Button>

                    <Button
                        variant="secondary"
                        className="w-full justify-start gap-2"
                        onClick={() => handleAction(onAutoLayout)}
                    >
                        <ArrowRightToLine className="w-4 h-4" />
                        Auto Layout
                    </Button>

                    <div className="h-px bg-border my-2" />

                    <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => handleAction(onRestore)}>
                        <FolderOpen className="w-4 h-4" />
                        Restore
                    </Button>

                    <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => handleAction(onSave)}>
                        <Save className="w-4 h-4" />
                        Save
                    </Button>

                    <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => handleAction(onSaveAs)}>
                        <FolderPlus className="w-4 h-4" />
                        Save As
                    </Button>

                    <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => handleAction(onLoad)}>
                        <Files className="w-4 h-4" />
                        Load
                    </Button>

                    <div className="h-px bg-border my-2" />

                    <Button
                        variant="destructive"
                        className="w-full justify-start gap-2"
                        onClick={() => handleAction(onClearCanvas)}
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Canvas
                    </Button>

                    <div className="h-px bg-border my-2" />

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Theme</span>
                        <ThemeToggle />
                    </div>

                    {onSettings && (
                        <Button
                            variant="secondary"
                            className="w-full justify-start gap-2 mt-2"
                            onClick={() => handleAction(onSettings)}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                    )}

                    {onAbout && (
                        <Button
                            variant="secondary"
                            className="w-full justify-start gap-2"
                            onClick={() => handleAction(onAbout)}
                        >
                            <Info className="w-4 h-4" />
                            About
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

