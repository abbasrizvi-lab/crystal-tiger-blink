# Backend Development Plan

### 1️⃣ Executive Summary
- This document outlines the backend development plan for the "Innovation Character" application, a platform for character development to drive innovation.
- The backend will be built using FastAPI (Python 3.13) with a MongoDB Atlas database, following a RESTful API design.
- Key constraints include no Docker, manual testing after every task, and a single-branch Git workflow (`main`).
- The plan is structured into dynamic sprints (S0-S5) to cover all frontend-visible features.

### 2️⃣ In-Scope & Success Criteria
- **In-Scope Features:**
  - User authentication (signup, login, logout).
  - Character assessment and goal setting (priority virtues).
  - Daily philosophical quote delivery.
  - Quick character moment logging (text-based).
  - Weekly character reflection and progress tracking.
  - Personalized news article delivery.
  - User dashboard for visualizing character growth trends.
- **Success Criteria:**
  - All frontend features are fully functional end-to-end with the backend.
  - All task-level manual tests pass via the UI.
  - Each sprint's code is pushed to the `main` branch after successful verification.

### 3️⃣ API Design
- **Base Path:** `/api/v1`
- **Error Envelope:** `{ "error": "message" }`

---

- **Authentication**
  - `POST /auth/signup`
    - **Purpose:** Register a new user.
    - **Request:** `{ "email": "user@example.com", "password": "password123" }`
    - **Response:** `{ "access_token": "jwt_token", "token_type": "bearer" }`
  - `POST /auth/login`
    - **Purpose:** Authenticate a user and issue a JWT.
    - **Request:** `{ "email": "user@example.com", "password": "password123" }`
    - **Response:** `{ "access_token": "jwt_token", "token_type": "bearer" }`
  - `GET /auth/me`
    - **Purpose:** Get the current authenticated user's profile.
    - **Request:** (Requires Authorization header)
    - **Response:** `{ "id": "user_id", "email": "user@example.com" }`

- **User Settings**
  - `GET /users/me/settings`
    - **Purpose:** Get the current user's settings, including priority virtues.
    - **Request:** (Requires Authorization header)
    - **Response:** `{ "priorityVirtues": ["resilience", "grit"], "customVirtues": ["patience"] }`
  - `PUT /users/me/settings`
    - **Purpose:** Update the user's settings.
    - **Request:** `{ "priorityVirtues": ["resilience", "grit", "empathy"] }`
    - **Response:** `{ "priorityVirtues": ["resilience", "grit", "empathy"], "customVirtues": ["patience"] }`

- **Dashboard**
  - `GET /dashboard`
    - **Purpose:** Get all data required for the main dashboard.
    - **Request:** (Requires Authorization header)
    - **Response:** `{ "dailyQuote": { ... }, "growthTrends": { ... }, "newsArticles": [ ... ] }`

- **Character Moments**
  - `POST /moments`
    - **Purpose:** Log a new character moment.
    - **Request:** `{ "text": "Showed resilience today." }`
    - **Response:** `{ "id": "moment_id", "text": "Showed resilience today.", "createdAt": "timestamp" }`

- **Weekly Reflections**
  - `GET /reflections/weekly`
    - **Purpose:** Get the data for the weekly reflection page.
    - **Request:** (Requires Authorization header)
    - **Response:** `{ "audioSummary": { ... }, "calendarInsights": [ ... ], "virtueSuggestion": { ... }, "growthData": [ ... ] }`

### 4️⃣ Data Model (MongoDB Atlas)
- **`users` collection**
  - `_id`: ObjectId (Primary Key)
  - `email`: String (required, unique)
  - `hashed_password`: String (required)
  - `settings`:
    - `priorityVirtues`: Array of Strings
    - `customVirtues`: Array of Strings
  - **Example:**
    ```json
    {
      "_id": "60c72b2f9b1d8c001f8e4c8b",
      "email": "user@example.com",
      "hashed_password": "argon2_hash",
      "settings": {
        "priorityVirtues": ["resilience", "grit"],
        "customVirtues": []
      }
    }
    ```

- **`moments` collection**
  - `_id`: ObjectId (Primary Key)
  - `userId`: ObjectId (reference to `users`)
  - `text`: String (required)
  - `createdAt`: DateTime (required, default: now)
  - **Example:**
    ```json
    {
      "_id": "60c72b2f9b1d8c001f8e4c8c",
      "userId": "60c72b2f9b1d8c001f8e4c8b",
      "text": "Practiced active listening in a meeting.",
      "createdAt": "2025-10-28T10:00:00Z"
    }
    ```

### 5️⃣ Frontend Audit & Feature Map
- **`src/pages/Index.tsx`**
  - **Purpose:** Landing/Onboarding page.
  - **Endpoints:** `POST /auth/signup`
  - **Models:** `users`
- **`src/pages/Dashboard.tsx`**
  - **Purpose:** Main user dashboard.
  - **Endpoints:** `GET /dashboard`, `POST /moments`
  - **Models:** `users`, `moments`
- **`src/pages/WeeklyReflection.tsx`**
  - **Purpose:** Display weekly progress and insights.
  - **Endpoints:** `GET /reflections/weekly`
  - **Models:** `moments` (for aggregation)
- **`src/pages/Settings.tsx`**
  - **Purpose:** Allow users to set their priority virtues.
  - **Endpoints:** `GET /users/me/settings`, `PUT /users/me/settings`
  - **Models:** `users`
- **`src/pages/CalendarIntegration.tsx` & `src/pages/Integrations.tsx`**
  - **Purpose:** Placeholder for calendar integration.
  - **Endpoints:** (Future) `/integrations/calendar/connect`
  - **Models:** (Future) `integrations`

