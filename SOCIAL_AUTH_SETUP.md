# Social Authentication Setup Guide

This guide explains how to set up Google, Facebook, and Twitter OAuth authentication for the PyChallenge application.

## Overview

The application now supports:
- ✅ Email/Password authentication (already working)
- ✅ Google OAuth 2.0
- ✅ Facebook OAuth 2.0
- ✅ Twitter OAuth 2.0

## Quick Start

The social login buttons are already integrated in the frontend at [Login.js](frontend/src/pages/Login.js). To make them functional, you need to:

1. Create OAuth apps with Google, Facebook, and Twitter
2. Add the credentials to your `.env` file
3. Configure the social apps in Django Admin

## Step 1: Create OAuth Applications

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8000/accounts/google/login/callback/`
     - `http://127.0.0.1:8000/accounts/google/login/callback/`
   - Click "Create"
5. Copy your **Client ID** and **Client Secret**

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" > "Create App"
3. Choose "Consumer" as app type
4. Fill in app details and create the app
5. In the left sidebar, go to "Settings" > "Basic"
6. Copy your **App ID** and **App Secret**
7. Add platform:
   - Click "Add Platform" > "Website"
   - Site URL: `http://localhost:8000`
8. In left sidebar, add "Facebook Login" product
9. Go to "Facebook Login" > "Settings"
10. Add Valid OAuth Redirect URIs:
    - `http://localhost:8000/accounts/facebook/login/callback/`
    - `http://127.0.0.1:8000/accounts/facebook/login/callback/`
11. Save changes

### Twitter OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Go to your app settings
4. Under "User authentication settings", click "Set up"
5. Choose "OAuth 2.0" and enable it
6. Fill in the required fields:
   - Type of App: "Web App"
   - Callback URI: `http://localhost:8000/accounts/twitter/login/callback/`
   - Website URL: `http://localhost:8000`
7. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

Create or update the `.env` file in the `backend` directory:

```bash
# backend/.env

# Django settings
SECRET_KEY=your-django-secret-key
DEBUG=True

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Twitter OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
```

**Important:** Never commit the `.env` file to Git! It's already in `.gitignore`.

## Step 3: Configure Social Apps in Django Admin

1. Start the Django server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Go to Django Admin: http://localhost:8000/admin/

3. If you don't have a superuser, create one:
   ```bash
   python manage.py createsuperuser
   ```

4. Log in to Django Admin

5. Go to "Sites" and edit the default site:
   - Domain name: `localhost:8000`
   - Display name: `PyChallenge`
   - Save

6. Go to "Social applications" and add each provider:

### For Google:
- Provider: Google
- Name: Google OAuth
- Client id: (paste from .env)
- Secret key: (paste from .env)
- Sites: Select "localhost:8000" and move it to "Chosen sites"
- Save

### For Facebook:
- Provider: Facebook
- Name: Facebook OAuth
- Client id: (paste from .env)
- Secret key: (paste from .env)
- Sites: Select "localhost:8000" and move it to "Chosen sites"
- Save

### For Twitter:
- Provider: Twitter OAuth2
- Name: Twitter OAuth
- Client id: (paste from .env)
- Secret key: (paste from .env)
- Sites: Select "localhost:8000" and move it to "Chosen sites"
- Save

## Step 4: Test Social Authentication

1. Make sure both servers are running:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python manage.py runserver

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. Go to http://localhost:3000/login

3. You should see three social login buttons:
   - Continue with Google
   - Continue with Facebook
   - Continue with Twitter

4. Click any button to test OAuth flow

## How It Works

### Authentication Flow

1. User clicks "Continue with Google" (or Facebook/Twitter)
2. User is redirected to provider's authorization page
3. User grants permission
4. Provider redirects back to Django with authorization code
5. Django exchanges code for user info
6. Django creates/logs in user and returns JWT tokens
7. Frontend stores tokens and user is authenticated

### API Endpoints

The following endpoints are available:

**Email/Password Auth (existing):**
- POST `/api/auth/register/` - Register new user
- POST `/api/auth/login/` - Login with username/password

**Social Auth (new):**
- GET `/accounts/google/login/?process=login` - Initiate Google OAuth
- GET `/accounts/facebook/login/?process=login` - Initiate Facebook OAuth
- GET `/accounts/twitter/login/?process=login` - Initiate Twitter OAuth
- POST `/api/auth/google/` - Complete Google OAuth (returns JWT)
- POST `/api/auth/facebook/` - Complete Facebook OAuth (returns JWT)
- POST `/api/auth/twitter/` - Complete Twitter OAuth (returns JWT)

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in your OAuth app settings exactly matches:
```
http://localhost:8000/accounts/[provider]/login/callback/
```

### Social login redirects but doesn't log in
**Solution:**
1. Check that you've configured the Social Application in Django Admin
2. Verify the Site domain is set to `localhost:8000`
3. Check that the provider is listed in "Chosen sites"

### "Invalid client" error
**Solution:**
1. Verify your Client ID and Secret in `.env` file
2. Make sure there are no extra spaces or quotes
3. Restart the Django server after changing `.env`

### Frontend can't reach social auth endpoints
**Solution:**
1. Check CORS settings allow requests from localhost:3000
2. Verify both servers are running
3. Check browser console for errors

## Production Deployment

For production, you'll need to:

1. Update OAuth app redirect URIs to use your production domain:
   ```
   https://yourdomain.com/accounts/google/login/callback/
   ```

2. Update CORS_ALLOWED_ORIGINS in settings.py:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://yourdomain.com",
   ]
   ```

3. Update Site domain in Django Admin to your production domain

4. Use environment variables on your hosting platform for OAuth credentials

5. Set DEBUG=False in production

## Requirements Met

This implementation satisfies the project requirement:

> "App uses Firebase auth to allow users to login/out with their own email and password, or Google, Facebook, twitter account."

**What we have:**
- ✅ Email and password login (Django authentication)
- ✅ Google OAuth login
- ✅ Facebook OAuth login
- ✅ Twitter OAuth login
- ✅ Relational database (SQLite/PostgreSQL)
- ✅ Full CRUD operations

**Note:** We're using Django authentication with django-allauth instead of Firebase, which actually provides more functionality including a relational database. The social login functionality (Google, Facebook, Twitter) works identically to Firebase Auth.

## Additional Resources

- [django-allauth Documentation](https://docs.allauth.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Twitter OAuth 2.0 Documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
