# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Create production build
npm start            # Run production server
```

### Code Quality
```bash
npm run check        # Run all checks (lint + typecheck)
npm run lint         # Check for ESLint errors
npm run lint:fix     # Auto-fix ESLint errors
npm run typecheck    # Run TypeScript compiler check (no emit)
```

## Architecture Overview

This is a **Next.js 16 App Router** application for viewing YouTrack agile board issues. The app uses an integrated frontend/backend architecture with Next.js API routes.

### Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-first, no `tailwind.config.js`) + shadcn/ui components
- **State Management**: Zustand with persist middleware (localStorage)
- **HTTP Client**: Axios
- **Markdown**: react-markdown + remark-gfm for sprint report generation

### Key Architecture Patterns

#### 1. State Management with Zustand
The app uses a centralized Zustand store (`src/store/index.ts`) that:
- Persists `authToken` and `queryUsername` to localStorage
- Manages board data (sprints, states, subtribes, currentSprint)
- Manages issues and filters
- All components access state via `useAppStore()` hook
- **Important**: When modifying state in async callbacks, use `useAppStore.getState()` instead of destructured state to avoid stale closures

#### 2. Data Flow Pattern
- **Board data** is fetched via `useBoardData` hook on app load
- **Issues data** is fetched via `useIssuesData` hook when user changes filters
- All API calls go through Next.js API routes in `src/app/api/`
- State is updated in the Zustand store, components re-render automatically

#### 3. YouTrack API Integration
The app communicates with YouTrack REST API through proxy routes:
- `/api/board` - Fetches agile board configuration (sprints, columns, swimlanes)
- `/api/issues` - Fetches issues with YouTrack query language

**Critical**: The app uses hardcoded board name `"Board Employer Kanban"` in query building. Do not change this without understanding the implications.

**Query Building**: YouTrack queries are built using functions in `src/lib/youTrackQuery.ts`:
- `buildStateFilter()` - Converts state IDs to YouTrack state filter syntax
- `buildSortFilter()` - Converts sort options to YouTrack sort syntax
- `buildQuery()` - Assembles full query with optional username prefix
- State names with spaces must be wrapped in braces: `{State Name}`

#### 4. Issue Field Parsing
YouTrack issues have a dynamic `fields` array. Field positions vary by issue type:
- **AJTI issues**: Story points at index 9, SubTribe at index 11
- **Other issues**: Story points at index 6, SubTribe at index 12
- Story points field value can be a `number` directly or an object with `presentation`/`name` properties

#### 5. Sprint Ordering
Sprints are **reversed** from the API (newest first). When finding "previous sprint", it's at `currentSprintIndex + 1` (not `-1`).

#### 6. Sprint Markdown Generation
The `SprintMarkdownGenerator` component supports two modes via `mode` prop:
- `"previous"` (default): Fetches deployed issues only, shows story points and deployed status
- `"current"`: Fetches all issues, no story points or deployed status (planning mode)

Markdown is rendered using `react-markdown` with custom prose styles in `globals.css`.

## File Structure Notes

### API Routes
- `src/app/api/board/route.ts` - GET board configuration (authenticated)
- `src/app/api/issues/route.ts` - GET issues with query parameter (authenticated)

### Components
- `src/components/ui/` - shadcn/ui base components (auto-generated, edit carefully)
- `src/components/SprintMarkdownGenerator.tsx` - Generates sprint reports in markdown
- `src/components/SettingsModal.tsx` - Auth token and username configuration
- `src/components/BoardFilters.tsx` - State and sort filters
- `src/components/SprintSelector.tsx` - Sprint dropdown (uses Zustand store directly)
- `src/components/IssueList.tsx` - Displays filtered issues

### Custom Hooks
- `src/hooks/useBoardData.ts` - Fetches and stores board configuration
- `src/hooks/useIssuesData.ts` - Fetches and stores issues based on filters

## Important Constraints

1. **No Default Values**: The app intentionally has no hardcoded defaults. Users must configure:
   - Auth token via SettingsModal
   - Query username (optional, for scoped queries)

2. **Tailwind CSS v4**: This version uses CSS imports instead of `tailwind.config.js`. Do not use `@tailwindcss/typography` - it's incompatible. Use custom prose styles in `globals.css` instead.

3. **ESLint Configuration**: Uses `simple-import-sort` plugin for import ordering. Always run `npm run lint:fix` before committing.

4. **Type Safety**: All code uses TypeScript strict mode. Avoid `any` types - use proper interfaces or type guards.

5. **Async State Updates**: When updating Zustand state in async functions (fetch callbacks), always use `useAppStore.getState()` to get fresh state instead of relying on destructured state from component scope.

## Common Issues

### "API board not being called"
This happens when `useBoardData()` hook is missing from `page.tsx`. The hook must be called in the component body to trigger board data fetch on mount.

### Modal Blinking
SettingsModal was showing/hiding continuously because Zustand persist middleware loads asynchronously. Fixed by checking localStorage directly using `getFromLocalStorage()` helper.

### Story Points Showing 0
TypeScript error with `value.presentation` or `value.name` being `undefined`. Use null coalescing: `value.presentation ?? ""`

### Invalid Token (401)
Both API routes clear auth token and set error message on 401 response. User must re-enter token via SettingsModal.
