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
- **Dashboard**: Quick stats, recent content, quick action cards
- **Content Creator**: 
  - AI caption generation with tone selection (professional, casual, inspirational, fun)
  - Call-to-action toggle
  - AI image generation (dual providers: Gemini/OpenAI)
  - Photo upload capability
  - Hashtag suggestions
  - Engagement tips
  - Save as draft functionality
- **Content Calendar**:
  - Monthly grid view
  - Schedule posts for specific dates/times
  - View upcoming scheduled posts
  - Cancel scheduled posts
- **Ideas Generator**:
  - Generate 1-10 content ideas per request
  - Niche-specific suggestions
  - Content type recommendations (photo, carousel, reel, story)
  - Best time to post suggestions
  - Save ideas as draft content
- **Analytics Dashboard**:
  - Total posts, scheduled, published, drafts stats
  - Weekly engagement trend chart
  - Posts by day bar chart
  - Content by niche pie chart
  - Best performing niche insights
  - Pro tips

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn UI, Recharts
- **Backend**: FastAPI, Python 3
- **Database**: MongoDB
- **AI Integration**: Emergent LLM Key (Gemini 3 Flash, Gemini Nano Banana, OpenAI GPT Image 1)

## Prioritized Backlog

### P0 (Completed)
- [x] AI caption generation
- [x] Content calendar with scheduling
- [x] Ideas generator
- [x] Analytics dashboard
- [x] All 6 photography niches

### P1 (Next Phase)
- [ ] Instagram API integration for direct posting
- [ ] Image editing/filters
- [ ] Bulk content scheduling
- [ ] Export calendar to Google Calendar

### P2 (Future)
- [ ] Team collaboration features
- [ ] Client management
- [ ] Invoice integration
- [ ] A/B testing for captions
- [ ] Competitor analysis

## Architecture
```
/app
├── backend/
│   ├── server.py         # FastAPI application
│   └── .env              # Environment variables (EMERGENT_LLM_KEY)
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main app with routing
│   │   ├── components/
│   │   │   └── Layout.jsx  # Sidebar layout
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── ContentCreator.jsx
│   │       ├── Calendar.jsx
│   │       ├── IdeasGenerator.jsx
│   │       └── Analytics.jsx
│   └── .env              # REACT_APP_BACKEND_URL
└── memory/
    └── PRD.md            # This file
```

## API Endpoints
- `GET /api/niches` - Get all photography niches
- `GET /api/hashtags/{niche}` - Get hashtags for niche
- `POST /api/content/generate-caption` - AI caption generation
- `POST /api/content/generate-image` - AI image generation
- `POST /api/content/generate-ideas` - AI ideas generation
- `GET/POST/PUT/DELETE /api/content` - Content CRUD
- `GET/POST/DELETE /api/calendar` - Scheduling
- `GET /api/analytics` - Analytics data

## Known Limitations
- Image generation depends on API budget availability
- Analytics data is demo/mock until Instagram API integration