### 6️⃣ Configuration & ENV Vars
- `APP_ENV`: `development` or `production`
- `PORT`: `8000`
- `MONGODB_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: Secret key for signing JWTs.
- `JWT_EXPIRES_IN`: JWT expiry time in seconds (e.g., `3600`).
- `CORS_ORIGINS`: Frontend URL (e.g., `http://localhost:5173`).

### 7️⃣ Background Work
- **Weekly Reflection Generation:**
  - A background task will run weekly to analyze a user's logged `moments` and generate insights, a virtue suggestion, and an audio summary.
  - The UI will check for new reflections by calling the `GET /reflections/weekly` endpoint.

### 8️⃣ Integrations
- **Calendar Integration:**
  - A future integration will connect to the user's calendar (e.g., Google Calendar) to analyze time usage patterns.
  - This will require additional environment variables for OAuth credentials.

### 9️⃣ Testing Strategy (Manual via Frontend)
- All backend functionality will be validated through the frontend UI.
- Each task in the sprint plan includes a specific manual test step.
- After all tasks in a sprint are completed and tested, the code will be committed and pushed to `main`.

### 🔟 Dynamic Sprint Plan & Backlog

---

### S0 – Environment Setup & Frontend Connection
- **Objectives:**
  - Create a FastAPI skeleton with `/api/v1` and `/healthz`.
  - Connect to MongoDB Atlas using `MONGODB_URI`.
  - Implement a `/healthz` endpoint that pings the database.
  - Enable CORS for the frontend.
  - Replace dummy API URLs in the frontend with real backend URLs.
  - Initialize a Git repository and push to GitHub.
- **Definition of Done:**
  - Backend runs locally and connects to MongoDB Atlas.
  - The `/healthz` endpoint returns a success status.
  - The frontend can make requests to the backend.
- **Manual Test Step:**
  - Run the backend, open the frontend, and check the browser's network tab for a successful `200 OK` response from `/healthz`.
- **User Test Prompt:**
  > "Start the backend and refresh the app. Confirm that the network tab shows a successful connection to the backend's /healthz endpoint."

---

### S1 – Basic Auth (Signup / Login / Logout)
- **Objectives:**
  - Implement JWT-based signup, login, and logout.
  - Protect the `/dashboard` route.
- **Tasks:**
  - **Create User Model and Signup Endpoint:**
    - **Manual Test Step:** Use the UI to sign up with a new email and password. Expect a success message and redirection.
    - **User Test Prompt:** "Create a new account and verify that you are logged in and redirected to the dashboard."
  - **Implement Login Endpoint:**
    - **Manual Test Step:** Log out, then log back in with the created account. Expect to be redirected to the dashboard.
    - **User Test Prompt:** "Log in with your new account and confirm you are taken to the dashboard."
  - **Implement Logout:**
    - **Manual Test Step:** Click the logout button. Attempt to access the dashboard and expect to be redirected to the login page.
    - **User Test Prompt:** "Log out, then try to access the dashboard. You should be redirected to the login page."
- **Definition of Done:**
  - The full authentication flow works end-to-end in the frontend.

---

### S2 – User Settings (Priority Virtues)
- **Objectives:**
  - Allow users to select and save their priority virtues.
- **Tasks:**
  - **Create Settings Endpoints:**
    - Implement `GET /users/me/settings` and `PUT /users/me/settings`.
  - **Connect Settings Page:**
    - **Manual Test Step:** Go to the Settings page, select 2-3 virtues, and save. Refresh the page and verify the selections are still there.
    - **User Test Prompt:** "Go to the settings page, select your priority virtues, and save. Refresh the page to ensure your choices are saved."
- **Definition of Done:**
  - Users can update and persist their priority virtues from the settings page.

---

### S3 – Dashboard Core Features
- **Objectives:**
  - Implement the core features of the dashboard page.
- **Tasks:**
  - **Implement `POST /moments`:**
    - **Manual Test Step:** On the dashboard, log a new character moment. Expect a success toast message.
    - **User Test Prompt:** "Log a character moment from the dashboard and confirm you see a success message."
  - **Implement `GET /dashboard`:**
    - This endpoint should return a daily quote, news articles, and basic growth trends (for now, mock the trends).
    - **Manual Test Step:** Load the dashboard page. Expect to see a daily quote and a list of news articles loaded from the backend.
    - **User Test Prompt:** "Refresh the dashboard and confirm that the daily quote and news articles are displayed."
- **Definition of Done:**
  - The dashboard loads dynamic data from the backend, and users can log moments.

---

### S4 – Weekly Reflection
- **Objectives:**
  - Implement the weekly reflection page.
- **Tasks:**
  - **Implement `GET /reflections/weekly`:**
    - This endpoint will return mock data for the audio summary, calendar insights, and virtue suggestion for now.
    - **Manual Test Step:** Navigate to the Weekly Reflection page. Expect to see the mock reflection data displayed.
    - **User Test Prompt:** "Go to the Weekly Reflection page and confirm that you see the weekly summary and insights."
- **Definition of Done:**
  - The weekly reflection page loads data from the backend.

---

### S5 – Character Growth Trends
- **Objectives:**
  - Display character growth trends on the dashboard.
- **Tasks:**
  - **Update `GET /dashboard` for Trends:**
    - Modify the dashboard endpoint to calculate simple trends based on the logged `moments`.
    - **Manual Test Step:** Log several character moments over a few days. Visit the dashboard and observe the character growth trends section for updates.
    - **User Test Prompt:** "After logging a few character moments, check the dashboard to see if the growth trends section reflects your entries."
- **Definition of Done:**
  - The dashboard displays basic character growth trends based on user activity.