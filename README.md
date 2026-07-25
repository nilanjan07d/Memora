# Memora

Memora is a full-stack travel journal app that helps users capture trips as journeys, add memories with photos, and share experiences with collaborators.

## Project structure

- `backend/` - Express API server
  - `.env` - backend environment variables
  - `.gitignore`
  - `config/`
    - `cloudinary.js` - Cloudinary setup
    - `database.js` - MongoDB connection
  - `controllers/`
    - `auth.controller.js`
    - `journey.controller.js`
    - `memory.controller.js`
  - `middleware/`
    - `auth.middleware.js`
    - `error.middleware.js`
    - `upload.middleware.js`
  - `models/`
    - `Journey.model.js`
    - `Memory.model.js`
    - `User.model.js`
  - `routes/`
    - `auth.routes.js`
    - `journey.routes.js`
    - `memory.routes.js`
  - `scripts/`
    - `check-cloudinary-upload.js`
  - `index.js` - Express server entry point
  - `package.json`
  - `package-lock.json`
  - `test.js` - MongoDB connection test utility
  - `test-cloudinary.js` - Cloudinary upload test utility

- `frontend/` - Expo React Native app
  - `.claude/`
    - `settings.json`
  - `.env`
  - `.expo/` - Expo cache and generated metadata
  - `.gitignore`
  - `.vscode/`
    - `extensions.json`
    - `settings.json`
  - `AGENTS.md`
  - `app.json`
  - `app/`
    - `(auth)/`
      - `_layout.tsx`
      - `login.tsx`
      - `register.tsx`
      - `splash.tsx`
    - `(tabs)/`
      - `_layout.tsx`
      - `create.tsx`
      - `index.tsx`
      - `journeys.tsx`
      - `profile.tsx`
    - `_layout.tsx`
    - `index.tsx`
    - `journey/[id].tsx`
    - `memory/[id].tsx`
  - `assets/`
    - `icon.png`
  - `CLAUDE.md`
  - `constants/`
    - `theme.ts`
  - `eas.json`
  - `eslint.config.js`
  - `expo-env.d.ts`
  - `package.json`
  - `package-lock.json`
  - `scripts/`
    - `reset-project.js`
  - `src/`
    - `api/`
      - `client.ts`
    - `components/`
      - `common/`
        - `Avatar.tsx`
        - `Card.tsx`
        - `Input.tsx`
        - `Loading.tsx`
    - `services/`
      - `auth.service.ts`
      - `journey.service.ts`
      - `memory.service.ts`
    - `store/`
      - `authStore.ts`
      - `index.ts`
      - `journeyStore.ts`
      - `memoryStore.ts`
      - `uiStore.ts`
    - `theme/`
      - `colors.ts`
      - `index.ts`
      - `spacing.ts`
      - `typography.ts`
    - `types/`
      - `api.types.ts`
      - `auth.types.ts`
      - `journey.types.ts`
      - `memory.types.ts`
    - `utils/`
      - `imageUtils.ts`
      - `validators.ts`
  - `tsconfig.json`

## Key features

- Email/password authentication with JWT
- Create and manage journeys
- Add memories with image uploads using Cloudinary
- Invite and remove journey members
- Secure token storage using `expo-secure-store`
- Expo mobile app with modern navigation and UI

## Prerequisites

- Node.js 18+ or later
- npm
- MongoDB instance or MongoDB Atlas cluster
- Cloudinary account for image storage

## Setup

### Install dependencies

From the repository root:

```bash
npm install
```

Then install backend and frontend dependencies separately if needed:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Backend configuration

Create a `.env` file in `backend/` with the following values:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:8081
```

### Start backend

```bash
cd backend
npm run dev
```

The backend listens on `http://localhost:5000` by default.

### Start frontend

```bash
cd frontend
npm start
```

Use Expo Go, an Android emulator, an iOS simulator, or web to run the app.

## API endpoints

### Auth

- `POST /api/v1/auth/register` — register a new user
- `POST /api/v1/auth/login` — sign in and receive a JWT
- `GET /api/v1/auth/me` — fetch authenticated user profile
- `PUT /api/v1/auth/update` — update user profile

### Journeys

- `GET /api/v1/journeys` — list journeys
- `POST /api/v1/journeys` — create a journey with cover image
- `GET /api/v1/journeys/:id` — fetch a journey
- `PUT /api/v1/journeys/:id` — update a journey or upload cover image
- `DELETE /api/v1/journeys/:id` — delete a journey
- `POST /api/v1/journeys/:id/invite` — invite a member
- `DELETE /api/v1/journeys/:id/members/:userId` — remove a member

### Memories

- `GET /api/v1/memories/journey/:journeyId` — list memories for a journey
- `POST /api/v1/memories/journey/:journeyId` — add a memory with image upload
- `GET /api/v1/memories/:id` — fetch a memory
- `PUT /api/v1/memories/:id` — update a memory
- `DELETE /api/v1/memories/:id` — delete a memory

## Notes

- The frontend API base URL is configured in `frontend/src/api/client.ts`.
- Development currently points to a remote backend URL for testing.
- Protected routes require the JWT token in `Authorization: Bearer <token>`.
- Cloudinary powers the image upload workflow for journeys and memories.

## Scripts

### Frontend

- `npm start` — start Expo development
- `npm run android` — launch Android emulator
- `npm run ios` — launch iOS simulator
- `npm run web` — run web version
- `npm run lint` — run Expo lint

### Backend

- `npm run dev` — start backend server
- `npm start` — start backend server

## License

Update this README with your chosen license and deployment details.
