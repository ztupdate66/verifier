# 🚀 Deploy KonsoleH Verifier Now

Your app is **ready to deploy**! Everything is configured and tested. Choose one of these options:

---

## ⚡ FASTEST: Railway (5 minutes)

### Step 1: Push to GitHub
```bash
# On your local machine, download the project files from the "Files" icon
# Or if you have git access to this repo:

cd konsoleh_verifier
git remote add origin https://github.com/YOUR_USERNAME/konsoleh-verifier.git
git push -u origin main
```

### Step 2: Deploy on Railway
1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: Your `konsoleh-verifier` repository
6. **Railway will automatically**:
   - Detect the Dockerfile
   - Build and deploy
   - Give you a public URL

### Step 3: Add Persistent Storage (CRITICAL!)
1. In Railway dashboard, click your service
2. Go to **"Settings"** tab
3. Scroll to **"Volumes"**
4. Click **"+ New Volume"**
5. Mount Path: `/app/data`
6. Click **"Add"**

### Step 4: Set Environment Variable
1. Go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Key: `DATABASE_URL`
4. Value: `file:/app/data/konsoleh.db`
5. Click **"Add"**

### Step 5: Restart
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on latest deployment
3. Click **"Restart"**

**Done!** Your app is live at: `yourapp.up.railway.app`

**Cost**: Free tier includes $5/month credit (plenty for this app)

---

## 🎯 ALTERNATIVE: Render.com

### Step 1: Push to GitHub (same as Railway)

### Step 2: Deploy on Render
1. **Go to**: https://render.com
2. **Sign in** with GitHub
3. **Click**: "New +" → "Web Service"
4. **Connect** your repository
5. **Configure**:
   - **Name**: konsoleh-verifier
   - **Runtime**: Docker
   - **Instance Type**: Free

### Step 3: Add Disk
1. Scroll to **"Disks"**
2. Click **"Add Disk"**
3. **Name**: konsoleh-data
4. **Mount Path**: `/app/data`
5. **Size**: 1 GB

### Step 4: Environment Variables
1. Add variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `file:/app/data/konsoleh.db`

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build

**Done!** Your app is live at: `yourapp.onrender.com`

**Cost**: Free tier available

---

## 🐳 SELF-HOSTED: Docker

If you have a VPS or server with Docker:

```bash
# 1. Clone/copy the project to your server
cd konsoleh_verifier

# 2. Build
docker build -t konsoleh-verifier .

# 3. Run with persistent volume
docker run -d \
  --name konsoleh-verifier \
  -p 3000:3000 \
  -v konsoleh-data:/app/data \
  -e DATABASE_URL="file:/app/data/konsoleh.db" \
  --restart unless-stopped \
  konsoleh-verifier

# 4. Check logs
docker logs -f konsoleh-verifier
```

**Access at**: `http://your-server-ip:3000`

**Set up domain** (optional):
- Point DNS to your server
- Use Nginx/Caddy reverse proxy
- Add SSL with Let's Encrypt

---

## 📦 What's Included & Ready

✅ **Complete Next.js application**
✅ **Dockerfile** (production-optimized)
✅ **Railway configuration** (railway.json)
✅ **Database schema** (Prisma + SQLite)
✅ **Environment config** (.env.production)
✅ **Deployment guide** (DEPLOYMENT.md)
✅ **All dependencies** (package.json)

---

## 🔧 Local Testing (Before Deploy)

Want to test locally first?

```bash
cd konsoleh_verifier
npm install
npx prisma db push
npm run build
npm start

# Visit: http://localhost:3000
```

---

## ⚠️ Important Notes

1. **Volume/Disk is REQUIRED** - Without it, your database will reset on every deploy
2. **Port 25 access** - Some cloud providers block SMTP port 25 for abuse prevention
   - Railway: ✅ Allows port 25
   - Render: ✅ Allows port 25
   - Vercel: ❌ Serverless, not suitable for this app
   - Heroku: ❌ Blocks port 25

3. **Environment Variable** - `DATABASE_URL=file:/app/data/konsoleh.db` is critical

---

## 🎉 After Deployment

1. **Visit your app URL**
2. **Paste some test emails**
3. **Click "Verify"**
4. **Check for konsoleH detection**

Example test emails:
```
test@gmail.com
admin@example.co.za
info@yourdomain.co.za
```

The app will:
- ✅ Validate format
- ✅ Check DNS/MX records
- ✅ Detect konsoleH hosting
- ✅ Verify via SMTP
- ✅ Store results in database

---

## 📞 Deployment Help

**Issues?**
1. Check logs in your deployment platform
2. Verify volume is mounted at `/app/data`
3. Confirm `DATABASE_URL` environment variable
4. Ensure port 3000 is exposed

**Need to update?**
1. Push changes to GitHub
2. Railway/Render auto-deploys
3. Or rebuild Docker image

---

## 🚀 Recommended: Railway

**Why Railway?**
- ✅ Easiest setup (5 minutes)
- ✅ Auto-detects Dockerfile
- ✅ Persistent volumes (critical for SQLite)
- ✅ Free tier ($5/month credit)
- ✅ Allows port 25 (SMTP verification)
- ✅ Auto-deploy on git push
- ✅ Built-in SSL/domains
- ✅ Great developer experience

**Start here**: https://railway.app

---

Your app is production-ready. Pick a platform and deploy! 🎯
