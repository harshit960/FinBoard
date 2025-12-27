# FinBoard

A customizable real-time finance monitoring dashboard built as part of the Web Intern Assignment.

## Assignment Overview

Build a **Customizable Finance Dashboard** that allows users to:
- Create their own real-time finance monitoring dashboard
- Connect to various financial APIs
- Display real-time data through customizable widgets

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router & Turbopack |
| **Tailwind CSS v4** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **Chart.js** | Data visualization |
| **@dnd-kit** | Drag and drop functionality |
| **react-icons** | Icon library |

## Recent Changes

### v1.2.0
- ✨ **Export/Import Dashboard** — Backup and restore your dashboard configuration as JSON
- 🎨 **Theme Switching** — Light, Dark, and System preference modes
- ⚡ **API Response Caching** — 3-minute TTL cache to reduce redundant API calls
- 🔄 **Auto-Retry on Error** — Automatic 3x retry with 3s delay and countdown UI
- 📐 **Drag-to-Resize Widgets** — Resize widgets by dragging the corner handle
- 📋 **Popular Stocks Dropdown** — Quick selection of common stock symbols
- 🚀 **Lazy Loading** — Modals and widgets load on demand
- 🛡️ **Backup Validation** — Import validates JSON structure before applying

### v1.1.0
- Custom API Widget with authentication options
- JSON Explorer for field selection
- Table pagination, search, and filters
- Widget edit/config panel
- Manual refresh button per widget

### v1.0.0
- Initial release with Stock Card, Top Gainers Table, and Price Chart widgets
- Drag-and-drop widget reordering
- Persistent storage with localStorage

## Features Implemented

### Core Dashboard
- [x] **Widget Management** — Add, edit, remove, and rearrange widgets
- [x] **Drag & Drop** — Reorder widgets by dragging
- [x] **Resizable Widgets** — Drag corner handle to resize (1×1, 2×1, 3×1, 1×2, 2×2, 3×2)
- [x] **Persistent Storage** — Dashboard state saved to localStorage
- [x] **Responsive Grid** — Adapts to screen size
- [x] **Lazy Loading** — Widgets and modals load on demand for faster initial load
- [x] **Export/Import** — Backup and restore dashboard configuration

### Widget Types

#### 1. Stock Card
- Real-time stock quote display
- Price, change, volume, high/low metrics
- Visual trend indicators (green/red)
- Popular stocks dropdown (AAPL, MSFT, GOOGL, etc.)

#### 2. Top Gainers Table
- List of top gaining stocks
- **Pagination** — Navigate through pages
- **Search** — Filter by symbol
- **Min Change Filter** — Filter by minimum % change
- **Sortable Columns** — Sort by any column

#### 3. Price Chart
- Line chart showing historical prices
- Time intervals: Daily, Weekly, Monthly
- Dynamic colors based on trend
- Interactive tooltips

#### 4. Custom API Widget
- **Connect to any REST API**
- **Authentication Options:**
  - No auth
  - API Key (query param)
  - API Key (header)
  - Bearer token
- **JSON Explorer** — Browse API response and select fields
- **Display Types:**
  - **Card** — Key-value pairs from single object
  - **Table** — Rows from array data
  - **Chart** — Line chart from time-series
- **Array Path Selection** — Target nested arrays in response
- **Item Index Selection** — Choose specific item from array (card mode)

### Data Management
- [x] **Configurable Refresh Interval** — 30s to 1hr per widget
- [x] **Manual Refresh Button** — Force data refresh anytime
- [x] **Auto-Retry on Error** — 3 retries with 3s delay, shows countdown
- [x] **Loading States** — Skeleton animations while fetching
- [x] **Error States** — Clear error messages with retry option

### UI/UX
- [x] **Theme Switching** — Light, Dark, and System modes
- [x] **Green Accent** 
- [x] **Custom Logo** — FinBoard branding
- [x] **Live Clock** — Current time in header
- [x] **Smooth Animations** — Transitions and hover effects
- [x] **Modal Dialogs** — Add/Edit widget forms
- [x] **Settings Menu** — Theme and backup options

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Configuration

The dashboard uses **Alpha Vantage** for stock data. The demo API key has rate limits (5 calls/min). 

For production, get your own API key at [alphavantage.co](https://www.alphavantage.co/support/#api-key) and create a `.env` file:

```env
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + CSS variables + dark mode
│   ├── layout.tsx       # Root layout with ThemeProvider
│   └── page.tsx         # Dashboard page
├── components/
│   ├── widgets/
│   │   ├── StockCard.tsx
│   │   ├── GainersTable.tsx
│   │   ├── PriceChart.tsx
│   │   └── CustomWidget.tsx
│   ├── AddWidgetModal.tsx
│   ├── EditWidgetModal.tsx
│   ├── DashboardGrid.tsx
│   ├── SortableWidget.tsx
│   ├── Header.tsx          # Logo, theme toggle, export/import
│   ├── ThemeProvider.tsx   # Dark mode logic
│   ├── Modal.tsx
│   └── JsonExplorer.tsx
├── hooks/
│   ├── useStockData.ts     # Data fetching with retry
│   └── useHydration.ts     # SSR hydration
├── services/
│   └── api.ts              # Alpha Vantage API
├── store/
│   ├── dashboardStore.ts   # Widget state
│   └── themeStore.ts       # Theme preference
├── utils/
│   └── configBackup.ts     # Export/import logic
└── types/
    └── index.ts            # TypeScript types
```

## Custom API Examples

Test the Custom API widget with these public APIs:

```
# JSONPlaceholder (no auth)
https://jsonplaceholder.typicode.com/posts
https://jsonplaceholder.typicode.com/users

# CoinGecko Crypto (no auth)
https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd

# Random User (no auth)
https://randomuser.me/api/?results=10
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Drag widget | Click & hold on widget header |
| Resize widget | Drag corner handle |

## Screenshots

The dashboard features:
- Clean header with logo, widget count, theme toggle, and settings menu
- Draggable widget grid with visual feedback
- Edit panel for configuring each widget
- Resize handles on widget corners
- Empty state with helpful guidance
- Export/Import backup functionality


## License

MIT
