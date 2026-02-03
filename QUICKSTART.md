# 🚀 QUICKSTART - REAL Implementation

**Get Shop-Keep running in 10 minutes with REAL web search!**

## ⚡ Super Quick Setup

```bash
# 1. Extract
unzip shop-keep.zip && cd shop-keep

# 2. Get API Keys
# OpenAI: https://platform.openai.com/api-keys
# Tavily: https://tavily.com (FREE!)

# 3. Configure
nano backend/.env
# Add your REAL API keys:
#   OPENAI_API_KEY=sk-proj-YOUR-KEY
#   TAVILY_API_KEY=tvly-YOUR-KEY

# 4. Install Backend
cd backend && pip install -r requirements.txt --break-system-packages

# 5. Install Frontend  
cd ../frontend && npm install

# 6. Start MongoDB (choose one)
# Local: mongod --dbpath ~/data/db
# OR use MongoDB Atlas cloud

# 7. Start Backend (Terminal 1)
cd backend && python main.py

# 8. Start Frontend (Terminal 2)
cd frontend && npm start

# 9. Use the Agent!
# Open http://localhost:3000/admin
# Enter: "Stock my store with 3 trending mechanical keyboards"
# Watch REAL web search, downloads, and database inserts!
```

## Critical: API Keys

**You MUST have these:**

1. **Tavily API Key** (for REAL web search)
   - Go to https://tavily.com
   - Sign up (FREE!)
   - Copy API key
   - Add to `backend/.env` as `TAVILY_API_KEY=tvly-...`

2. **OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create API key
   - Add to `backend/.env` as `OPENAI_API_KEY=sk-proj-...`

## Verify It's REAL

After running the agent:

```bash
# 1. Check downloaded images (REAL!)
ls -la static/images/*.jpg

# 2. Check created descriptions (REAL!)
ls -la static/desc/*.md

# 3. Check MongoDB (REAL!)
curl http://localhost:8000/api/products | jq

# 4. Check frontend (REAL!)
# Open http://localhost:3000 - see real products!
```

##  Quick Fixes

**"Tavily API error"**
```bash
# Get FREE key at https://tavily.com
# Add to backend/.env:
TAVILY_API_KEY=tvly-your-key-here
```

**"MongoDB connection failed"**
```bash
# Start MongoDB:
mongod --dbpath ~/data/db

# OR use Atlas (cloud):
# Get connection string from https://cloud.mongodb.com
# Update MONGODB_URI in backend/.env
```

**"Images not downloading"**
- Check internet connection
- Some URLs may fail (normal)
- Most should succeed

## Test Commands

```
Stock my store with 3 trending mechanical keyboards
Find 3 popular gaming mice under $50
Add the latest iPhone 16 to the store
```

## ✨ What's REAL

- Tavily web search (actual API calls)
- Image downloads (real HTTP requests)
- MongoDB inserts (real database)  
- Browser testing (real Selenium)
- NO mock data
- NO fake results
- NO placeholders

##  Success!

If you see products with real images from the web, **IT WORKED!**

You now have a REAL autonomous e-commerce platform!

---

Need help? Check README.md for full documentation.
