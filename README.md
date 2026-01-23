# YouTrack Issues Viewer

A Next.js application to view YouTrack issues with shadcn/ui styling.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **HTTP Client**: Axios
- **API**: Next.js API Routes (integrated backend)

## Project Structure

```
youtrack-viewer/
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript config
├── next.config.ts                     # Next.js config
├── tailwind.config.ts                 # Tailwind CSS config
├── components.json                    # shadcn/ui config
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout
    │   ├── page.tsx                   # Main page (client component)
    │   ├── globals.css                # Global styles + Tailwind + shadcn/ui
    │   └── api/
    │       ├── sprints/route.ts       # API endpoint for sprints
    │       └── issues/route.ts        # API endpoint for issues
    ├── components/
    │   ├── ui/                        # shadcn/ui components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── select.tsx
    │   │   ├── badge.tsx
    │   │   └── alert.tsx
    │   ├── SprintSelector.tsx         # Sprint dropdown selector
    │   ├── SprintInfo.tsx             # Sprint information display
    │   ├── IssueCard.tsx              # Individual issue card
    │   ├── LoadingState.tsx           # Loading indicator
    │   ├── ErrorState.tsx             # Error display
    │   └── EmptyState.tsx             # Empty state message
    └── lib/
        └── utils.ts                   # Utility functions (cn)
```

## Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Running the Application

Unlike the previous version, this app has **integrated frontend and backend**. You only need to run one command:

```bash
npm run dev
```

This will start both the Next.js frontend and API backend at **http://localhost:3000**

Open your browser and visit the URL above.

## Features

- **Sprint Selection**: Dropdown to select from available sprints
- **Sprint Info**: Displays sprint name, date range, and goal
- **Issue Cards**: Shows issues with:
  - Issue ID badge
  - Summary/description
  - Colored field badges (State, SubTribe, etc.)
  - Metadata (Created, Updated, Resolved dates)
  - Reporter information
- **Statistics**: Shows total number of issues in sprint
- **Loading States**: Visual feedback during data fetching
- **Error Handling**: Clear error messages for API failures
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Type-safe code with full IDE support

## Component Architecture

### page.tsx (Main Page)
Client component that manages:
- State for sprints, selected sprint, issues, loading, and errors
- Fetches sprints on mount
- Handles sprint selection and issue loading
- Orchestrates all child components

### API Routes (Backend)
- **app/api/sprints/route.ts** - Fetches all sprints from agile board 103-133
- **app/api/issues/route.ts** - Fetches issues for a specific sprint

These are Next.js API routes that run on the same server as the frontend.

### UI Components (shadcn/ui)
- **Button**: Reusable button with variants
- **Card**: Container component with header, content, footer
- **Select**: Dropdown select component
- **Badge**: Small colored tags for labels
- **Alert**: Error/warning message display

### Feature Components
- **SprintSelector**: Dropdown to select sprints sorted by ordinal
- **SprintInfo**: Displays selected sprint details
- **IssueCard**: Individual issue display with all metadata
- **LoadingState**: Loading spinner
- **ErrorState**: Error alert
- **EmptyState**: Message when no issues found

## Styling

The application uses:
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui design system**: Custom design tokens and components
- **CSS Variables**: For theming (primary, secondary, muted colors)
- **Gradient background**: Purple/indigo gradient

## API Integration

The app uses Next.js API routes to communicate with YouTrack:
- `GET /api/sprints` - Fetches all sprints from agile board
- `GET /api/issues?query=...&fields=...` - Fetches issues for a sprint

The API routes handle YouTrack authentication and proxy requests directly - no separate backend server needed.

## Build for Production

```bash
npm run build
npm start
```

This creates an optimized production build and starts the production server.

## Advantages over Previous Version

1. **Single Server**: No need to run separate frontend and backend servers
2. **TypeScript**: Full type safety and better IDE support
3. **Better Performance**: Next.js optimizations (server components, streaming, etc.)
4. **Simpler Deployment**: Deploy as a single app to Vercel, Netlify, etc.
5. **Modern Stack**: Latest Next.js 16 with App Router
