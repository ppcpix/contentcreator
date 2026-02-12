from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Photography niches
PHOTOGRAPHY_NICHES = [
    "housewarming", "baby_shower", "wedding", "portrait", "landscape", "event"
]

# Photography tips database - General tips for all photographers
PHOTOGRAPHY_TIPS = {
    "lighting": [
        "Golden hour (1 hour after sunrise/before sunset) creates magical warm light",
        "Use window light for soft, flattering portraits indoors",
        "Overcast days act as nature's softbox - perfect for portraits",
        "Backlight your subjects during golden hour for dreamy silhouettes",
        "Use reflectors to fill in shadows on faces",
        "Avoid harsh midday sun - it creates unflattering shadows"
    ],
    "composition": [
        "Rule of thirds - place subjects at intersection points",
        "Leading lines draw viewers into your photo",
        "Frame your subject using natural elements like doorways or trees",
        "Leave negative space to create visual breathing room",
        "Get low for dramatic perspectives",
        "Shoot through foreground elements for depth"
    ],
    "camera_settings": [
        "Use f/1.8-2.8 for beautiful bokeh in portraits",
        "Keep ISO as low as possible for cleaner images",
        "1/125s minimum shutter speed for sharp handheld portraits",
        "Shoot in RAW for maximum editing flexibility",
        "Use back-button focus for better control",
        "Bracket exposures in tricky lighting situations"
    ],
    "posing": [
        "Have subjects shift weight to back foot for natural stance",
        "Chin slightly forward and down to define jawline",
        "Create gaps between arms and body to slim appearance",
        "Give subjects something to do with their hands",
        "Encourage movement for natural expressions",
        "Capture in-between moments for authentic shots"
    ],
    "business": [
        "Share behind-the-scenes content to build connection",
        "Post client testimonials with their permission",
        "Create educational content to establish expertise",
        "Engage with comments within the first hour of posting",
        "Use carousel posts - they get 3x more engagement",
        "Post consistently - aim for 4-7 times per week"
    ],
    "editing": [
        "Develop a consistent editing style for brand recognition",
        "Don't over-smooth skin - keep texture natural",
        "Use HSL adjustments to make colors pop",
        "Straighten horizons - even slight tilts look unprofessional",
        "Crop intentionally to strengthen composition",
        "Add subtle vignette to draw focus to subject"
    ]
}

# Content mix suggestions for variety
CONTENT_MIX_IDEAS = {
    "behind_the_scenes": [
        "Show your camera gear setup",
        "Share your editing process timelapse",
        "Document a day in your life as photographer",
        "Show your workspace/studio setup",
        "Share packing routine for on-location shoots",
        "Post bloopers and funny moments from shoots"
    ],
    "educational": [
        "Before/after editing comparison",
        "Quick tip in 60 seconds (Reel)",
        "Common photography mistakes to avoid",
        "How to pose for photos (for clients)",
        "Best times of day for photos in your city",
        "Equipment recommendations at different price points"
    ],
    "engagement_posts": [
        "This or That polls (editing styles, locations)",
        "Caption this photo contests",
        "Ask followers: sunrise or sunset sessions?",
        "Share your photography journey milestone",
        "Client appreciation posts",
        "Throwback to your first professional shoot"
    ],
    "trending_content": [
        "Seasonal mini sessions announcements",
        "Holiday-themed photo ideas",
        "Trending Reel audio with your best shots",
        "Collaboration with local vendors",
        "Location reveal of hidden gems",
        "Day-to-night transformation shots"
    ],
    "portfolio_showcase": [
        "Single stunning hero image with story",
        "Before/after of venue transformation",
        "Series of emotions from one event",
        "Color-coordinated grid posts",
        "Carousel of best shots from one session",
        "Client story feature with multiple photos"
    ]
}

