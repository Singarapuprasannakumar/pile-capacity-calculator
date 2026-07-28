# Changelog

All notable changes to the Civil Engineering Design Suite are documented in this file.

## [2.3.2] - 2026-07-28

### 🚀 Critical Fixes & Improvements
- **Fixed Production HTTP 502 Bad Gateway Issue**: Resolved proxy routing and relative URL handling between Vercel and Render.
- **Unified Frontend API Architecture**: Refactored all module API clients (`footingApi.js`, `soilApi.js`, `underReamedApi.js`, `projectApi.js`, `boreholeApi.js`, `sbcApi.js`) to use a central Axios client with unified environment configuration and interceptors.
- **Vercel API Rewrite Proxy**: Configured `vercel.json` rewrites (`/api/*` -> backend service) and wildcard SPA client-side routing fallback (`/(.*)` -> `/index.html`).
- **Standardized Backend Health Endpoint**: Updated `GET /health` to return standardized `{"status": "ok", "version": "2.3.2"}` payload.
- **Frontend Availability Monitoring**: Added a lightweight backend health availability check on application load with an inline retry banner when services are offline or spinning up.
