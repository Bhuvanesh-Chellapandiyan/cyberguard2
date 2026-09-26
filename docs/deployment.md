# Production Deployment Guide

## 1. Overview
The CyberGuard platform is designed for cloud-native deployment:
- **Frontend:** Vercel (React Single Page Application)
- **Backend:** Render or Railway (Python FastAPI + Uvicorn)
- **Database:** MongoDB Atlas (Cloud Managed NoSQL)

---

## 2. MongoDB Atlas Setup
1. Create a free M0 Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write privileges.
3. In **Network Access**, add `0.0.0.0/0` (or the specific outbound IPs of your Render/Railway backend).
4. Copy the connection string format:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=phishing_detector
   ```

---

## 3. Backend Deployment (Render / Railway)

### 3.1 Render Configuration
1. Connect your GitHub repository to Render.
2. Create a new **Web Service** pointing to the `backend/` directory.
3. Configure the service settings:
   - **Environment:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set the Environment Variables in the Render Dashboard:
   - `ENVIRONMENT`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `MONGODB_DB_NAME`: `phishing_detector`
   - `JWT_SECRET`: `<A 64-character secure random string>`
   - `JWT_EXPIRE_MINUTES`: `120`
   - `FRONTEND_URL`: `https://<your-vercel-app>.vercel.app`
5. Note your deployed backend URL: `https://<your-backend-app>.onrender.com`.

---

## 4. Frontend Deployment (Vercel)

### 4.1 Vercel Configuration
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Configure the Environment Variable:
   - `VITE_API_URL`: `https://<your-backend-app>.onrender.com` (Note: **NO** trailing slash).
5. Ensure `frontend/vercel.json` exists for client-side single page app routing:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Deploy the project.

---

## 5. Docker Compose Local Staging
To run the full stack containerized locally:
```bash
docker-compose up --build
```
Access points:
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- MongoDB: `localhost:27017`

---

## 6. Verification Checklist
- [x] Backend responds to `GET /api/health` with `{"status": "ok", "database": "connected"}`.
- [x] Frontend successfully accesses `${VITE_API_URL}/api/auth/login`.
- [x] CORS rejects unauthorized origins and permits the production frontend domain.
- [x] No plaintext passwords or secrets committed to repository.