# Seasonal content calendar
SEASONAL_CONTENT = {
    "january": ["New Year resolution shoots", "Winter wonderland sessions", "Cozy indoor portraits"],
    "february": ["Valentine's couples sessions", "Galentine's group shoots", "Love story features"],
    "march": ["Spring bloom portraits", "St. Patrick's themed shoots", "Cherry blossom sessions"],
    "april": ["Easter family photos", "Spring cleaning your portfolio", "Rainy day creative shots"],
    "may": ["Mother's Day specials", "Graduation sessions", "Flower field portraits"],
    "june": ["Wedding season highlights", "Father's Day features", "Summer solstice golden hour"],
    "july": ["Summer family sessions", "Beach/pool photography", "Fireworks and celebrations"],
    "august": ["Back to school minis", "Late summer golden sessions", "Sunset chasing content"],
    "september": ["Fall mini sessions launch", "Labor Day family photos", "Autumn color scouting"],
    "october": ["Halloween themed shoots", "Pumpkin patch sessions", "Fall foliage portraits"],
    "november": ["Thanksgiving family sessions", "Gratitude posts", "Holiday card session promos"],
    "december": ["Holiday mini sessions", "Year in review posts", "Winter holiday magic shots"]
}

# Viral content hooks and templates
VIRAL_HOOKS = {
    "curiosity": [
        "The one mistake 90% of photographers make...",
        "I never share this editing secret, but today...",
        "What I wish I knew before my first wedding shoot",
        "The $0 trick that doubled my bookings",
        "Stop doing this if you want better photos"
    ],
    "storytelling": [
        "This photo almost didn't happen. Here's why...",
        "Behind every great photo is a story...",
        "The moment that changed everything...",
        "They said it couldn't be done. We proved them wrong.",
        "3 years ago I almost quit photography. Today..."
    ],
    "value": [
        "Save this for your next photoshoot",
        "Free tip that pros charge $500 to teach",
        "The exact settings I used for this shot",
        "Copy my workflow (step by step)",
        "Steal my client communication template"
    ],
    "engagement": [
        "Hot take: [controversial opinion]",
        "Unpopular opinion in photography...",
        "Rate this edit 1-10 👇",
        "Which one do you prefer? A or B",
        "Wrong answers only: What did I say to get this reaction?"
    ],
    "social_proof": [
        "Another happy client! Here's what they said...",
        "Fully booked for [month]! Here's how...",
        "From 0 to 50 bookings in 6 months",
        "Why clients keep coming back year after year",
        "The review that made me tear up"
    ]
}

# Reel ideas for photographers
REEL_IDEAS = {
    "trending": [
        {"title": "Photo Dump Transition", "description": "Show multiple shots from one session with trending audio", "duration": "15-30s"},
        {"title": "Before/After Edit", "description": "Split screen showing RAW vs edited photo transformation", "duration": "15s"},
        {"title": "Day in My Life", "description": "Document a full photoshoot day from prep to delivery", "duration": "60-90s"},
        {"title": "Gear Check", "description": "Quick reveal of what's in your camera bag", "duration": "15-30s"},
        {"title": "Client Reaction", "description": "Film client seeing their photos for first time", "duration": "15-30s"}
    ],
    "educational": [
        {"title": "Quick Posing Tips", "description": "3 poses anyone can do in 30 seconds", "duration": "30s"},
        {"title": "Lighting Hack", "description": "Show a simple lighting technique with before/after", "duration": "15-30s"},
        {"title": "Location Scout", "description": "Reveal a hidden gem location in your city", "duration": "30-60s"},
        {"title": "Edit With Me", "description": "Speed edit of one photo with tips overlay", "duration": "60s"},
        {"title": "Mistake to Masterpiece", "description": "Show how you saved a 'ruined' photo", "duration": "30s"}
    ],
    "engagement_boosters": [
        {"title": "Guess the Edit", "description": "Show original, let followers guess the final look", "duration": "15s"},
        {"title": "This or That", "description": "Two editing styles, ask followers to choose", "duration": "15s"},
        {"title": "POV: You Booked Me", "description": "Show the client experience from inquiry to delivery", "duration": "30-60s"},
        {"title": "Red Flags in Photography", "description": "Humorous take on client/photographer red flags", "duration": "30s"},
        {"title": "Photographer Problems", "description": "Relatable struggles with humor", "duration": "15-30s"}
    ]
}

