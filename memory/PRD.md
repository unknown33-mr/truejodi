# Truejodi Matrimony — Product Requirements & Status

## Original Problem Statement (Phase-2)
Continue Phase-2 for the existing Truejodi Matrimony full-stack app: redirect login to /dashboard, build a complete editable dashboard, photo upload/delete/primary (Emergent Object Storage), weighted compatibility recommendations, advanced search filters, connect everything to MongoDB, keep the Poppins font globally, and no dummy data.

## Architecture
- Frontend: React (Vite), Tailwind, React Router, Lucide-react. Auth via Bearer JWT in localStorage.
- Backend: FastAPI + Motor (MongoDB), bcrypt + PyJWT. Emergent Object Storage for photos.

## Core Requirements (Static)
- User can register, log in, edit their entire matrimonial profile, upload up to 3 photos.
- Advanced privacy controls (hide phone/email/whatsapp/location, profile visibility, who-can-view).
- Recommendation engine: weighted score across Age, Religion, Community, MotherTongue, MaritalStatus, Education, Occupation, State, City, Height, PartnerPreferences, Completeness.
- Advanced search over the same field set.
- All data persisted in MongoDB.

## Implemented (2026-02-07)
- Backend
  - JWT auth with Bearer + cookie fallback; login returns access_token in body.
  - PUT /api/users/profile (whitelisted fields), GET /api/users/completion.
  - Photo APIs: upload (Emergent Object Storage), delete, set-primary; max 3 photos, 5MB, image only.
  - GET /api/recommendations — weighted compatibility, opposite-gender, respects privacy & blocking.
  - GET /api/profiles/search — 13 filters, compatibility-sorted.
  - Block/unblock/report/delete-account endpoints.
  - Sample 8 matrimonial candidates seeded at startup for real recommendations & search.
- Frontend
  - AuthContext with axios interceptor (Bearer token). ProtectedRoute for /dashboard and /search.
  - LoginPage now redirects to /dashboard on success.
  - DashboardPage: 9 sidebar sections, completion % header, photo gallery with upload/primary/delete, Recommended For You grid with match badges.
  - SearchPage: advanced filter sidebar, real backend query, compatibility badges, contact-hidden toggle, detail modal.
  - Poppins font globally.
- Tests: 15/15 pytest backend + full Playwright UI pass (iteration_2.json).

## Prioritized Backlog
- P1: Interest send/accept flow (currently visual only) — persist to DB; unlock contact when accepted.
- P1: Real-time chat between mutually interested users.
- P1: Horoscope PDF upload + optional AI kundali matching.
- P2: Premium membership + Stripe integration (contact reveal, priority ranking).
- P2: Notifications (email/WhatsApp) for new matches.
- P2: Verification badges (Aadhaar/PAN) with an admin queue.

## Notes for Next Agent
- Auth is Bearer-based (localStorage key `truejodi_access_token`); do NOT re-introduce withCredentials cookies — ingress rewrites CORS to `*`.
- Photo URL helper is `photoUrl()` in AuthContext; external URLs pass through as-is, storage paths route via `/api/files/{path}`.
- Compatibility weights are centralised in `COMPATIBILITY_WEIGHTS` (server.py) and easy to tweak.
