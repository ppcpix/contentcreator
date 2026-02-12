# Instagram Content Creator - Product Requirements Document

## Problem Statement
Photography business is experiencing low engagement on Instagram due to lack of consistent content. Need an intelligent content creator that can boost audience engagement and attract new business.

## User Personas
- **Professional Photographers**: Wedding, portrait, landscape, event, housewarming, baby shower specialists
- **Photography Business Owners**: Need to maintain active Instagram presence to attract clients

## Core Requirements

### AI Content Generation
- [x] Caption generation using Gemini 3 Flash
- [x] Hashtag suggestions based on photography niche
- [x] Content ideas generator for each niche
- [x] Image generation with Gemini Nano Banana
- [x] Image generation with OpenAI GPT Image 1
- [x] Support for user-uploaded photos/videos

### Photography Niches Supported
- [x] Wedding
- [x] Portrait
- [x] Landscape
- [x] Event
- [x] Housewarming
- [x] Baby Shower

### Features Implemented (Feb 12, 2026)

#### Content Ideas Hub (NEW - 4 Tabs)
1. **Niche Ideas**: AI-generated content ideas specific to your photography niche
2. **Photo Tips**: AI-generated photography tips by category:
   - Lighting tips
   - Composition tips
   - Camera settings
   - Posing guidance
   - Business tips
   - Editing tips
3. **Content Mix**: Diverse content ideas for:
   - Behind the scenes
   - Educational posts
   - Engagement posts
   - Trending content
   - Portfolio showcase
4. **Seasonal Calendar**: Month-by-month content ideas:
   - January: New Year resolution shoots, Winter wonderland sessions
   - February: Valentine's couples sessions, Galentine's group shoots
   - March-December: All seasonal themes covered

#### Other Features
- **Dashboard**: Quick stats, recent content, quick action cards
- **Content Creator**: 
  - AI caption generation with tone selection
  - AI image generation (Gemini/OpenAI)
  - Photo upload capability
  - Hashtag suggestions
- **Content Calendar**: Schedule and manage posts
- **Analytics Dashboard**: Track performance metrics

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: FastAPI, Python 3
- **Database**: MongoDB
- **AI Integration**: Emergent LLM Key (Gemini 3 Flash, Gemini Nano Banana, OpenAI GPT Image 1)

## API Endpoints
### Content Ideas Hub
- `GET /api/tips/categories` - Get tip categories
- `POST /api/tips/generate` - AI photography tips
- `GET /api/tips/static` - Static tips database
- `GET /api/content-mix/categories` - Content mix categories
- `POST /api/content-mix/generate` - AI content mix ideas
- `GET /api/content-mix/static` - Static content mix database
- `GET /api/seasonal` - Seasonal content by month

### Core APIs
- `GET /api/niches` - Get all photography niches
- `GET /api/hashtags/{niche}` - Get hashtags for niche
- `POST /api/content/generate-caption` - AI caption generation
- `POST /api/content/generate-image` - AI image generation
- `POST /api/content/generate-ideas` - AI niche ideas
- `GET/POST/PUT/DELETE /api/content` - Content CRUD
- `GET/POST/DELETE /api/calendar` - Scheduling
- `GET /api/analytics` - Analytics data

## Prioritized Backlog

### P0 (Completed)
- [x] AI caption generation
- [x] Content calendar with scheduling
- [x] Niche ideas generator
- [x] Photography tips generator (NEW)
- [x] Content mix ideas (NEW)
- [x] Seasonal content calendar (NEW)
- [x] Analytics dashboard

### P1 (Next Phase)
- [ ] Instagram API integration for direct posting
- [ ] Image editing/filters
- [ ] Bulk content scheduling

### P2 (Future)
- [ ] Team collaboration
- [ ] A/B testing for captions
- [ ] Competitor analysis

## Known Limitations
- Image generation depends on API budget availability
- Analytics data is demo until Instagram API integration