# Bio optimization templates
BIO_TEMPLATES = {
    "wedding": [
        "📸 Capturing love stories since [year]",
        "💒 Wedding & Elopement Photographer",
        "✨ Turning moments into forever memories",
        "📍 [City] | Available worldwide",
        "👇 Book your free consultation"
    ],
    "portrait": [
        "📸 Portrait & Headshot Specialist",
        "✨ Helping you look your best",
        "🎯 Confidence-boosting photos",
        "📍 [City] Studio & On-location",
        "👇 DM 'READY' to book"
    ],
    "family": [
        "👨‍👩‍👧‍👦 Family & Newborn Photographer",
        "💕 Freezing your precious moments",
        "📍 [City] & surrounding areas",
        "🏆 [X]+ happy families served",
        "👇 Link in bio for sessions"
    ]
}

# CTA (Call-to-Action) variations
CTA_TEMPLATES = {
    "booking": [
        "DM me 'BOOK' to check availability",
        "Spots filling fast for [month]! Link in bio to reserve",
        "Ready to capture your moments? Let's chat 💬",
        "Only [X] spots left this month! DM to claim yours",
        "Your story deserves to be told. Book your session today"
    ],
    "engagement": [
        "Double tap if you agree! ❤️",
        "Tag someone who needs to see this",
        "Save this for later 📌",
        "Share this with a fellow photographer",
        "Drop a 📸 if you're a photographer too"
    ],
    "lead_generation": [
        "DM me 'GUIDE' for my free posing guide",
        "Comment 'TIPS' and I'll send you my top 5 editing secrets",
        "Want my preset pack? Link in bio!",
        "Free consultation for first 5 people who DM today",
        "Reply 'INFO' for pricing and packages"
    ]
}

# Client attraction post templates
CLIENT_MAGNETS = {
    "testimonial_templates": [
        "⭐⭐⭐⭐⭐\n\n\"{testimonial}\"\n\n- {client_name}\n\nReady for your own amazing experience? DM me!",
        "CLIENT LOVE 💕\n\nWorking with {client_name} was absolutely magical. Here's what they had to say:\n\n\"{testimonial}\"\n\nYour turn next? Link in bio!",
        "This review made my whole week 🥹\n\n\"{testimonial}\"\n\nThank you {client_name} for trusting me with your special day!"
    ],
    "portfolio_templates": [
        "✨ NEW WORK ✨\n\n{session_type} session with {client_name}\n\nLocation: {location}\nVibe: {mood}\n\nBooking similar sessions now for {month}!",
        "Can we talk about this {session_type}? 😍\n\n{description}\n\nSwipe to see more from this magical session →\n\nWant photos like these? DM me!",
        "POV: You booked a {session_type} session with me\n\n{description}\n\nThis could be you! Booking link in bio 🔗"
    ],
    "value_posts": [
        "🎁 FREE GUIDE\n\nI created a guide on '{topic}' and I'm giving it away!\n\nWhat's inside:\n✅ {point1}\n✅ {point2}\n✅ {point3}\n\nDM me 'GUIDE' to get yours!",
        "Save this post if you want better photos! 📌\n\n{tip_content}\n\nFollow for more photography tips!\n\n#photographytips #phototips",
        "The secret to {result}? 👇\n\n{tip_content}\n\nWant me to do this for you? Let's chat!"
    ]
}

# Hashtag strategy
HASHTAG_STRATEGY = {
    "small_account": {  # Under 10k followers
        "strategy": "Focus on niche, location-based, and smaller hashtags (under 500k posts)",
        "mix": "5 small (under 50k) + 5 medium (50k-500k) + 5 location-based"
    },
    "growing_account": {  # 10k-50k followers
        "strategy": "Mix of medium and some larger hashtags",
        "mix": "3 small + 7 medium + 3 large (500k-2M) + 2 branded"
    },
    "established_account": {  # 50k+ followers
        "strategy": "Can compete with larger hashtags",
        "mix": "5 medium + 5 large + 3 mega (2M+) + 2 branded"
    }
}

