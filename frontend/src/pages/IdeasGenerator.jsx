import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Lightbulb,
  RefreshCw,
  Sparkles,
  Clock,
  Image as ImageIcon,
  Film,
  Layers,
  MessageCircle,
  Copy,
  Check,
  Save,
  Camera,
  BookOpen,
  Users,
  TrendingUp,
  Briefcase,
  CalendarDays,
  Zap,
  GraduationCap,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NICHES = [
  { value: "wedding", label: "Wedding", icon: "💒" },
  { value: "portrait", label: "Portrait", icon: "👤" },
  { value: "landscape", label: "Landscape", icon: "🏞️" },
  { value: "event", label: "Event", icon: "🎉" },
  { value: "housewarming", label: "Housewarming", icon: "🏠" },
  { value: "baby_shower", label: "Baby Shower", icon: "👶" },
];

const TIP_CATEGORIES = [
  { value: "lighting", label: "Lighting", icon: Zap },
  { value: "composition", label: "Composition", icon: Layers },
  { value: "camera_settings", label: "Camera Settings", icon: Camera },
  { value: "posing", label: "Posing", icon: Users },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "editing", label: "Editing", icon: ImageIcon },
];

const CONTENT_MIX_CATEGORIES = [
  { value: "behind_the_scenes", label: "Behind the Scenes", icon: Film },
  { value: "educational", label: "Educational", icon: GraduationCap },
  { value: "engagement_posts", label: "Engagement Posts", icon: Heart },
  { value: "trending_content", label: "Trending Content", icon: TrendingUp },
  { value: "portfolio_showcase", label: "Portfolio Showcase", icon: ImageIcon },
];

const contentTypeIcons = {
  photo: ImageIcon,
  carousel: Layers,
  reel: Film,
  story: MessageCircle,
};

