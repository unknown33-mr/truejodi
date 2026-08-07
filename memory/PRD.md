# PRD - Truejodi Matrimony (Phase-1)

## Original Problem Statement
Truejodi Matrimony Phase-1: Professional frontend matrimony platform with Home Page, Login Page, Registration Page, and Search Page (UI Only, mock state).

## User Personas
1. **Eligible Baches / Brides**: Looking for verified life partners matching community, education, and location preferences.
2. **Parents & Families**: Searching for secure, traditional yet modern matrimonial alliances with protected contact details.

## Core Requirements (Static & Mock)
- **Tech Stack**: React, Vite, Tailwind CSS, React Router.
- **Color Theme**: Soft Rose & Gold (Traditional Indian matrimony feel with subtle rose and gold gradients).
- **Pages**:
  1. **Home Page**: Top Header, Navigation, Hero Banner with Couple Image, Search Partner & Register Now buttons, About Platform, How It Works (3 steps), Features, Why Choose Us, Success Counter (Total registered users, grooms, brides, happy families), Membership Plans Preview, Testimonials, FAQ, Contact Section, Footer.
  2. **Login Page**: Beautiful UI, Mobile/Email input, Password input, Remember me, Forgot Password link, Login button, Register link.
  3. **Registration Page**: Comprehensive 14+ fields professional form (Profile Created For, Gender, Full Name, Date of Birth, Age, Religion, Community, Education, Occupation, State, District, Mobile, Email, Password, Confirm Password) without backend validation.
  4. **Search Page**: Interactive UI with sidebar filters (Gender, Age From/To, Religion, Community, Education, Occupation, State, District), and profile cards displaying Photo, Name, Age, Education, Occupation, State, District, Short Introduction, Hidden Contact Number/Email with Show/Hide toggle, View Profile modal, and Send Interest action.

## What's Been Implemented (Date: July 2026)
- Fully functional React frontend with React Router for seamless client-side routing.
- Responsive Navbar & Footer components with brand identity.
- Pre-populated realistic Indian community mock profiles (`mock.js`).
- Complete Home Page with all 13 specified sections and interactive FAQ accordions & contact form.
- Complete Login Page with interactive success state.
- Complete Registration Page with 14+ fields and success state.
- Complete Search Page with filtering sidebar, hidden contact reveal toggle, View Profile popup modal, and Interest counters.

## Mocked in Frontend
- All profile data and search results.
- Authentication & registration state handling.
- Contact reveal and interest sending simulation.

## Prioritized Backlog & Phase-2 Future Recommendations
- **Phase-2 Backend**: Wire FastAPI backend with MongoDB for persistent user profiles.
- **Authentication**: Implement JWT authentication and OTP-based mobile verification.
- **Chat & Messaging**: Add real-time chat between connected matches.
- **Payment Gateway**: Integrate Stripe / Razorpay for premium membership plan upgrades.
- **AI Matchmaking**: Add AI-powered compatibility percentage matching.

## Commands to Run
```bash
cd /app/frontend
yarn install
yarn start
```
