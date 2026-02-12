# PhotoContent AI - Local & Free Hosting Setup Guide

## Table of Contents
1. [Local Setup (Quick Start)](#local-setup)
2. [Ollama Integration (Free AI)](#ollama-setup)
3. [Free Hosting Options](#free-hosting)
4. [Environment Variables](#environment-variables)

---

## 1. Local Setup (Quick Start) {#local-setup}

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- Python 3.10+ (https://python.org)
- MongoDB (local or MongoDB Atlas free tier)
- Git

### Step 1: Clone from GitHub
```bash
# After saving to GitHub from Emergent
git clone https://github.com/YOUR_USERNAME/photo-content-ai.git
cd photo-content-ai
```

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings (see Environment Variables section)

# Run backend
uvicorn server:app --reload --port 8001
```

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
yarn install
# or: npm install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Run frontend
yarn start
# or: npm start
```

### Step 4: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Mac: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com

# Start MongoDB
mongod --dbpath /path/to/data
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Go to https://mongodb.com/atlas
2. Create free account
3. Create free cluster (M0 Sandbox - FREE)
4. Get connection string
5. Add to backend/.env: `MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net"`

---

## 2. Ollama Integration (FREE Local AI) {#ollama-setup}

### What is Ollama?
Ollama runs LLMs locally on your machine - completely FREE, no API keys needed!

### Step 1: Install Ollama
```bash
# Mac
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### Step 2: Download Models

**Recommended Models for This App:**

| Model | Size | Best For | Command |
|-------|------|----------|---------|
| **llama3.2** | 2GB | Fast captions, hashtags | `ollama pull llama3.2` |
| **llama3.1:8b** | 4.7GB | Better quality text | `ollama pull llama3.1:8b` |
| **mistral** | 4.1GB | Creative writing | `ollama pull mistral` |
| **gemma2:9b** | 5.4GB | High quality output | `ollama pull gemma2:9b` |
| **phi3** | 2.2GB | Lightweight, fast | `ollama pull phi3` |
| **llava** | 4.5GB | Image understanding | `ollama pull llava` |

**My Recommendations:**
- **Low RAM (8GB):** `llama3.2` or `phi3`
- **Medium RAM (16GB):** `llama3.1:8b` or `mistral`
- **High RAM (32GB+):** `gemma2:9b` or `llama3.1:70b`

### Step 3: Start Ollama
```bash
# Start Ollama server
ollama serve

# In another terminal, test it
ollama run llama3.2 "Write a wedding photography caption"
```

### Step 4: Update Backend for Ollama

Create a new file `backend/ollama_service.py`:

```python
import httpx
import json
from typing import Optional, List

OLLAMA_BASE_URL = "http://localhost:11434"

async def generate_with_ollama(
    prompt: str,
    model: str = "llama3.2",
    system_message: str = "You are a helpful assistant."
) -> str:
    """Generate text using local Ollama"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "system": system_message,
                "stream": False
            }
        )
        result = response.json()
        return result.get("response", "")

async def generate_caption_ollama(
    niche: str,
    topic: Optional[str] = None,
    tone: str = "professional",
    model: str = "llama3.2"
) -> dict:
    """Generate Instagram caption using Ollama"""
    
    system_message = """You are an expert Instagram content strategist for photography businesses.
    Generate engaging captions that drive engagement and bookings.
    Always return response in JSON format with keys: caption, hashtags (array), engagement_tips (array)"""
    
    topic_text = f" about {topic}" if topic else ""
    
    prompt = f"""Create an Instagram caption for a {niche} photography business{topic_text}.
    Tone: {tone}
    
    Generate:
    1. A compelling caption (150-300 characters)
    2. 10 relevant hashtags
    3. 3 engagement tips
    
    Return as JSON: {{"caption": "...", "hashtags": ["#tag1", ...], "engagement_tips": ["tip1", ...]}}"""
    
    response = await generate_with_ollama(prompt, model, system_message)
    
    # Parse JSON from response
    try:
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    
    # Fallback
    return {
        "caption": response[:300],
        "hashtags": [f"#{niche}photography", "#photographer", "#photooftheday"],
        "engagement_tips": ["Post during peak hours", "Engage with comments"]
    }

async def generate_ideas_ollama(
    niche: str,
    count: int = 5,
    model: str = "llama3.2"
) -> List[dict]:
    """Generate content ideas using Ollama"""
    
    prompt = f"""Generate {count} Instagram content ideas for a {niche} photography business.
    
    For each idea include:
    - title: catchy title
    - description: what to post
    - suggested_caption: ready-to-use caption
    - suggested_hashtags: 5 hashtags
    - best_time_to_post: optimal time
    - content_type: photo/carousel/reel/story
    
    Return as JSON array."""
    
    response = await generate_with_ollama(prompt, model)
    
    try:
        import re
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())[:count]
    except:
        pass
    
    return []

# Check if Ollama is running
async def check_ollama_status() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return response.status_code == 200
    except:
        return False

async def list_ollama_models() -> List[str]:
    """List available Ollama models"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            data = response.json()
            return [m["name"] for m in data.get("models", [])]
    except:
        return []
```

### Step 5: Update server.py to Support Ollama

Add to your `server.py`:

```python
from ollama_service import (
    generate_caption_ollama, 
    generate_ideas_ollama,
    check_ollama_status,
    list_ollama_models
)

# Add environment variable
USE_OLLAMA = os.environ.get("USE_OLLAMA", "false").lower() == "true"
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")

# Update caption endpoint
@api_router.post("/content/generate-caption")
async def generate_caption(request: CaptionRequest):
    if USE_OLLAMA:
        result = await generate_caption_ollama(
            niche=request.niche,
            topic=request.topic,
            tone=request.tone,
            model=OLLAMA_MODEL
        )
        return CaptionResponse(**result)
    else:
        # ... existing Emergent/Gemini code ...

# Add Ollama status endpoint
@api_router.get("/ollama/status")
async def ollama_status():
    is_running = await check_ollama_status()
    models = await list_ollama_models() if is_running else []
    return {
        "ollama_enabled": USE_OLLAMA,
        "is_running": is_running,
        "available_models": models,
        "current_model": OLLAMA_MODEL
    }
```

### Step 6: Update backend/.env for Ollama
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="photocontent"
CORS_ORIGINS="*"

# Ollama Settings (FREE local AI)
USE_OLLAMA=true
OLLAMA_MODEL=llama3.2

# Keep Emergent key as fallback (optional)
# EMERGENT_LLM_KEY=sk-emergent-xxx
```

---

## 3. Free Hosting Options {#free-hosting}

### Option A: Vercel + Railway (Recommended)

**Frontend on Vercel (FREE):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel

# Set environment variable in Vercel dashboard:
# REACT_APP_BACKEND_URL = your-railway-url
```

**Backend on Railway (FREE $5/month credit):**
1. Go to https://railway.app
2. Connect GitHub repo
3. Select backend folder
4. Add environment variables
5. Deploy!

### Option B: Render.com (FREE)

**Both frontend & backend FREE:**
1. Go to https://render.com
2. Create account with GitHub
3. New → Web Service → Connect repo

**Backend:**
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

**Frontend:**
- Build Command: `yarn build`
- Publish Directory: `build`

### Option C: Fly.io (FREE tier)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy backend
cd backend
fly launch
fly deploy

# Deploy frontend
cd frontend
fly launch
fly deploy
```

### Option D: Self-Hosted (VPS)

**Cheapest VPS options:**
- Oracle Cloud: FREE forever (ARM instances)
- Google Cloud: $300 free credit
- Hetzner: €3.79/month
- DigitalOcean: $5/month

**Setup with Docker:**
```bash
# Create docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - USE_OLLAMA=true
    depends_on:
      - mongo
      
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001
      
  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
      
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  mongo_data:
  ollama_data:
```

---

## 4. Environment Variables Reference {#environment-variables}

### backend/.env
```env
# Database (Required)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="photocontent"

# CORS
CORS_ORIGINS="*"

# AI Provider - Choose ONE:

# Option 1: Ollama (FREE, local)
USE_OLLAMA=true
OLLAMA_MODEL=llama3.2
OLLAMA_URL=http://localhost:11434

# Option 2: Emergent Key (paid, cloud)
# USE_OLLAMA=false
# EMERGENT_LLM_KEY=sk-emergent-xxx

# Option 3: Direct API Keys (paid)
# OPENAI_API_KEY=sk-xxx
# GOOGLE_API_KEY=xxx
```

### frontend/.env
```env
# Local development
REACT_APP_BACKEND_URL=http://localhost:8001

# Production (update with your hosting URL)
# REACT_APP_BACKEND_URL=https://your-backend.railway.app
```

---

## Quick Start Commands Summary

```bash
# 1. Clone repo
git clone <your-repo>
cd photo-content-ai

# 2. Install Ollama & download model
ollama pull llama3.2
ollama serve &

# 3. Start MongoDB (or use Atlas)
mongod &

# 4. Start Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "USE_OLLAMA=true" >> .env
echo "OLLAMA_MODEL=llama3.2" >> .env
uvicorn server:app --reload --port 8001 &

# 5. Start Frontend
cd ../frontend
yarn install
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
yarn start

# 6. Open http://localhost:3000 🎉
```

---

## Ollama Model Comparison

| Model | RAM Needed | Speed | Quality | Best For |
|-------|-----------|-------|---------|----------|
| phi3 | 4GB | ⚡⚡⚡ | ⭐⭐ | Quick drafts |
| llama3.2 | 4GB | ⚡⚡⚡ | ⭐⭐⭐ | Daily use |
| mistral | 8GB | ⚡⚡ | ⭐⭐⭐ | Creative writing |
| llama3.1:8b | 8GB | ⚡⚡ | ⭐⭐⭐⭐ | High quality |
| gemma2:9b | 12GB | ⚡ | ⭐⭐⭐⭐⭐ | Best quality |
| llava | 8GB | ⚡ | ⭐⭐⭐ | Image understanding |

**Note:** Image generation still requires cloud APIs (OpenAI/Gemini) - Ollama doesn't support image generation yet.

---

## Need Help?

- Ollama Docs: https://ollama.com/docs
- MongoDB Atlas: https://mongodb.com/atlas
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
