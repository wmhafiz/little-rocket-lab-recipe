# Add About Menu

## Why

Users need access to version information, release history, and a link to the project repository. Currently, there's no way for users to know which version of the app they're using, what features have been recently added, or where to report issues or contribute. An About menu provides transparency and helps users stay informed about app updates and improvements.

## What Changes

- Add an "About" button in the top-right Panel beside the Settings button
- Create an About dialog displaying:
  - Current app version (from package.json)
  - Last update date
  - Release notes with non-technical descriptions of recently implemented features
  - Link to GitHub repository (https://github.com/wmhafiz/little-rocket-lab-recipe)
- Release notes SHALL be generated from archived OpenSpec proposals with user-friendly language
- About button SHALL be accessible from both desktop panel and mobile hamburger menu
- Dialog SHALL use shadcn/ui Dialog component for consistency

## Impact

### Affected Specs

- `production-designer` (modified - adds new UI element)

### Affected Code

- `components/production-designer-view.tsx` - Add About button in Panel and mobile menu
- `components/about-dialog.tsx` - New component for About dialog UI
- `lib/release-notes.ts` - New utility to store and format release notes
- `lib/version.ts` - New utility to extract version from package.json
- `package.json` - Version source of truth

### User Experience Changes

- Users can view current version and recent changes
- Users have direct link to GitHub for issues and contributions
- Better transparency about app capabilities
- No breaking changes to existing functionality