# Niche-specific hashtags database
NICHE_HASHTAGS = {
    "housewarming": ["#housewarming", "#newhome", "#homesweethome", "#housewarmingparty", "#newbeginnings", "#homeowner", "#dreamhome", "#homedecor", "#homedesign", "#interiordesign", "#realtor", "#firsthome", "#homecelebration", "#newchapter", "#homegoals"],
    "baby_shower": ["#babyshower", "#itsaboy", "#itsagirl", "#momtobe", "#babyshowerideas", "#babyshowerparty", "#babylove", "#babybump", "#expectingmom", "#parentstobe", "#babyontheway", "#babyshowerdecor", "#genderreveal", "#newmom", "#babycelebration"],
    "wedding": ["#weddingphotography", "#weddingday", "#bridetobe", "#weddingdress", "#weddingplanning", "#weddinginspo", "#weddinginspiration", "#brideandgroom", "#weddingseason", "#weddingideas", "#justmarried", "#couplegoals", "#romanticwedding", "#weddingceremony", "#weddingmoments"],
    "portrait": ["#portraitphotography", "#portrait", "#portraitmood", "#portraitpage", "#portraits", "#faceportrait", "#modelportrait", "#portraitart", "#headshot", "#profileportrait", "#beautifulportrait", "#naturalportrait", "#emotiveportrait", "#candidportrait", "#storytelling"],
    "landscape": ["#landscapephotography", "#landscape", "#naturephotography", "#naturelovers", "#earthpix", "#wanderlust", "#beautifuldestinations", "#exploretheworld", "#outdoorphotography", "#scenicview", "#mountains", "#sunset", "#sunrise", "#goldenhour", "#wildnature"],
    "event": ["#eventphotography", "#eventphotographer", "#corporateevent", "#concertphotography", "#liveevent", "#eventcoverage", "#partyphotographer", "#specialevent", "#eventplanning", "#memorablemoments", "#celebration", "#eventday", "#professionalphoto", "#eventdocumentation", "#moments"]
}

# Models
class ContentBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    caption: str
    hashtags: List[str]
    niche: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None  # image, video, ai_generated
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    scheduled_date: Optional[str] = None
    status: str = "draft"  # draft, scheduled, published

class ContentCreate(BaseModel):
    title: str
    caption: str
    hashtags: List[str]
    niche: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    scheduled_date: Optional[str] = None
    status: str = "draft"

class CaptionRequest(BaseModel):
    niche: str
    topic: Optional[str] = None
    tone: Optional[str] = "professional"  # professional, casual, inspirational, fun
    include_cta: bool = True

class CaptionResponse(BaseModel):
    caption: str
    hashtags: List[str]
    engagement_tips: List[str]

class ImageGenerateRequest(BaseModel):
    prompt: str
    niche: str
    provider: str = "gemini"  # gemini or openai
    style: Optional[str] = "professional photography"

class ContentIdeaRequest(BaseModel):
    niche: str
    count: int = 5

class ContentIdea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    niche: str
    title: str
    description: str
    suggested_caption: str
    suggested_hashtags: List[str]
    best_time_to_post: str
    content_type: str  # photo, carousel, reel, story

class PhotographyTip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    tip: str
    caption_idea: str
    hashtags: List[str]

class ContentMixIdea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    idea: str
    description: str
    caption: str
    hashtags: List[str]
    content_type: str

class TipsRequest(BaseModel):
    categories: Optional[List[str]] = None
    count: int = 5

class ContentMixRequest(BaseModel):
    categories: Optional[List[str]] = None
    count: int = 5

class ScheduledPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    scheduled_date: str
    scheduled_time: str
    status: str = "pending"  # pending, posted, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsData(BaseModel):
    total_posts: int
    scheduled_posts: int
    published_posts: int
    drafts: int
    posts_by_niche: dict
    engagement_trend: List[dict]
    best_performing_niche: str
    content_ideas_generated: int

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Instagram Content Creator API"}

@api_router.get("/niches")
async def get_niches():
    return {"niches": PHOTOGRAPHY_NICHES}

@api_router.get("/hashtags/{niche}")
async def get_hashtags(niche: str):
    if niche not in NICHE_HASHTAGS:
        raise HTTPException(status_code=404, detail="Niche not found")
    return {"niche": niche, "hashtags": NICHE_HASHTAGS[niche]}

