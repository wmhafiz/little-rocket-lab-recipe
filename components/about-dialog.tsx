"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Rocket } from "lucide-react"
import { getAppVersion } from "@/lib/version"
import { getAllReleases, getLastUpdateDate } from "@/lib/release-notes"

interface AboutDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
    const version = getAppVersion()
    const lastUpdate = getLastUpdateDate()
    const releases = getAllReleases()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Rocket className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl">Little Rocket Lab Recipes</DialogTitle>
                            <DialogDescription className="text-base">
                                Version {version} • Last updated {lastUpdate}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6">
                        {/* About Section */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">About</h3>
                            <p className="text-sm text-muted-foreground">
                                A visual tool for planning and optimizing complex manufacturing flows, calculate optimal production rates, and save your
                                designs for later use.
                            </p>
                        </div>

                        {/* Release Notes Section */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">What's New</h3>
                            <ScrollArea className="h-[500px]">
                                {releases.map((release) => (
                                    <div key={release.version} className="space-y-2 mb-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-medium">Version {release.version}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(release.date).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <ul className="space-y-1.5 text-sm">
                                            {release.changes.map((change, idx) => (
                                                <li key={idx} className="flex gap-2">
                                                    <span className="text-primary mt-1.5">•</span>
                                                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: change }} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>

                        {/* Links Section */}
                        <div className="space-y-3">
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => window.open("https://github.com/wmhafiz/little-rocket-lab-recipe", "_blank")}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View on GitHub
                                </Button>
                                <p className="text-xs text-muted-foreground px-3">
                                    Report issues, contribute, or view the source code on GitHub
                                </p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

