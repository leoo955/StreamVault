# [IMPLEMENTATION] Dynamic background synchronization with user last watch progress

**Description**
Implement a dynamic background system on the homepage that reflects the user's most recent activity. This feature aims to increase immersion by replacing the default hero carousel background with the backdrop of the last media item partially watched by the user.

**Technical Specifications**

1.  **Data Fetching Enhancement**
    *   Modify `GET /api/progress` to return the most recently updated progress entry first (OrderBy `updatedAt` DESC).
    *   Ensure the progress object includes the `backdropUrl` of the associated `Media` entity.

2.  **Frontend Logic (HomePage)**
    *   In `src/app/page.tsx`, identify the "Resume" item with the latest `updatedAt` timestamp.
    *   Implement a conditional check: prioritize this backdrop as the initial hero background.

3.  **UI/UX Implementation**
    *   Add a dedicated background container with `position: fixed` or `absolute`.
    *   Apply a CSS mask or multiple linear gradients to maintain high contrast.

4.  **Performance & Optimization**
    *   Leverage `next/image` with `priority` and `sizes="100vw"`.
    *   Implement a fallback mechanism if the `backdropUrl` fails to load.

**Files Impacted**
*   `src/app/api/progress/route.ts`
*   `src/app/page.tsx`
*   `src/lib/db.ts`