# Photography Tips
@api_router.get("/tips/categories")
async def get_tip_categories():
    return {"categories": list(PHOTOGRAPHY_TIPS.keys())}

@api_router.post("/tips/generate")
async def generate_photography_tips(request: TipsRequest):
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        categories = request.categories or list(PHOTOGRAPHY_TIPS.keys())
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"tips-{str(uuid.uuid4())}",
            system_message="""You are an expert photography coach and social media strategist. 
            Generate engaging photography tips that can be turned into Instagram posts.
            Return response as JSON array with objects: category, tip, caption_idea, hashtags (array)"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        # Get some base tips for context
        base_tips = []
        for cat in categories[:3]:
            if cat in PHOTOGRAPHY_TIPS:
                base_tips.extend(PHOTOGRAPHY_TIPS[cat][:2])
        
        prompt = f"""Generate {request.count} unique, actionable photography tips for Instagram posts.
        Categories to focus on: {', '.join(categories)}
        
        Base context tips (generate NEW ones, don't repeat): {base_tips[:3]}
        
        For each tip include:
        - category: one of {categories}
        - tip: the actual photography tip (concise, actionable)
        - caption_idea: a ready-to-post Instagram caption sharing this tip
        - hashtags: 5 relevant hashtags
        
        Make tips engaging, valuable, and shareable. Mix educational with inspirational.
        Return as JSON array."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        try:
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            tips_data = json.loads(response_text)
            tips = []
            for tip in tips_data[:request.count]:
                tips.append(PhotographyTip(
                    category=tip.get("category", "general"),
                    tip=tip.get("tip", ""),
                    caption_idea=tip.get("caption_idea", ""),
                    hashtags=tip.get("hashtags", [])
                ))
            
            return {"tips": [t.model_dump() for t in tips]}
        except json.JSONDecodeError:
            # Fallback to static tips
            fallback_tips = []
            for cat in categories:
                if cat in PHOTOGRAPHY_TIPS:
                    for tip_text in PHOTOGRAPHY_TIPS[cat][:request.count // len(categories) + 1]:
                        fallback_tips.append(PhotographyTip(
                            category=cat,
                            tip=tip_text,
                            caption_idea=f"📸 Pro Tip: {tip_text}\n\nDouble tap if this helped! 💡",
                            hashtags=["#photographytips", "#phototips", f"#{cat}tips", "#learnphotography", "#photographylife"]
                        ))
            return {"tips": [t.model_dump() for t in fallback_tips[:request.count]]}
    except Exception as e:
        logger.error(f"Tips generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate tips: {str(e)}")

@api_router.get("/tips/static")
async def get_static_tips():
    """Get all static photography tips organized by category"""
    return {"tips": PHOTOGRAPHY_TIPS}

# Content Mix Ideas
@api_router.get("/content-mix/categories")
async def get_content_mix_categories():
    return {"categories": list(CONTENT_MIX_IDEAS.keys())}

@api_router.post("/content-mix/generate")
async def generate_content_mix(request: ContentMixRequest):
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        categories = request.categories or list(CONTENT_MIX_IDEAS.keys())
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"mix-{str(uuid.uuid4())}",
            system_message="""You are a creative Instagram strategist for photography businesses.
            Generate diverse content ideas that go beyond just portfolio shots.
            Return response as JSON array with objects: category, idea, description, caption, hashtags (array), content_type"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        # Get base ideas for context
        base_ideas = []
        for cat in categories[:2]:
            if cat in CONTENT_MIX_IDEAS:
                base_ideas.extend(CONTENT_MIX_IDEAS[cat][:2])
        
        prompt = f"""Generate {request.count} creative Instagram content ideas for a photography business.
        Categories: {', '.join(categories)}
        
        Context ideas (generate NEW ones): {base_ideas}
        
        For each idea include:
        - category: one of {categories}
        - idea: short title of the content idea
        - description: what to create/post
        - caption: ready-to-use Instagram caption
        - hashtags: 5 relevant hashtags
        - content_type: photo, carousel, reel, or story
        
        Be creative! Think engagement, authenticity, and value for followers.
        Return as JSON array."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        try:
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            ideas_data = json.loads(response_text)
            ideas = []
            for idea in ideas_data[:request.count]:
                ideas.append(ContentMixIdea(
                    category=idea.get("category", "general"),
                    idea=idea.get("idea", ""),
                    description=idea.get("description", ""),
                    caption=idea.get("caption", ""),
                    hashtags=idea.get("hashtags", []),
                    content_type=idea.get("content_type", "photo")
                ))
            
            return {"ideas": [i.model_dump() for i in ideas]}
        except json.JSONDecodeError:
            # Fallback
            fallback_ideas = []
            for cat in categories:
                if cat in CONTENT_MIX_IDEAS:
                    for idea_text in CONTENT_MIX_IDEAS[cat][:request.count // len(categories) + 1]:
                        fallback_ideas.append(ContentMixIdea(
                            category=cat,
                            idea=idea_text,
                            description=f"Create content around: {idea_text}",
                            caption=f"✨ {idea_text}\n\nWhat content would you like to see more of? Comment below! 👇",
                            hashtags=["#photographybusiness", "#contentcreator", "#instagramtips", "#photographerlife", "#socialmediatips"],
                            content_type="carousel"
                        ))
            return {"ideas": [i.model_dump() for i in fallback_ideas[:request.count]]}
    except Exception as e:
        logger.error(f"Content mix generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate content mix: {str(e)}")

@api_router.get("/content-mix/static")
async def get_static_content_mix():
    """Get all static content mix ideas"""
    return {"ideas": CONTENT_MIX_IDEAS}

# Seasonal Content Suggestions
@api_router.get("/seasonal")
async def get_seasonal_content(month: Optional[str] = None):
    if month:
        month_lower = month.lower()
        if month_lower in SEASONAL_CONTENT:
            return {"month": month_lower, "ideas": SEASONAL_CONTENT[month_lower]}
        raise HTTPException(status_code=404, detail="Month not found")
    return {"seasonal_content": SEASONAL_CONTENT}

# Caption Generation
@api_router.post("/content/generate-caption", response_model=CaptionResponse)
async def generate_caption(request: CaptionRequest):
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"caption-{str(uuid.uuid4())}",
            system_message="""You are an expert Instagram content strategist specializing in photography businesses. 
            Generate engaging, authentic captions that drive engagement and bookings.
            Always return response in this exact JSON format:
            {"caption": "your caption here", "hashtags": ["#tag1", "#tag2"], "engagement_tips": ["tip1", "tip2"]}"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        topic_text = f" about {request.topic}" if request.topic else ""
        cta_text = " Include a call-to-action to book services." if request.include_cta else ""
        
        prompt = f"""Create an Instagram caption for a {request.niche} photography business{topic_text}. 
        Tone: {request.tone}.{cta_text}
        
        Generate:
        1. A compelling caption (150-300 characters)
        2. 10 relevant hashtags for {request.niche} photography
        3. 3 engagement tips for this post
        
        Return as JSON with keys: caption, hashtags, engagement_tips"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse response
        import json
        try:
            # Try to extract JSON from response
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            data = json.loads(response_text)
            return CaptionResponse(
                caption=data.get("caption", response),
                hashtags=data.get("hashtags", NICHE_HASHTAGS.get(request.niche, [])[:10]),
                engagement_tips=data.get("engagement_tips", ["Post during peak hours", "Engage with comments", "Use stories"])
            )
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return CaptionResponse(
                caption=response[:300] if len(response) > 300 else response,
                hashtags=NICHE_HASHTAGS.get(request.niche, [])[:10],
                engagement_tips=["Post during peak hours", "Engage with comments quickly", "Use stories for behind-the-scenes"]
            )
    except Exception as e:
        logger.error(f"Caption generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate caption: {str(e)}")

# Image Generation
@api_router.post("/content/generate-image")
async def generate_image(request: ImageGenerateRequest):
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        enhanced_prompt = f"{request.prompt}, {request.style}, {request.niche} photography style, high quality, professional lighting, Instagram-worthy"
        
        if request.provider == "openai":
            # OpenAI GPT Image 1
            image_gen = OpenAIImageGeneration(api_key=api_key)
            images = await image_gen.generate_images(
                prompt=enhanced_prompt,
                model="gpt-image-1",
                number_of_images=1
            )
            if images and len(images) > 0:
                image_base64 = base64.b64encode(images[0]).decode('utf-8')
                return {"provider": "openai", "image_base64": image_base64, "prompt": enhanced_prompt}
            else:
                raise HTTPException(status_code=500, detail="No image was generated")
        else:
            # Gemini Nano Banana
            chat = LlmChat(
                api_key=api_key,
                session_id=f"image-{str(uuid.uuid4())}",
                system_message="You are an AI that generates beautiful photography images."
            ).with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
            
            msg = UserMessage(text=enhanced_prompt)
            text, images = await chat.send_message_multimodal_response(msg)
            
            if images and len(images) > 0:
                return {"provider": "gemini", "image_base64": images[0]['data'], "prompt": enhanced_prompt, "text_response": text}
            else:
                raise HTTPException(status_code=500, detail="No image was generated")
                
    except Exception as e:
        logger.error(f"Image generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate image: {str(e)}")

# Content Ideas Generation
@api_router.post("/content/generate-ideas")
async def generate_ideas(request: ContentIdeaRequest):
    try:
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"ideas-{str(uuid.uuid4())}",
            system_message="""You are an expert Instagram content strategist for photography businesses.
            Generate creative, engagement-driving content ideas.
            Return response as JSON array with objects containing: title, description, suggested_caption, suggested_hashtags (array), best_time_to_post, content_type"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        prompt = f"""Generate {request.count} unique Instagram content ideas for a {request.niche} photography business.
        
        For each idea include:
        - title: catchy title for the content
        - description: what the post should feature
        - suggested_caption: ready-to-use caption
        - suggested_hashtags: 5 relevant hashtags
        - best_time_to_post: optimal posting time
        - content_type: photo, carousel, reel, or story
        
        Return as JSON array."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        try:
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            ideas_data = json.loads(response_text)
            ideas = []
            for idea in ideas_data[:request.count]:
                ideas.append(ContentIdea(
                    niche=request.niche,
                    title=idea.get("title", "Content Idea"),
                    description=idea.get("description", ""),
                    suggested_caption=idea.get("suggested_caption", ""),
                    suggested_hashtags=idea.get("suggested_hashtags", []),
                    best_time_to_post=idea.get("best_time_to_post", "9:00 AM"),
                    content_type=idea.get("content_type", "photo")
                ))
            
            # Store ideas in database
            for idea in ideas:
                doc = idea.model_dump()
                await db.content_ideas.insert_one(doc)
            
            return {"ideas": [i.model_dump() for i in ideas]}
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error(f"Ideas generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate ideas: {str(e)}")

# Content CRUD
@api_router.post("/content", response_model=ContentBase)
async def create_content(content: ContentCreate):
    content_obj = ContentBase(**content.model_dump())
    doc = content_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.content.insert_one(doc)
    return content_obj

@api_router.get("/content")
async def get_all_content(status: Optional[str] = None, niche: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if niche:
        query["niche"] = niche
    
    content_list = await db.content.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"content": content_list}

@api_router.get("/content/{content_id}")
async def get_content(content_id: str):
    content = await db.content.find_one({"id": content_id}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@api_router.put("/content/{content_id}")
async def update_content(content_id: str, content: ContentCreate):
    result = await db.content.update_one(
        {"id": content_id},
        {"$set": content.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"message": "Content updated successfully"}

@api_router.delete("/content/{content_id}")
async def delete_content(content_id: str):
    result = await db.content.delete_one({"id": content_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"message": "Content deleted successfully"}

# Calendar / Scheduling
@api_router.post("/calendar/schedule")
async def schedule_post(content_id: str, scheduled_date: str, scheduled_time: str):
    # Verify content exists
    content = await db.content.find_one({"id": content_id}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    scheduled_post = ScheduledPost(
        content_id=content_id,
        scheduled_date=scheduled_date,
        scheduled_time=scheduled_time
    )
    
    doc = scheduled_post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.scheduled_posts.insert_one(doc)
    
    # Update content status
    await db.content.update_one(
        {"id": content_id},
        {"$set": {"status": "scheduled", "scheduled_date": scheduled_date}}
    )
    
    return {"message": "Post scheduled successfully", "scheduled_post": scheduled_post.model_dump()}

@api_router.get("/calendar")
async def get_calendar(month: Optional[str] = None, year: Optional[str] = None):
    query = {}
    if month and year:
        # Filter by month prefix
        date_prefix = f"{year}-{month.zfill(2)}"
        query["scheduled_date"] = {"$regex": f"^{date_prefix}"}
    
    scheduled_posts = await db.scheduled_posts.find(query, {"_id": 0}).to_list(100)
    
    # Get content details for each scheduled post
    calendar_items = []
    for post in scheduled_posts:
        content = await db.content.find_one({"id": post["content_id"]}, {"_id": 0})
        if content:
            calendar_items.append({
                **post,
                "content": content
            })
    
    return {"calendar": calendar_items}

@api_router.delete("/calendar/{schedule_id}")
async def cancel_scheduled_post(schedule_id: str):
    scheduled_post = await db.scheduled_posts.find_one({"id": schedule_id}, {"_id": 0})
    if not scheduled_post:
        raise HTTPException(status_code=404, detail="Scheduled post not found")
    
    await db.scheduled_posts.update_one(
        {"id": schedule_id},
        {"$set": {"status": "cancelled"}}
    )
    
    # Update content status back to draft
    await db.content.update_one(
        {"id": scheduled_post["content_id"]},
        {"$set": {"status": "draft", "scheduled_date": None}}
    )
    
    return {"message": "Scheduled post cancelled"}

# Analytics
@api_router.get("/analytics", response_model=AnalyticsData)
async def get_analytics():
    # Get counts
    total_posts = await db.content.count_documents({})
    scheduled_posts = await db.content.count_documents({"status": "scheduled"})
    published_posts = await db.content.count_documents({"status": "published"})
    drafts = await db.content.count_documents({"status": "draft"})
    content_ideas = await db.content_ideas.count_documents({})
    
    # Posts by niche
    posts_by_niche = {}
    for niche in PHOTOGRAPHY_NICHES:
        count = await db.content.count_documents({"niche": niche})
        posts_by_niche[niche] = count
    
    # Find best performing niche
    best_niche = max(posts_by_niche, key=posts_by_niche.get) if posts_by_niche else "wedding"
    
    # Mock engagement trend (would be real data from Instagram API integration)
    engagement_trend = [
        {"day": "Mon", "posts": 3, "engagement": 120},
        {"day": "Tue", "posts": 2, "engagement": 85},
        {"day": "Wed", "posts": 4, "engagement": 200},
        {"day": "Thu", "posts": 1, "engagement": 45},
        {"day": "Fri", "posts": 5, "engagement": 280},
        {"day": "Sat", "posts": 3, "engagement": 150},
        {"day": "Sun", "posts": 2, "engagement": 95}
    ]
    
    return AnalyticsData(
        total_posts=total_posts,
        scheduled_posts=scheduled_posts,
        published_posts=published_posts,
        drafts=drafts,
        posts_by_niche=posts_by_niche,
        engagement_trend=engagement_trend,
        best_performing_niche=best_niche,
        content_ideas_generated=content_ideas
    )

# Media Upload (Base64)
@api_router.post("/content/upload-media")
async def upload_media(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_data = base64.b64encode(contents).decode('utf-8')
        
        # Determine media type
        content_type = file.content_type or "image/jpeg"
        media_type = "video" if "video" in content_type else "image"
        
        # Store in database
        media_doc = {
            "id": str(uuid.uuid4()),
            "filename": file.filename,
            "content_type": content_type,
            "media_type": media_type,
            "data": base64_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.media.insert_one(media_doc)
        
        return {
            "id": media_doc["id"],
            "filename": file.filename,
            "media_type": media_type,
            "media_url": f"data:{content_type};base64,{base64_data[:50]}..."  # Truncated for response
        }
    except Exception as e:
        logger.error(f"Media upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload media: {str(e)}")

@api_router.get("/media/{media_id}")
async def get_media(media_id: str):
    media = await db.media.find_one({"id": media_id}, {"_id": 0})
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return media

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
