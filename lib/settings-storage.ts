import type { DesignerSettings } from "./types"

const SETTINGS_KEY = "lrl-designer-settings"

const DEFAULT_SETTINGS: DesignerSettings = {
    showResourceIconNodes: true,
    showMachineryIconNodes: true,
    autoIconOnlyMode: true,
    iconOnlyZoomThreshold: 0.75,
}

/**
 * Validate settings values to ensure they are within acceptable ranges
 */
function validateSettings(settings: Partial<DesignerSettings>): DesignerSettings {
    const validated: DesignerSettings = { ...DEFAULT_SETTINGS }

    // Validate boolean settings
    if (typeof settings.showResourceIconNodes === "boolean") {
        validated.showResourceIconNodes = settings.showResourceIconNodes
    }
    if (typeof settings.showMachineryIconNodes === "boolean") {
        validated.showMachineryIconNodes = settings.showMachineryIconNodes
    }
    if (typeof settings.autoIconOnlyMode === "boolean") {
        validated.autoIconOnlyMode = settings.autoIconOnlyMode
    }

    // Validate zoom threshold (must be between 0.25 and 1.0)
    if (typeof settings.iconOnlyZoomThreshold === "number") {
        const threshold = settings.iconOnlyZoomThreshold
        if (threshold >= 0.25 && threshold <= 1.0) {
            validated.iconOnlyZoomThreshold = threshold
        } else {
            console.warn(
                `Invalid iconOnlyZoomThreshold: ${threshold}. Using default: ${DEFAULT_SETTINGS.iconOnlyZoomThreshold}`
            )
        }
    }

    return validated
}

/**
 * Load settings from localStorage
 * Returns default settings if none exist or if parsing fails
 */
export function loadSettings(): DesignerSettings {
    if (typeof window === "undefined") {
        return DEFAULT_SETTINGS
    }

    try {
        const stored = localStorage.getItem(SETTINGS_KEY)
        if (!stored) {
            return DEFAULT_SETTINGS
        }

        const parsed = JSON.parse(stored)
        return validateSettings(parsed)
    } catch (error) {
        console.error("Failed to load settings from localStorage:", error)
        return DEFAULT_SETTINGS
    }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: DesignerSettings): void {
    if (typeof window === "undefined") {
        return
    }

    try {
        const validated = validateSettings(settings)
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(validated))
    } catch (error) {
        console.error("Failed to save settings to localStorage:", error)
    }
}

/**
 * Get default settings
 */
export function getDefaultSettings(): DesignerSettings {
    return { ...DEFAULT_SETTINGS }
}

