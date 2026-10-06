# Nexus Data Explorer — Order Intelligence & Operations Hub

> A high-performance, race-condition-resilient enterprise data explorer built over a 12,000-record dataset. Designed to stay fast, accessible, and 100% reliable under chaotic real-world network conditions.

Built for the **Frontend Developer Assessment** (**Problem Statement 1: Can you build a data explorer that stays fast and never shows the wrong results?**).

---

## 🌐 Live Deployment & Demo Links

- **Live Application URL**: [https://your-deployment-url.vercel.app](https://your-deployment-url.vercel.app) *(Replace with your live production URL)*
- **Demo Video (5-min walk-through)**: [https://loom.com/your-demo-video](https://loom.com/your-demo-video) *(Replace with your walk-through video link)*
- **GitHub Repository**: [https://github.com/Abdul-Raheem324/DareAi-Search-Assessment](https://github.com/Abdul-Raheem324/DareAi-Search-Assessment)

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- **Node.js**: v18.18.0 or later
- **npm** (or pnpm / yarn)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
```bash
npm run test
```

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🛠️ Key Features & How They Solve Problem Statement 1

### 1. 12,000 Record Dataset with Server-Side Search & Filters
- **Large Dataset**: Pre-generated dataset of 12,000 realistic enterprise order records across multiple industries (AI Hardware, Dedicated Transit, Cloud Infrastructure, etc.).
- **Server-Side API**: All searching, multi-status/priority/region filtering, amount range filtering, column sorting, and pagination execute on the server API route (`/api/orders`).
- **Default Latency & Chaos**: By default, every request simulates realistic network latency (**random 200 ms to 3 s**) and roughly **1-in-10 requests fail (10% failure rate)** with HTTP 500.

### 2. Race Condition Prevention & Zero Stale Data
- **AbortController Cancellation**: When a user types quickly or toggles filters, any in-flight request is immediately aborted so the browser stops waiting on obsolete responses.
- **Request Generation Sequence Tokens**: Even if a cancelled request or delayed response manages to arrive after a newer query, our concurrency engine compares the response's generation token against the active request sequence. If the token is older, the response is discarded and logged as `"Slow response ignored"`. A slow earlier response **can never overwrite a newer one**.
- **Search Debouncing**: The search input features a 300ms debounce with visual feedback so network requests aren't needlessly spammed while typing.

### 3. 100% URL-Driven State Management
- **Single Source of Truth**: All search keywords (`q`), filter selections (`status`, `priority`, `region`, `category`), amount bounds, sort field, sort order, page number, and the active drawer order (`selectedId`) live directly in the URL search parameters.
- **Browser Navigation**: Browser **Back** and **Forward** buttons smoothly undo and redo filter changes and open/close the detail drawer.
- **"Share View" Feature**: The "Share View" button generates a clean URL that shares your exact view, filters, and active drawer order without leaking any local chaos settings.

### 4. 60fps Performance with Virtualization
- **DOM Virtualization**: Powered by `@tanstack/react-virtual`, the table only mounts the rows currently visible inside the viewport.
- **Smooth Scrolling**: Allows continuous 60fps scrolling over large page sizes without browser lag or DOM bloat.
- **Stable Layout**: Uses an explicit 7-column grid layout with horizontal scrolling support (`min-w-[960px]`) so columns never crowd or overlap.

### 5. Honest States
- **Table Skeleton Loader**: Matches the exact 7-column layout and height of the actual table. When any filter or page changes, the skeleton displays smoothly with zero layout shift.
- **Honest Error Handling**: If a request encounters a simulated 500 fault, the table never shows outdated data as if it were current. Instead, it displays a clear error state with the request ID and a 1-click **"Retry Request"** button.
- **Empty State**: When no records match the criteria, a clean empty state offers a 1-click **"Reset All Filters"** action.

### 6. Full Keyboard & Screen Reader Accessibility (a11y)
- **Keyboard Navigation**:
  - `↑` / `↓` Arrow keys: Navigate through table rows.
  - `Enter` / `Space`: Open the detail drawer for the focused order.
  - `Escape`: Close any open drawer or modal.
  - `/` (Slash): Focus the search input from anywhere on the page.
- **Visible Focus**: Clear focus outlines across all interactive controls.
- **Screen Reader Announcements**: Powered by an accessible `aria-live` region (`A11yLiveAnnouncer`) that speaks total match counts and error alerts.

### 7. Deep-Linkable Detail Drawer
- Clicking any row opens a slide-over drawer displaying customer information, shipping timeline, and financial breakdown.
- Deep-linked via `?selectedId=...` in the URL.
- Uses client-side cached data when opening an order from the current page—avoiding redundant refetches or skeleton flashes while preserving scroll position and active filters.

---

## ⚡ The "Network & Chaos Lab" Feature

Located in the top header, the **Network & Chaos Lab** button opens an interactive evaluation drawer designed specifically for reviewers and developers to test the application under real-world conditions.

### What the Chaos Lab Does:
1. **Slide-Over Drawer Design**:
   - Opens as a smooth overlay drawer with a backdrop.
   - **Does not push the table down**—the data table remains the central product and is directly visible above the fold on first load.
2. **Latency Simulation Controls**:
   - **Default (200ms–3s)**: Spec-compliant random latency on every request.
   - **100ms**: Fast baseline response for speed checks.
   - **1.5s / 3.0s**: High latency simulation to observe skeleton loading and pending states.
3. **Failure Rate Controls**:
   - **10% (1-in-10)**: Spec default transient failure rate.
   - **0% (Disabled)**: Clean mode for uninterrupted testing.
   - **30% (High)**: Stress mode to verify error recovery and retry behavior.
4. **Interactive Stress Tests**:
   - **Force 500 Error**: Forces the very next request to fail with a simulated HTTP 500 gateway error to inspect the honest error recovery state.
   - **Test Race Cancellation**: Automatically fires a slow request (2.8s) followed immediately by a fast request (200ms). The fast request resolves first and commits to the UI, while the slow request is cancelled via `AbortController` and reported as `"Slow response ignored"`.
5. **Live Telemetry Request Stream**:
   - Live event counter at the top: `(X ok, Y cancelled, Z failed)`.
   - Displays real-time logs of every dispatched network query.
   - Shows colored status pills:
     - `OK` (emerald) with roundtrip response time.
     - `CANCELLED` (amber) with explicit reason (`Aborted via AbortController` / `Slow response ignored`).
     - `FAILED` (rose) with HTTP 500 error payload.
     - `PENDING` (violet) with active loading spinner.
   - Includes a 1-click **Clear** button.

---

## 🏛️ Architecture & State Management Decisions

| Layer | Implementation | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, React 19) | Fast server-side routing, optimal font loading, and clean route handlers for the mock API. |
| **URL State** | `useUrlState.ts` (custom hook) | Synchronizes filter state atomically with the URL search parameters using Next.js `useSearchParams` and `useRouter`. |
| **Query Engine** | `useOrdersQuery.ts` (custom hook) | Handles data fetching, sequence token generation, AbortController lifecycle, and live telemetry logging. |
| **Mock Backend** | `/api/orders` & `/lib/queryEngine.ts` | Fully self-contained mock API over 12,000 generated records with configurable latency and error injection. |
| **Virtualization** | `@tanstack/react-virtual` | Renders only visible rows to ensure memory efficiency and silky 60fps scrolling over large datasets. |
| **Styling** | Tailwind CSS v4 & Custom Design Tokens | Eye-friendly warm stone & violet theme (`#f5f4f0` base) designed for long evaluation sessions without eye fatigue. |

---

## ⚖️ Tradeoffs & Technical Decisions

1. **Server-Side Filtering vs Client-Side Filtering**:
   - *Decision*: Performed all filtering, searching, and sorting server-side in `/api/orders`.
   - *Tradeoff*: Client-side filtering over 12,000 items in memory would have been instant, but would not demonstrate real-world asynchronous race conditions, network latency, or server pagination required by the assignment.

2. **Sequence Generation Tokens alongside AbortController**:
   - *Decision*: Implemented both browser-level `AbortController.abort()` and an in-memory generation counter (`requestSeqRef`).
   - *Tradeoff*: `AbortController` cancels network requests at the browser transport layer. Adding sequence generation tokens guarantees that even if a response resolves just before an abort signal propagates, it will still be discarded before touching React state.

3. **URL State Isolation for Chaos Settings**:
   - *Decision*: Chaos settings (latency, fail rate) are maintained in local state and excluded from the URL by `serializeParams`.
   - *Tradeoff*: This ensures that clicking "Share View" shares only the user's active filters and search query—preventing shared links from accidentally inflicting a 30% failure rate or 3-second delay on other users.

---

## 🧪 Automated Testing

Automated tests are written with **Vitest** and verify the core resilience requirements:

```bash
npm run test
```

### What the test suite covers:
- **Server Query Execution**: Multi-field search across 12,000 items, combined status filtering, and pagination limits.
- **Chaos Injection**: Verifies that forced failure options reject with simulated HTTP 500 errors.
- **AbortController Cancellation**: Verifies that the previous request signal receives the abort event when superseded.
- **Generation Token Concurrency**: Verifies that when earlier slow queries resolve after newer fast queries, only the newer result is committed to state.
- **Honest Error State**: Verifies that API failures do not leave stale data looking current.

---

## 📚 Sources & References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TanStack Virtual Core Concepts](https://tanstack.com/virtual/latest)
- [MDN: AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [WCAG 2.1 Contrast & Color Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Lucide Icons](https://lucide.dev/)

---

## 🤖 AI Usage Declaration

In accordance with the assignment guidelines:
- **Tools Used**: Claude / Antigravity AI assistant.
- **How AI Was Directed**:
  - Pair-programming the architecture, sequence-token concurrency logic, and virtualized table integration.
  - Iterating on UI design and contrast improvements to replace dark themes with an accessible warm stone theme.
  - Designing the interactive **Network & Chaos Lab** evaluation harness, telemetry request stream, and automated Vitest test suite.
