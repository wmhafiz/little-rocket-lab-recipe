import packageJson from "@/package.json"

/**
 * Get the current application version from package.json
 */
export function getAppVersion(): string {
    return packageJson.version
}

/**
 * Get the application name from package.json
 */
export function getAppName(): string {
    return packageJson.name
}

