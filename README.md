# Little Rocket Lab Designer

A visual production line designer for the game Little Rocket Lab. Plan and optimize your factory's production chains with an intuitive drag-and-drop interface.

## Features

### 🎨 Visual Production Design

- **Drag-and-Drop Interface**: Build production chains by dragging recipes from the sidebar onto the canvas
- **Flow-Based Design**: Connect nodes to visualize material flow from resources to machinery
- **Multiple Node Types**:
  - Resource nodes (raw materials like Coal, Iron Ore, Copper Ore)
  - Component nodes (intermediate products like Gears, Bearings)
  - Material nodes (processed materials like Iron Bars, Copper Wire)
  - Machinery nodes (final products and production equipment)
- **Icon and Card Views**: Resources and machinery display as compact icons, while components show detailed cards
- **Auto Layout**: Automatically organize your production lines with hierarchical layout algorithm
- **Interactive Canvas**: Pan, zoom, and rearrange nodes freely

### 💾 Save and Load

- **Multiple Save Slots**: Store up to 10 different production line designs
- **Named Slots**: Give each design a custom title and description
- **Slot Management**: Edit titles, delete slots, and switch between designs
- **Quick Save/Restore**: One-click save and restore for your active design
- **Viewport Persistence**: Saved designs remember your zoom level and canvas position
- **Browser Storage**: All saves persist locally in your browser

### 🎯 Optimal Production Planning

- **Production Indicators**: See how many nodes you need to meet production demands
- **Visual Feedback**: Color-coded badges show whether production is optimal, insufficient, or excessive
- **Detailed Tooltips**: Hover over indicators to see breakdown of requirements by consumer
- **Automatic Calculation**: Production requirements update in real-time as you modify your design
- **Cycle Detection**: Identifies circular dependencies that can't be calculated

### 🔧 Advanced Features

- **Dedicated Production Lines**: Create separate input chains for each consumer (no resource sharing)
  - Configurable for Gears, Bearings, Iron Plate, Heatsink, and Copper Wire
  - Perfect for organizing complex production setups
- **Node Duplication**: Quickly copy nodes with the duplicate button
- **Edge Management**:
  - Delete edges with edge toolbar
  - Reconnect edges by dragging endpoints
  - Visual connection status (red = disconnected, green = connected)
- **Auto Build**: Automatically generate complete production chains for any product
- **Add Node on Edge Drop**: Insert intermediate steps by dropping nodes onto connections

### ⚙️ Customization

- **Display Settings**:
  - Toggle between icon and card views for resources and machinery
  - Auto icon-only mode when zoomed out (configurable threshold)
- **Theme Support**: Switch between light and dark themes
- **Zoom Controls**: Zoom in/out with mouse wheel or on-screen controls
- **Responsive Design**: Full mobile support with hamburger menu for smaller screens

### 📱 Mobile Friendly

- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Touch Support**: Drag, pinch-to-zoom, and tap interactions
- **Mobile Menu**: Hamburger menu provides access to all features on small screens
- **Optimized Controls**: Compact UI that adapts to available screen space

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/wmhafiz/little-rocket-lab-recipe.git
cd little-rocket-lab-designer

# Install dependencies
npm install
# or
pnpm install
# or
yarn install

# Run the development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Basic Usage

1. **Add Nodes**: Drag recipes from the left sidebar onto the canvas
2. **Create Connections**: Click and drag from an output handle (right side) to an input handle (left side)
3. **Auto Build**: Select a machinery node and click "Auto Build" to generate the complete production chain
4. **Save Your Work**: Click "Save" to store your design, or "Save As" to create a new slot
5. **Organize Layout**: Click "Auto Layout" to automatically arrange nodes
6. **Customize**: Open Settings to adjust display preferences and enable dedicated production lines

## Technology Stack

- **Framework**: Next.js 15.2.4 with React 19
- **UI Components**: shadcn/ui with Radix UI primitives
- **Flow Diagram**: ReactFlow (@xyflow/react)
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Type Safety**: TypeScript 5
- **Icons**: Lucide React
- **Layout**: ELK.js (hierarchical graph layout)

## Project Structure

```
little-rocket-lab-designer/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── production-designer-view.tsx   # Main canvas component
│   ├── recipe-node.tsx                # Full card node component
│   ├── resource-icon-node.tsx         # Resource icon node
│   ├── machinery-icon-node.tsx        # Machinery icon node
│   ├── settings-dialog.tsx            # Settings UI
│   ├── slot-selector-dialog.tsx       # Save/load UI
│   └── ...
├── lib/                    # Utilities and data
│   ├── crafting-data.ts   # Recipe definitions
│   ├── types.ts           # TypeScript types
│   ├── stores/            # Zustand state stores
│   └── ...
├── openspec/              # OpenSpec documentation
│   ├── specs/            # Current specifications
│   └── changes/          # Change proposals and archive
└── public/               # Static assets (icons, images)
```

## Contributing

Contributions are welcome! This project uses OpenSpec for spec-driven development.

1. Fork the repository
2. Create a feature branch
3. For new features, create an OpenSpec proposal in `openspec/changes/`
4. Implement your changes following the spec
5. Submit a pull request

See [AGENTS.md](openspec/AGENTS.md) for detailed instructions on creating OpenSpec proposals.

## License

This project is open source and available under the MIT License.

## Links

- **Repository**: [https://github.com/wmhafiz/little-rocket-lab-recipe](https://github.com/wmhafiz/little-rocket-lab-recipe)
- **Game**: Little Rocket Lab (Steam)
- **Deployment**: [https://little-rocket-lab-recipes.vercel.app](https://little-rocket-lab-recipes.vercel.app)

## Credits

Built with ❤️ for the Little Rocket Lab community.