const nicheColors = {
  wedding: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  portrait: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  landscape: "bg-green-500/20 text-green-300 border-green-500/30",
  event: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  housewarming: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  baby_shower: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const categoryColors = {
  lighting: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  composition: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  camera_settings: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  posing: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  business: "bg-green-500/20 text-green-300 border-green-500/30",
  editing: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  behind_the_scenes: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  educational: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  engagement_posts: "bg-red-500/20 text-red-300 border-red-500/30",
  trending_content: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  portfolio_showcase: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

export default function IdeasGenerator() {
  const [activeTab, setActiveTab] = useState("niche-ideas");
  
  // Niche Ideas state
  const [niche, setNiche] = useState("wedding");
  const [count, setCount] = useState([5]);
  const [ideas, setIdeas] = useState([]);
  
  // Tips state
  const [selectedTipCategories, setSelectedTipCategories] = useState(["lighting", "composition"]);
  const [tipCount, setTipCount] = useState([5]);
  const [tips, setTips] = useState([]);
  
  // Content Mix state
  const [selectedMixCategories, setSelectedMixCategories] = useState(["behind_the_scenes", "educational"]);
  const [mixCount, setMixCount] = useState([5]);
  const [mixIdeas, setMixIdeas] = useState([]);
  
  // Seasonal state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [seasonalIdeas, setSeasonalIdeas] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    // Set current month
    const currentMonth = MONTHS[new Date().getMonth()];
    setSelectedMonth(currentMonth);
    fetchSeasonalContent(currentMonth);
  }, []);

  const fetchSeasonalContent = async (month) => {
    try {
      const response = await axios.get(`${API}/seasonal?month=${month}`);
      setSeasonalIdeas(response.data.ideas || []);
    } catch (error) {
      console.error("Error fetching seasonal content:", error);
    }
  };

  const generateNicheIdeas = async () => {
    if (!niche) {
      toast.error("Please select a photography niche");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/content/generate-ideas`, {
        niche,
        count: count[0],
      });
      setIdeas(response.data.ideas || []);
      toast.success(`Generated ${response.data.ideas?.length || 0} content ideas!`);
    } catch (error) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateTips = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/tips/generate`, {
        categories: selectedTipCategories,
        count: tipCount[0],
      });
      setTips(response.data.tips || []);
      toast.success(`Generated ${response.data.tips?.length || 0} photography tips!`);
    } catch (error) {
      console.error("Error generating tips:", error);
      toast.error("Failed to generate tips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateContentMix = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/content-mix/generate`, {
        categories: selectedMixCategories,
        count: mixCount[0],
      });
      setMixIdeas(response.data.ideas || []);
      toast.success(`Generated ${response.data.ideas?.length || 0} content mix ideas!`);
    } catch (error) {
      console.error("Error generating content mix:", error);
      toast.error("Failed to generate content mix. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = async (id, caption, hashtags = []) => {
    const textToCopy = `${caption}\n\n${hashtags?.join(" ") || ""}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    toast.success("Caption copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveAsContent = async (item, type = "idea") => {
    try {
      await axios.post(`${API}/content`, {
        title: item.title || item.idea || item.tip || "Untitled",
        caption: item.suggested_caption || item.caption || item.caption_idea || "",
        hashtags: item.suggested_hashtags || item.hashtags || [],
        niche: item.niche || item.category || "general",
        status: "draft",
      });
      toast.success("Saved as draft content!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save");
    }
  };

  const toggleCategory = (category, list, setList) => {
    if (list.includes(category)) {
      if (list.length > 1) {
        setList(list.filter(c => c !== category));
      }
    } else {
      setList([...list, category]);
    }
  };

  const ContentTypeIcon = ({ type }) => {
    const Icon = contentTypeIcons[type] || ImageIcon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 animate-fade-in" data-testid="ideas-generator">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight heading-display">
          Content Ideas Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered ideas, tips, and content strategies to keep your Instagram thriving
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-card border border-border">
          <TabsTrigger value="niche-ideas" className="data-[state=active]:bg-secondary" data-testid="tab-niche-ideas">
            <Lightbulb className="w-4 h-4 mr-2" />
            Niche Ideas
          </TabsTrigger>
          <TabsTrigger value="photo-tips" className="data-[state=active]:bg-secondary" data-testid="tab-photo-tips">
            <Camera className="w-4 h-4 mr-2" />
            Photo Tips
          </TabsTrigger>
          <TabsTrigger value="content-mix" className="data-[state=active]:bg-secondary" data-testid="tab-content-mix">
            <Layers className="w-4 h-4 mr-2" />
            Content Mix
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="data-[state=active]:bg-secondary" data-testid="tab-seasonal">
            <CalendarDays className="w-4 h-4 mr-2" />
            Seasonal
          </TabsTrigger>
        </TabsList>

        {/* Niche Ideas Tab */}
        <TabsContent value="niche-ideas" className="mt-6 space-y-6">
          <Card className="content-card border-border" data-testid="niche-ideas-controls">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Photography Niche</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger className="bg-background" data-testid="select-niche">
                      <SelectValue placeholder="Select niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n.value} value={n.value}>
                          <span className="flex items-center gap-2">
                            <span>{n.icon}</span>
                            <span>{n.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Ideas: {count[0]}</Label>
                  <Slider value={count} onValueChange={setCount} min={1} max={10} step={1} className="mt-3" />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={generateNicheIdeas}
                    disabled={loading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-sm h-11"
                    data-testid="btn-generate-niche-ideas"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Ideas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Niche Quick Select */}
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <Button
                key={n.value}
                variant={niche === n.value ? "default" : "outline"}
                size="sm"
                onClick={() => setNiche(n.value)}
                className={`rounded-sm ${niche === n.value ? "bg-secondary text-foreground" : ""}`}
              >
                <span className="mr-1">{n.icon}</span>
                {n.label}
              </Button>
            ))}
          </div>

          {/* Ideas Grid */}
          {ideas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ideas.map((idea, index) => (
                <IdeaCard key={idea.id || index} item={idea} index={index} type="niche" 
                  copiedId={copiedId} onCopy={copyCaption} onSave={saveAsContent} />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Lightbulb} 
              title="Ready to Spark Creativity?" 
              description="Select your photography niche and generate AI-powered content ideas."
              buttonText="Generate Your First Ideas"
              onClick={generateNicheIdeas}
              loading={loading}
            />
          )}
        </TabsContent>

        {/* Photo Tips Tab */}
        <TabsContent value="photo-tips" className="mt-6 space-y-6">
          <Card className="content-card border-border" data-testid="tips-controls">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Select Tip Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {TIP_CATEGORIES.map((cat) => (
                      <Button
                        key={cat.value}
                        variant={selectedTipCategories.includes(cat.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(cat.value, selectedTipCategories, setSelectedTipCategories)}
                        className={`rounded-sm ${selectedTipCategories.includes(cat.value) ? "bg-secondary" : ""}`}
                        data-testid={`tip-cat-${cat.value}`}
                      >
                        <cat.icon className="w-4 h-4 mr-1" />
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Number of Tips: {tipCount[0]}</Label>
                    <Slider value={tipCount} onValueChange={setTipCount} min={1} max={10} step={1} className="mt-3" />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={generateTips}
                      disabled={loading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-sm h-11"
                      data-testid="btn-generate-tips"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                      Generate Tips
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {tips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <TipCard key={tip.id || index} item={tip} index={index}
                  copiedId={copiedId} onCopy={copyCaption} onSave={saveAsContent} />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Camera} 
              title="Share Your Photography Knowledge" 
              description="Generate tips to educate your audience and establish yourself as an expert."
              buttonText="Generate Photography Tips"
              onClick={generateTips}
              loading={loading}
              color="blue"
            />
          )}
        </TabsContent>

        {/* Content Mix Tab */}
        <TabsContent value="content-mix" className="mt-6 space-y-6">
          <Card className="content-card border-border" data-testid="mix-controls">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Select Content Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_MIX_CATEGORIES.map((cat) => (
                      <Button
                        key={cat.value}
                        variant={selectedMixCategories.includes(cat.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(cat.value, selectedMixCategories, setSelectedMixCategories)}
                        className={`rounded-sm ${selectedMixCategories.includes(cat.value) ? "bg-secondary" : ""}`}
                        data-testid={`mix-cat-${cat.value}`}
                      >
                        <cat.icon className="w-4 h-4 mr-1" />
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Number of Ideas: {mixCount[0]}</Label>
                    <Slider value={mixCount} onValueChange={setMixCount} min={1} max={10} step={1} className="mt-3" />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={generateContentMix}
                      disabled={loading}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-sm h-11"
                      data-testid="btn-generate-mix"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Layers className="w-4 h-4 mr-2" />}
                      Generate Content Mix
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {mixIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mixIdeas.map((idea, index) => (
                <MixCard key={idea.id || index} item={idea} index={index}
                  copiedId={copiedId} onCopy={copyCaption} onSave={saveAsContent} />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Layers} 
              title="Diversify Your Content" 
              description="Get ideas for behind-the-scenes, educational posts, engagement boosters, and more!"
              buttonText="Generate Content Mix"
              onClick={generateContentMix}
              loading={loading}
              color="purple"
            />
          )}
        </TabsContent>

        {/* Seasonal Tab */}
        <TabsContent value="seasonal" className="mt-6 space-y-6">
          <Card className="content-card border-border" data-testid="seasonal-controls">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Select Month</Label>
                  <Select value={selectedMonth} onValueChange={(v) => { setSelectedMonth(v); fetchSeasonalContent(v); }}>
                    <SelectTrigger className="bg-background" data-testid="select-month">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m} value={m}>
                          <span className="capitalize">{m}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <p className="text-sm text-muted-foreground">
                    Seasonal content ideas help you stay relevant and timely with your posts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Month Quick Select */}
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((m) => (
              <Button
                key={m}
                variant={selectedMonth === m ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedMonth(m); fetchSeasonalContent(m); }}
                className={`rounded-sm capitalize ${selectedMonth === m ? "bg-secondary" : ""}`}
              >
                {m.slice(0, 3)}
              </Button>
            ))}
          </div>

          {seasonalIdeas.length > 0 ? (
            <Card className="content-card border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="capitalize heading-display flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-green-400" />
                  {selectedMonth} Content Ideas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {seasonalIdeas.map((idea, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-background rounded-sm border border-border hover:border-green-500/50 transition-colors cursor-pointer"
                      onClick={() => copyCaption(`seasonal-${index}`, idea, [])}
                      data-testid={`seasonal-idea-${index}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">{idea}</p>
                        {copiedId === `seasonal-${index}` ? (
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState 
              icon={CalendarDays} 
              title="Seasonal Content Calendar" 
              description="Select a month to see timely content ideas for your photography business."
              buttonText=""
              onClick={() => {}}
              loading={false}
              color="green"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable Components
function EmptyState({ icon: Icon, title, description, buttonText, onClick, loading, color = "yellow" }) {
  const colorClasses = {
    yellow: "bg-yellow-500 hover:bg-yellow-600 text-black",
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    purple: "bg-purple-500 hover:bg-purple-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white",
  };

  return (
    <Card className="content-card">
      <CardContent className="p-12 text-center">
        <Icon className={`w-16 h-16 mx-auto text-${color}-400/50 mb-4`} />
        <h3 className="text-xl font-medium mb-2 heading-display">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
        {buttonText && (
          <Button onClick={onClick} disabled={loading} className={`${colorClasses[color]} rounded-sm`}>
            <Sparkles className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function IdeaCard({ item, index, copiedId, onCopy, onSave }) {
  return (
    <Card className="idea-card" data-testid={`idea-card-${index}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium heading-display">{item.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          </div>
          <Badge className={nicheColors[item.niche] || ""}>{item.niche?.replace("_", " ")}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {item.content_type === "photo" && <ImageIcon className="w-4 h-4" />}
            {item.content_type === "carousel" && <Layers className="w-4 h-4" />}
            {item.content_type === "reel" && <Film className="w-4 h-4" />}
            {item.content_type === "story" && <MessageCircle className="w-4 h-4" />}
            <span className="capitalize">{item.content_type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{item.best_time_to_post}</span>
          </div>
        </div>
        <div className="bg-background rounded-sm p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">Suggested Caption</Label>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onCopy(item.id, item.suggested_caption, item.suggested_hashtags)}>
              {copiedId === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-sm">{item.suggested_caption}</p>
        </div>
        {item.suggested_hashtags?.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Hashtags</Label>
            <div className="flex flex-wrap gap-1">
              {item.suggested_hashtags.map((tag, idx) => (
                <span key={idx} className="hashtag-chip text-xs">{tag.startsWith("#") ? tag : `#${tag}`}</span>
              ))}
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full rounded-sm" onClick={() => onSave(item)}>
          <Save className="w-4 h-4 mr-1" />
          Save as Draft
        </Button>
      </CardContent>
    </Card>
  );
}

function TipCard({ item, index, copiedId, onCopy, onSave }) {
  return (
    <Card className="idea-card" data-testid={`tip-card-${index}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-blue-500/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <Badge className={categoryColors[item.category] || ""} variant="outline">
              {item.category?.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <div className="p-4 bg-blue-500/10 rounded-sm border border-blue-500/20">
          <p className="text-sm font-medium">{item.tip}</p>
        </div>
        <div className="bg-background rounded-sm p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">Caption Idea</Label>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onCopy(item.id, item.caption_idea, item.hashtags)}>
              {copiedId === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-sm">{item.caption_idea}</p>
        </div>
        {item.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.hashtags.map((tag, idx) => (
              <span key={idx} className="hashtag-chip text-xs">{tag.startsWith("#") ? tag : `#${tag}`}</span>
            ))}
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full rounded-sm" onClick={() => onSave(item, "tip")}>
          <Save className="w-4 h-4 mr-1" />
          Save as Draft
        </Button>
      </CardContent>
    </Card>
  );
}

function MixCard({ item, index, copiedId, onCopy, onSave }) {
  return (
    <Card className="idea-card" data-testid={`mix-card-${index}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium heading-display">{item.idea}</h3>
          <Badge className={categoryColors[item.category] || ""} variant="outline">
            {item.category?.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.content_type === "photo" && <ImageIcon className="w-4 h-4" />}
          {item.content_type === "carousel" && <Layers className="w-4 h-4" />}
          {item.content_type === "reel" && <Film className="w-4 h-4" />}
          {item.content_type === "story" && <MessageCircle className="w-4 h-4" />}
          <span className="capitalize">{item.content_type}</span>
        </div>
        <div className="bg-background rounded-sm p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">Ready Caption</Label>
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onCopy(item.id, item.caption, item.hashtags)}>
              {copiedId === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          <p className="text-sm">{item.caption}</p>
        </div>
        {item.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.hashtags.map((tag, idx) => (
              <span key={idx} className="hashtag-chip text-xs">{tag.startsWith("#") ? tag : `#${tag}`}</span>
            ))}
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full rounded-sm" onClick={() => onSave(item, "mix")}>
          <Save className="w-4 h-4 mr-1" />
          Save as Draft
        </Button>
      </CardContent>
    </Card>
  );
}
