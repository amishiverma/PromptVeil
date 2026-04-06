# 🔐 Google Authentication Setup Guide

## Overview
The PromptVeil application now includes complete Google OAuth 2.0 authentication. Users must log in via Google before accessing the dashboard.

---

## 🚀 Setup Instructions

### Step 1: Frontend Configuration

#### 1.1 Install Dependencies
The required `@react-oauth/google` package is already in `frontend/package.json`. Install all dependencies:

```bash
cd frontend
npm install
```

#### 1.2 Create Frontend `.env` File
Create a `.env` file in the `frontend/` directory with your Google Client ID:

```bash
# frontend/.env
VITE_GOOGLE_CLIENT_ID=187376036769-dqkv2o8s3auue9u3soglp8elo6jh79gi.apps.googleusercontent.com
VITE_BACKEND_URL=http://localhost:8000
```

**Note:** Your Google Client ID is already provided: `187376036769-dqkv2o8s3auue9u3soglp8elo6jh79gi.apps.googleusercontent.com`

---

### Step 2: Backend Configuration

#### 2.1 Install Python Dependencies
Update and install backend requirements that now include Google authentication libraries:

```bash
cd backend
pip install -r requirements.txt
```

**New packages added:**
- `google-auth>=2.25.0` - Google authentication
- `google-auth-oauthlib>=1.2.0` - OAuth library
- `python-jose[cryptography]>=3.3.0` - JWT token handling
- `passlib[bcrypt]>=1.7.4` - Password utilities
- `sqlalchemy>=2.0.0` - Database ORM

#### 2.2 Create Backend `.env` File
Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
GOOGLE_CLIENT_ID=187376036769-dqkv2o8s3auue9u3soglp8elo6jh79gi.apps.googleusercontent.com
SECRET_KEY=your_super_secret_key_change_me_in_production_with_something_long_and_random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./promptveil_auth.db

# Optional API Keys
NVIDIA_API_KEY=your_nvidia_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
```

**Important:** Generate a strong `SECRET_KEY` for production:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🔄 Authentication Flow

### How It Works

1. **User visits `/login`** - Unauthenticated users are redirected here
2. **Google Sign-In** - User clicks "Sign in with Google"
3. **Google OAuth** - Browser redirects to Google, user authenticates
4. **ID Token** - Google returns an ID token to the frontend
5. **Backend Exchange** - Frontend sends token to `POST /auth/google`
6. **JWT Creation** - Backend verifies Google token and creates a JWT
7. **Dashboard Access** - Frontend stores JWT and user can access protected pages
8. **Protected Routes** - All app pages require valid JWT token
9. **Token Verification** - Backend verifies JWT on each authenticated request

---

## 📁 New Files Created

### Backend
- **`backend/.env.example`** - Environment template
- **Updated `backend/auth.py`** - Google token verification & JWT creation
- **Updated `backend/models.py`** - User table with Google ID
- **Updated `backend/main.py`** - Google auth endpoints:
  - `POST /auth/google` - Exchange Google token for JWT
  - `GET /auth/user` - Get current user info
  - `POST /auth/logout` - Logout endpoint

### Frontend
- **`frontend/.env.example`** - Environment template
- **`frontend/src/contexts/AuthContext.jsx`** - Auth state management
- **`frontend/src/pages/Login.jsx`** - Login page with Google Sign-In
- **`frontend/src/pages/Login.css`** - Login page styling
- **`frontend/src/components/ProtectedRoute.jsx`** - Route protection wrapper
- **`frontend/src/utils/authUtils.js`** - Auth helper functions

### Configuration
- **Updated `frontend/src/main.jsx`** - Added GoogleOAuthProvider wrapper
- **Updated `frontend/src/App.jsx`** - Protected routes setup
- **Updated `frontend/src/layouts/MainLayout.jsx`** - User dropdown with logout
- **Updated `frontend/.gitignore`** - Environment files excluded

---

## 🛣️ Protected Routes

All main app routes now require authentication:
- `/` - Dashboard (Protected)
- `/detect` - Threat Detection (Protected)
- `/analytics` - Payload Analytics (Protected)
- `/policies` - Defense Policies (Protected)
- `/redteam` - Red Teaming (Protected)
- `/chat` - Secure Chat (Protected)
- `/login` - Login Page (Public)

Unauthenticated users trying to access protected routes are redirected to `/login`.

---

## 🚀 Running the Application

### Terminal 1: Start Backend
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### First Login
1. Visit `http://localhost:5173`
2. You'll be redirected to `/login`
3. Click "Sign in with Google"
4. Authenticate with your Google account
5. You'll be redirected to the dashboard
6. User info (name, email, picture) is displayed in top-right dropdown

---

## 🔗 API Endpoints

### Authentication Endpoints

#### `POST /auth/google`
Exchange Google token for JWT token.

**Request:**
```json
{
  "token": "google_id_token_here"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://..."
  }
}
```

#### `GET /auth/user`
Get current authenticated user (requires valid JWT).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

#### `POST /auth/logout`
Logout endpoint (optional, JWT is stateless).

---

## 🛡️ Security Considerations

1. **JWT Secret Key** - Use a strong, random SECRET_KEY in production
2. **HTTPS** - Always use HTTPS in production
3. **Token Expiration** - Tokens expire after 30 minutes (configurable)
4. **Secure Storage** - Tokens stored in localStorage (consider sessionStorage for enhanced security)
5. **CORS** - Configure CORS_ORIGINS in `.env` for production domains
6. **Google Verification** - Backend verifies all Google tokens with Google's servers

---

## 🐛 Troubleshooting

### "Google Sign-In not loading"
- Check if `VITE_GOOGLE_CLIENT_ID` is correct in `frontend/.env`
- Verify Google Cloud project exists and OAuth consent screen is configured
- Check browser console for errors

### "401 Unauthorized errors"
- Token may have expired, user needs to log out and log back in
- Check if backend's `GOOGLE_CLIENT_ID` matches frontend's
- Verify JWT `SECRET_KEY` hasn't changed

### "User not found" after login
- Database might not be initialized, restart backend (it auto-creates tables)
- Check `promptveil_auth.db` file exists in backend directory

### "CORS errors"
- Update `CORS_ORIGINS` in `backend/.env` to include your frontend URL
- Ensure backend has `allow_origins=["*"]` in development

---

## 📝 Environment Variables Reference

### Frontend (`frontend/.env`)
```
VITE_GOOGLE_CLIENT_ID      - Google OAuth 2.0 Client ID
VITE_BACKEND_URL           - Backend API URL (default: http://localhost:8000)
```

### Backend (`backend/.env`)
```
GOOGLE_CLIENT_ID           - Same as frontend
SECRET_KEY                 - JWT signing key (must be long and random)
ALGORITHM                  - JWT algorithm (HS256)
ACCESS_TOKEN_EXPIRE_MINUTES - Token lifetime in minutes
DATABASE_URL              - SQLite database path
NVIDIA_API_KEY            - NVIDIA API key (optional)
GEMINI_API_KEY            - Google Gemini API key (optional)
OPENAI_API_KEY            - OpenAI API key (optional)
CORS_ORIGINS              - Comma-separated list of allowed origins
```

---

## ✅ Implementation Complete

Your PromptVeil application now has:
✓ Google OAuth 2.0 authentication
✓ JWT token management
✓ Protected routes
✓ User session management
✓ Logout functionality
✓ Database user storage
✓ Beautiful login page
✓ User dropdown in navigation

**All API endpoints are now protected and require authentication!**
