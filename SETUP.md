# 🎯 SETUP INSTRUCTIONS - REAL Implementation

## ✅ What You're Getting

**100% REAL - NO MOCK DATA:**
- ✅ Real Tavily web search (actual API)
- ✅ Real image downloads (actual HTTP requests)
- ✅ Real MongoDB storage (actual database)
- ✅ Real browser testing (Selenium)

## 📋 Prerequisites

1. **Python 3.11+** installed
2. **Node.js 18+** installed
3. **MongoDB** (local or Atlas)
4. **OpenAI API Key** - https://platform.openai.com/api-keys
5. **Tavily API Key** - https://tavily.com (FREE tier!)

## 🚀 Setup (10 minutes)

### Step 1: Extract Files
```bash
unzip shop-keep.zip
cd shop-keep
```

### Step 2: Get API Keys

**A) Tavily API Key (REQUIRED for web search)**
1. Go to https://tavily.com
2. Sign up (completely FREE!)
3. Copy your API key (starts with `tvly-`)

**B) OpenAI API Key (REQUIRED for LLM)**
1. Go to https://platform.openai.com/api-keys
2. Create API key (starts with `sk-proj-`)

### Step 3: Configure Environment

Edit `backend/.env`:
```bash
cd backend
nano .env  # or use your editor
```

**Add your REAL keys:**
```env
OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-KEY-HERE
TAVILY_API_KEY=tvly-YOUR-ACTUAL-KEY-HERE
MONGODB_URI=mongodb://localhost:27017/shopkeep
```

### Step 4: Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt --break-system-packages
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### Step 5: Start MongoDB

**Option A: Local MongoDB**
```bash
# Create data directory
mkdir -p ~/data/db

# Start MongoDB
mongod --dbpath ~/data/db
```

**Option B: MongoDB Atlas (Cloud - FREE)**
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

### Step 6: Start Backend

**Terminal 1:**
```bash
cd backend
python main.py
```

**Expected output:**
```
✅ MongoDB initialized
✅ Tavily Web Search initialized
✅ Server starting on: http://localhost:8000
```

### Step 7: Start Frontend

**Terminal 2:**
```bash
cd frontend
npm start
```

Browser opens to http://localhost:3000

## 🎮 First Run

1. Open http://localhost:3000
2. Click **"Admin"**
3. Enter command:
   ```
   Stock my store with 3 trending mechanical keyboards
   ```
4. Click **"Execute Command"**
5. Watch the terminal - you'll see:
   - 🌐 Tavily API being called
   - 📥 Images being downloaded
   - 💾 MongoDB inserts
   - 🧪 Browser testing

## ✅ Verify It's Real

```bash
# 1. Check downloaded images
ls -lh static/images/
# You should see real .jpg files!

# 2. Check created descriptions
ls -la static/desc/
cat static/desc/*.md

# 3. Check MongoDB
curl http://localhost:8000/api/products | jq
# Or use MongoDB shell:
mongo shopkeep
> db.products.find().pretty()

# 4. Check frontend
# Open http://localhost:3000
# You should see real products!
```

## 🐛 Troubleshooting

### "Tavily API error"
```
Problem: TAVILY_API_KEY not set or invalid
Solution:
1. Get FREE key at https://tavily.com
2. Add to backend/.env:
   TAVILY_API_KEY=tvly-your-key
3. Restart backend
```

### "MongoDB connection failed"
```
Problem: MongoDB not running
Solution A (Local):
  mongod --dbpath ~/data/db

Solution B (Cloud):
  1. Create cluster at https://cloud.mongodb.com
  2. Get connection string
  3. Update MONGODB_URI in backend/.env
  4. Restart backend
```

### "OpenAI API error"
```
Problem: OPENAI_API_KEY not set or no credits
Solution:
1. Check key at https://platform.openai.com/api-keys
2. Check credits at https://platform.openai.com/usage
3. Update backend/.env
4. Restart backend
```

### "Images not downloading"
```
Problem: Network or URL issues
Note: Some URLs may fail (normal)
- Most images should download successfully
- Check internet connection
- Agent will use placeholder for failed downloads
```

### "Browser automation failed"
```
Problem: Chrome/Chromium not installed
Solution (Ubuntu):
  sudo apt install chromium-browser

Note: Agent will still work, just skip browser verification
```

## 📝 Test Commands

Try these in the Admin panel:

```
Stock my store with 3 trending mechanical keyboards under $150
```

```
Find 3 popular gaming mice under $50
```

```
Add the latest iPhone 16 to the store
```

```
Stock 2 wireless headphones under $100
```

## 🎯 Success Checklist

- [ ] Tavily API key in `backend/.env`
- [ ] OpenAI API key in `backend/.env`
- [ ] MongoDB running
- [ ] Backend started (no errors)
- [ ] Frontend running
- [ ] Agent command executed
- [ ] Tavily API calls in logs
- [ ] Images in `static/images/`
- [ ] Descriptions in `static/desc/`
- [ ] Products in MongoDB
- [ ] Products visible on frontend

## 📚 Documentation

- **README.md** - Full project documentation
- **QUICKSTART.md** - Quick setup guide
- **REAL_FEATURES.md** - Proof everything is real
- **backend/.env** - Configuration (add your keys!)

## 🎉 Success!

If you see products with real images from the web, **IT WORKED!**

You now have a REAL autonomous e-commerce platform that:
- ✅ Searches the real web (Tavily)
- ✅ Downloads real images
- ✅ Stores in real database
- ✅ Tests with real browser
- ✅ **NO MOCK DATA!**

## 💡 What's Next?

1. **Try different commands** - Test various product types
2. **Check the code** - See how each tool works
3. **Read REAL_FEATURES.md** - Understand what's real
4. **Customize** - Modify prompts, add features
5. **Deploy** - Use Vercel + Railway for production

---

**Need Help?**
- Check backend terminal for errors
- Verify API keys are set correctly
- Ensure MongoDB is running
- Read REAL_FEATURES.md for verification steps

Enjoy your REAL autonomous e-commerce platform! 🛍️
