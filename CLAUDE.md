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
- **Security**: Content Security Policy (CSP) headers via middleware

### Key Architecture Patterns

#### 1. State Management with Zustand
The app uses a centralized Zustand store (`src/store/index.ts`) that:
- Persists `authToken`, `queryUsername`, `tokenCreatedAt`, `lastUsedAt`, `activityLog` to localStorage
- Manages board data (sprints, states, subtribes, currentSprint)
- Manages issues and filters
- All components access state via `useAppStore()` hook
- **Important**: When modifying state in async callbacks, use `useAppStore.getState()` instead of destructured state to avoid stale closures

**Security Fields**:
- `tokenCreatedAt`: ISO timestamp when token was first stored
- `lastUsedAt`: ISO timestamp of last API activity
- `activityLog`: Array of last 10 activity timestamps
- `updateLastUsed()`: Call after every successful API request
- `checkSessionTimeout()`: Returns true if 2 hours inactive
- `isSessionExpired()`: Same as checkSessionTimeout

#### 2. Data Flow Pattern
- **Board data** is fetched via `useBoardData` hook on app load
- **Issues data** is fetched via `useIssuesData` hook when user changes filters
- All API calls go through Next.js API routes in `src/app/api/`
- State is updated in the Zustand store, components re-render automatically
- **Activity Tracking**: Both hooks call `updateLastUsed()` after successful fetch

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
The `SprintMarkdownGenerator` component (`src/components/SprintMarkdownGenerator.tsx`) supports two modes via `mode` prop:
- `"previous"`: Fetches deployed issues only, shows story points, deployed status, and totals
- `"current"`: Fetches all issues, no story points or deployed status (planning mode)

**Important**: The generator uses the **board's actual current sprint** (from `currentSprint` in store), NOT the user's selected sprint. This is by design - markdown generation is always based on the actual current sprint from YouTrack, regardless of what the user selects for viewing issues.

Markdown is rendered using `react-markdown` with custom prose styles in `globals.css`.

## File Structure Notes

### Middleware
- `middleware.ts` - Adds security headers (CSP, HSTS, X-Frame-Options, etc.) to all non-API routes

### API Routes
- `src/app/api/board/route.ts` - GET board configuration (authenticated)
- `src/app/api/issues/route.ts` - GET issues with query parameter (authenticated)

### Components
- `src/components/ui/` - shadcn/ui base components (auto-generated, edit carefully)
- `src/components/SprintMarkdownGenerator.tsx` - Generates sprint reports in markdown (current & previous)
- `src/components/SettingsModal.tsx` - Auth token configuration with security features
- `src/components/SessionTimeout.tsx` - Auto-logout after 2 hours of inactivity
- `src/components/BoardFilters.tsx` - State and sort filters
- `src/components/SprintSelector.tsx` - Sprint dropdown (uses Zustand store directly)
- `src/components/IssueList.tsx` - Displays filtered issues

### Custom Hooks
- `src/hooks/useBoardData.ts` - Fetches and stores board configuration, calls `updateLastUsed()`
- `src/hooks/useIssuesData.ts` - Fetches and stores issues based on filters, calls `updateLastUsed()`

## Security Features

### Implemented Security Measures

1. **Content Security Policy (CSP)**
   - Defined in `middleware.ts`
   - Prevents XSS attacks from stealing tokens
   - Blocks inline scripts, eval(), unsafe sources

2. **Session Timeout**
   - Auto-logout after 2 hours of inactivity
   - Warning dialog 10 minutes before timeout
   - Tracks user activity (mouse, keyboard, scroll, touch)
   - `SessionTimeout` component in `src/app/page.tsx`

3. **Token Age Warning**
   - Displays warning in SettingsModal if token > 90 days old
   - Shows token age in days
   - Recommends regular token rotation

4. **Revoke Token Button**
   - One-click token revocation
   - Clears token from store and localStorage
   - Requires confirmation dialog

5. **Activity Tracking**
   - Tracks last 10 API activities
   - Shows "Last Used" timestamp in SettingsModal
   - Displays recent activity log
   - Helps detect unauthorized access

6. **Security Notice**
   - Orange warning in SettingsModal
   - Explains localStorage risks
   - Recommends trusted device usage only

### Security Best Practices

When working with authentication:

- **Never** log tokens in console (use `console.warn` for API debugging only)
- **Always** use Authorization headers (never URL parameters)
- **Always** call `updateLastUsed()` after successful API calls
- **Always** clear token on 401 errors
- **Never** store tokens in plain text (using localStorage is acceptable for internal tools)

## Important Constraints

1. **No Default Values**: The app intentionally has no hardcoded defaults. Users must configure:
   - Auth token via SettingsModal
   - Query username (optional, for scoped queries)

2. **Tailwind CSS v4**: This version uses CSS imports instead of `tailwind.config.js`. Do not use `@tailwindcss/typography` - it's incompatible. Use custom prose styles in `globals.css` instead.

3. **ESLint Configuration**: Uses `simple-import-sort` plugin for import ordering. Always run `npm run lint:fix` before committing.

4. **Type Safety**: All code uses TypeScript strict mode. Avoid `any` types - use proper interfaces or type guards.

5. **Async State Updates**: When updating Zustand state in async functions (fetch callbacks), always use `useAppStore.getState()` to get fresh state instead of relying on destructured state from component scope.

6. **Markdown Generator Sprint Source**: The `SprintMarkdownGenerator` always uses the board's actual `currentSprint`, not the user's `selectedSprint`. The `actualCurrentSprintName` is computed from `currentSprint.id` in `page.tsx` and passed to both generator instances.

## Common Issues

### "API board not being called"
This happens when `useBoardData()` hook is missing from `page.tsx`. The hook must be called in the component body to trigger board data fetch on mount.

### Modal Blinking
SettingsModal was showing/hiding continuously because Zustand persist middleware loads asynchronously. Fixed by checking localStorage directly using `getFromLocalStorage()` helper.

### Story Points Showing 0
TypeScript error with `value.presentation` or `value.name` being `undefined`. Use null coalescing: `value.presentation ?? ""`

### Invalid Token (401)
Both API routes clear auth token and set error message on 401 response. User must re-enter token via SettingsModal.

### Session Expiration
If user is inactive for 2 hours, `SessionTimeout` component auto-logs them out by clearing token and reloading page. Warning shown at 1 hour 50 minutes.

### Markdown Not Updating When Sprint Changes
When user changes selected sprint, the markdown preview closes automatically because it was generated for a different sprint. User must click "Generate & Preview" again. This is intentional - markdown always reflects board's current sprint, not user's selection.
