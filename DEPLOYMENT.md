# Deployment Guide

Complete guide to deploying PyChallenge to production using Firebase Hosting (frontend) and Render (backend).

---

## Prerequisites

Before deploying, ensure you have:
- [Firebase CLI](https://firebase.google.com/docs/cli) installed: `npm install -g firebase-tools`
- A [Firebase account](https://console.firebase.google.com/)
- A [Render account](https://render.com/) (free tier available)
- Git repository with your code

---

## Part 1: Deploy Django Backend to Render

### Step 1: Prepare Your Backend

Your backend is already configured for Render deployment with:
- ✅ Production settings in `backend/settings.py`
- ✅ PostgreSQL database configuration
- ✅ `requirements.txt` with production dependencies
- ✅ `build.sh` script for deployment
- ✅ `render.yaml` configuration file

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** `pychallenge-backend` (or your choice)
   - **Region:** Oregon (or your preferred region)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn backend.wsgi:application`

### Step 3: Add Environment Variables

In Render dashboard, go to **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `DEBUG` | `False` | Required |
| `SECRET_KEY` | (auto-generated) | Click "Generate" |
| `PYTHON_VERSION` | `3.12.0` | Required |
| `ALLOWED_HOSTS` | `your-app-name.onrender.com` | Replace with your Render URL |
| `CORS_ALLOWED_ORIGINS` | `https://your-firebase-app.web.app` | Add after deploying frontend |

### Step 4: Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `pychallenge-db`
   - **Region:** Same as your web service
   - **Plan:** Free
3. Click **"Create Database"**
4. Copy the **Internal Database URL**
5. Go back to your web service → Environment tab
6. Add: `DATABASE_URL` = (paste the internal database URL)

### Step 5: Deploy Backend

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Run migrations
   - Collect static files
   - Start the server
3. Wait for deployment to complete (2-5 minutes)
4. Your backend will be live at: `https://your-app-name.onrender.com`

### Step 6: Load Sample Data (Optional)

To load sample quizzes in production:

1. Go to your Render web service
2. Click **"Shell"** tab
3. Run: `python migrate_quizzes.py`
4. This creates the admin user and 5 sample quizzes

### Step 7: Test Backend API

Test your deployed API:
```bash
curl https://your-app-name.onrender.com/api/quizzes/
```

You should see quiz data or an empty array `[]`.

---

## Part 2: Deploy React Frontend to Firebase

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `pychallenge` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 4: Initialize Firebase in Your Project

```bash
cd frontend
firebase init
```

Select the following options:
- **Which Firebase features?** → Select **"Hosting"**
- **Use an existing project** → Select your project
- **Public directory:** `build`
- **Configure as SPA:** `Yes`
- **Set up automatic builds with GitHub?** `No` (for now)
- **Overwrite index.html?** `No`

### Step 5: Update Firebase Configuration

The `firebase.json` file has already been created for you. Verify it exists:

```bash
cat firebase.json
```

Create `.firebaserc` from the example:

```bash
cp .firebaserc.example .firebaserc
```

Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

### Step 6: Update Production Environment Variables

Edit `frontend/.env.production`:

```env
REACT_APP_API_URL=https://your-app-name.onrender.com/api
```

Replace `your-app-name.onrender.com` with your actual Render backend URL.

### Step 7: Build Your React App

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Step 8: Deploy to Firebase

```bash
firebase deploy
```

Your frontend will be deployed to:
- **Live URL:** `https://your-project-id.web.app`
- **Alternative:** `https://your-project-id.firebaseapp.com`

### Step 9: Update CORS Settings

Now that your frontend is deployed, update your backend CORS settings:

1. Go to your Render dashboard
2. Navigate to your web service → **Environment** tab
3. Update `CORS_ALLOWED_ORIGINS`:
   ```
   https://your-project-id.web.app,https://your-project-id.firebaseapp.com
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy your backend

---

## Part 3: Verify Deployment

### Test Your Live Application

1. Open your Firebase URL: `https://your-project-id.web.app`
2. Register a new account
3. Create a quiz
4. Take a quiz
5. Check the leaderboard

### Check Browser Console

Open DevTools (F12) and check:
- No CORS errors
- API requests going to your Render backend
- Successful responses from the backend

---

## Continuous Deployment

### Frontend (Firebase)

To deploy updates:

```bash
cd frontend
npm run build
firebase deploy
```

### Backend (Render)

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will detect the push and redeploy automatically.

---

## Environment Variables Reference

### Backend (Render)

| Variable | Example | Required |
|----------|---------|----------|
| `DEBUG` | `False` | Yes |
| `SECRET_KEY` | (auto-generated) | Yes |
| `ALLOWED_HOSTS` | `myapp.onrender.com` | Yes |
| `CORS_ALLOWED_ORIGINS` | `https://myapp.web.app` | Yes |
| `DATABASE_URL` | (auto-provided by Render) | Yes |
| `PYTHON_VERSION` | `3.12.0` | Yes |

### Frontend (Firebase)

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## Troubleshooting

### Backend Issues

**"Application failed to start"**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `DATABASE_URL` is configured

**CORS errors**
- Verify `CORS_ALLOWED_ORIGINS` includes your Firebase URL
- Check that origins include the protocol (`https://`)

**500 Internal Server Error**
- Check Render logs: Dashboard → Logs tab
- Verify database migrations ran successfully
- Check `SECRET_KEY` is set

### Frontend Issues

**"Network Error" when calling API**
- Verify `REACT_APP_API_URL` in `.env.production`
- Rebuild: `npm run build && firebase deploy`
- Check backend CORS settings

**Blank page after deployment**
- Check browser console for errors
- Verify `firebase.json` has correct configuration
- Ensure SPA rewrite rule is present

**404 on page refresh**
- Verify `firebase.json` has rewrite rule for SPA

---

## Costs

### Firebase Hosting (Free Tier)
- 10 GB storage
- 360 MB/day data transfer
- Custom domain support

### Render (Free Tier)
- 750 hours/month (enough for 1 service)
- Automatic SSL
- PostgreSQL database (90 days, then expires)

**Note:** Render free tier services spin down after 15 minutes of inactivity. First request may be slow (cold start).

---

## Custom Domain (Optional)

### Firebase Custom Domain

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

### Render Custom Domain

1. Go to Render Dashboard → Your service
2. Click "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as instructed

---

## Monitoring

### Backend Monitoring (Render)
- Dashboard → Logs: Real-time logs
- Dashboard → Metrics: CPU, memory usage
- Set up email alerts for downtime

### Frontend Monitoring (Firebase)
- Firebase Console → Analytics
- Firebase Console → Performance Monitoring

---

## Security Checklist

- ✅ `DEBUG = False` in production
- ✅ Strong `SECRET_KEY` (auto-generated)
- ✅ HTTPS enabled (automatic on both platforms)
- ✅ CORS properly configured
- ✅ Database credentials secure (managed by Render)
- ✅ Environment variables not committed to Git

---

## Next Steps

After successful deployment:

1. **Set up monitoring** - Enable error tracking
2. **Configure backups** - Set up database backups on Render
3. **Add custom domain** - Use your own domain name
4. **Set up CI/CD** - Automate deployments with GitHub Actions
5. **Performance optimization** - Add caching, CDN
6. **User analytics** - Track user behavior and errors

---

## Support Resources

- **Firebase Docs:** https://firebase.google.com/docs/hosting
- **Render Docs:** https://render.com/docs
- **Django Deployment:** https://docs.djangoproject.com/en/5.2/howto/deployment/

---

**Last Updated:** December 17, 2025
