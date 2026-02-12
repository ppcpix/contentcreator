import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Zap,
  Film,
  Target,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Briefcase,
  Heart,
  Hash,
  User,
  Clock,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HOOK_TYPES = [
  { value: "curiosity", label: "Curiosity Hooks", icon: Zap, description: "Make them want to know more" },
  { value: "storytelling", label: "Story Hooks", icon: Heart, description: "Connect emotionally" },
  { value: "value", label: "Value Hooks", icon: Star, description: "Promise useful content" },
  { value: "engagement", label: "Engagement Hooks", icon: MessageSquare, description: "Drive comments & shares" },
  { value: "social_proof", label: "Social Proof", icon: Users, description: "Build trust & credibility" },
];

const REEL_CATEGORIES = [
  { value: "trending", label: "Trending Reels", icon: TrendingUp },
  { value: "educational", label: "Educational", icon: Briefcase },
  { value: "engagement_boosters", label: "Engagement Boosters", icon: Heart },
];

const MAGNET_TYPES = [
  { value: "testimonial", label: "Testimonial Post", icon: Star },
  { value: "portfolio", label: "Portfolio Showcase", icon: Target },
  { value: "value_posts", label: "Value/Lead Magnet", icon: Zap },
];

const CTA_TYPES = [
  { value: "booking", label: "Booking CTAs" },
  { value: "engagement", label: "Engagement CTAs" },
  { value: "lead_generation", label: "Lead Gen CTAs" },
];

const NICHES = [
  { value: "wedding", label: "Wedding" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "event", label: "Event" },
  { value: "housewarming", label: "Housewarming" },
  { value: "baby_shower", label: "Baby Shower" },
];

export default function GrowthTools() {
  const [activeTab, setActiveTab] = useState("viral-hooks");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Viral Hooks state
  const [hookType, setHookType] = useState("curiosity");
  const [hookNiche, setHookNiche] = useState("wedding");
  const [hookCount, setHookCount] = useState([5]);
  const [hooks, setHooks] = useState([]);

  // Reel Ideas state
  const [reelCategory, setReelCategory] = useState("trending");
  const [reelNiche, setReelNiche] = useState("wedding");
  const [reelCount, setReelCount] = useState([5]);
  const [reels, setReels] = useState([]);

  // Client Magnet state
  const [magnetType, setMagnetType] = useState("portfolio");
  const [magnetNiche, setMagnetNiche] = useState("wedding");
  const [clientName, setClientName] = useState("");
  const [magnet, setMagnet] = useState(null);

  // CTA state
  const [ctaType, setCtaType] = useState("booking");
  const [ctas, setCtas] = useState([]);

  const copyText = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateHooks = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/viral-hooks/generate`, {
        hook_type: hookType,
        niche: hookNiche,
        count: hookCount[0],
      });
      setHooks(response.data.hooks || []);
      toast.success(`Generated ${response.data.hooks?.length || 0} viral hooks!`);
    } catch (error) {
      console.error("Error generating hooks:", error);
      toast.error("Failed to generate hooks");
    } finally {
      setLoading(false);
    }
  };

  const generateReels = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/reel-ideas/generate`, {
        category: reelCategory,
        niche: reelNiche,
        count: reelCount[0],
      });
      setReels(response.data.reels || []);
      toast.success(`Generated ${response.data.reels?.length || 0} reel ideas!`);
    } catch (error) {
      console.error("Error generating reels:", error);
      toast.error("Failed to generate reel ideas");
    } finally {
      setLoading(false);
    }
  };

  const generateMagnet = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/client-magnets/generate`, {
        template_type: magnetType,
        niche: magnetNiche,
        client_name: clientName || null,
      });
      setMagnet(response.data.magnet);
      toast.success("Client magnet generated!");
    } catch (error) {
      console.error("Error generating magnet:", error);
      toast.error("Failed to generate client magnet");
    } finally {
      setLoading(false);
    }
  };

  const fetchCTAs = async () => {
    try {
      const response = await axios.get(`${API}/cta/${ctaType}`);
      setCtas(response.data.templates || []);
    } catch (error) {
      console.error("Error fetching CTAs:", error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" data-testid="growth-tools">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight heading-display">
          Growth Tools
        </h1>
        <p className="text-muted-foreground mt-2">
          Viral hooks, reel scripts, and client magnets to 10x your Instagram growth
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-card border border-border">
          <TabsTrigger value="viral-hooks" className="data-[state=active]:bg-secondary" data-testid="tab-viral-hooks">
            <Zap className="w-4 h-4 mr-2" />
            Viral Hooks
          </TabsTrigger>
          <TabsTrigger value="reel-ideas" className="data-[state=active]:bg-secondary" data-testid="tab-reel-ideas">
            <Film className="w-4 h-4 mr-2" />
            Reel Ideas
          </TabsTrigger>
          <TabsTrigger value="client-magnets" className="data-[state=active]:bg-secondary" data-testid="tab-client-magnets">
            <Target className="w-4 h-4 mr-2" />
            Client Magnets
          </TabsTrigger>
          <TabsTrigger value="cta-library" className="data-[state=active]:bg-secondary" data-testid="tab-cta-library">
            <MessageSquare className="w-4 h-4 mr-2" />
            CTA Library
          </TabsTrigger>
        </TabsList>

        {/* Viral Hooks Tab */}
        <TabsContent value="viral-hooks" className="mt-6 space-y-6">
          <Card className="content-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hook Type</Label>
                  <Select value={hookType} onValueChange={setHookType}>
                    <SelectTrigger className="bg-background" data-testid="select-hook-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOOK_TYPES.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          <div className="flex items-center gap-2">
                            <h.icon className="w-4 h-4" />
                            <span>{h.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Photography Niche</Label>
                  <Select value={hookNiche} onValueChange={setHookNiche}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Hook Type Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {HOOK_TYPES.map((h) => (
                  <button
                    key={h.value}
                    onClick={() => setHookType(h.value)}
                    className={`p-3 rounded-sm border transition-all text-left ${
                      hookType === h.value 
                        ? "border-red-500 bg-red-500/10" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <h.icon className={`w-5 h-5 mb-2 ${hookType === h.value ? "text-red-400" : "text-muted-foreground"}`} />
                    <p className="text-xs font-medium">{h.label}</p>
                    <p className="text-[10px] text-muted-foreground">{h.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Number of Hooks: {hookCount[0]}</Label>
                  <Slider value={hookCount} onValueChange={setHookCount} min={1} max={10} step={1} />
                </div>
                <Button
                  onClick={generateHooks}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-sm h-11 px-6"
                  data-testid="btn-generate-hooks"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hooks Results */}
          {hooks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hooks.map((hook, index) => (
                <Card key={index} className="content-card" data-testid={`hook-card-${index}`}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-red-500/20 rounded-sm">
                        <Zap className="w-4 h-4 text-red-400" />
                      </div>
                      <Badge variant="outline" className="text-xs">{hook.best_for || "post"}</Badge>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-sm border border-red-500/20">
                      <p className="font-semibold text-red-300">{hook.hook}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{hook.full_caption}</p>
                    {hook.hashtags && (
                      <div className="flex flex-wrap gap-1">
                        {hook.hashtags.slice(0, 5).map((tag, i) => (
                          <span key={i} className="hashtag-chip text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => copyText(`hook-${index}`, `${hook.hook}\n\n${hook.full_caption}\n\n${hook.hashtags?.join(" ") || ""}`)}
                    >
                      {copiedId === `hook-${index}` ? <Check className="w-4 h-4 mr-1 text-green-400" /> : <Copy className="w-4 h-4 mr-1" />}
                      Copy Full Caption
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reel Ideas Tab */}
        <TabsContent value="reel-ideas" className="mt-6 space-y-6">
          <Card className="content-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Reel Category</Label>
                  <Select value={reelCategory} onValueChange={setReelCategory}>
                    <SelectTrigger className="bg-background" data-testid="select-reel-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REEL_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <c.icon className="w-4 h-4" />
                            <span>{c.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Photography Niche</Label>
                  <Select value={reelNiche} onValueChange={setReelNiche}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Ideas: {reelCount[0]}</Label>
                  <Slider value={reelCount} onValueChange={setReelCount} min={1} max={10} step={1} className="mt-3" />
                </div>
              </div>
              <Button
                onClick={generateReels}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-sm h-11"
                data-testid="btn-generate-reels"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Film className="w-4 h-4 mr-2" />}
                Generate Reel Ideas
              </Button>
            </CardContent>
          </Card>

          {/* Reels Results */}
          {reels.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reels.map((reel, index) => (
                <Card key={index} className="content-card" data-testid={`reel-card-${index}`}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg heading-display">{reel.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {reel.duration}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{reel.concept || reel.description}</p>
                    
                    {reel.hook && (
                      <div className="p-3 bg-purple-500/10 rounded-sm border border-purple-500/20">
                        <p className="text-xs text-purple-300 mb-1">First 3 Seconds Hook:</p>
                        <p className="text-sm font-medium">{reel.hook}</p>
                      </div>
                    )}
                    
                    {reel.script_outline && (
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium mb-1">Script Outline:</p>
                        <p className="line-clamp-2">{reel.script_outline}</p>
                      </div>
                    )}
                    
                    {reel.trending_audio_suggestion && (
                      <div className="flex items-center gap-2 text-xs">
                        <Play className="w-3 h-3 text-green-400" />
                        <span className="text-muted-foreground">Audio: {reel.trending_audio_suggestion}</span>
                      </div>
                    )}
                    
                    {reel.hashtags && (
                      <div className="flex flex-wrap gap-1">
                        {reel.hashtags.slice(0, 5).map((tag, i) => (
                          <span key={i} className="hashtag-chip text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => copyText(`reel-${index}`, `${reel.title}\n\n${reel.concept || reel.description}\n\nHook: ${reel.hook || ''}\n\n${reel.hashtags?.join(" ") || ""}`)}
                    >
                      {copiedId === `reel-${index}` ? <Check className="w-4 h-4 mr-1 text-green-400" /> : <Copy className="w-4 h-4 mr-1" />}
                      Copy Reel Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Client Magnets Tab */}
        <TabsContent value="client-magnets" className="mt-6 space-y-6">
          <Card className="content-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Post Type</Label>
                  <Select value={magnetType} onValueChange={setMagnetType}>
                    <SelectTrigger className="bg-background" data-testid="select-magnet-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAGNET_TYPES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          <div className="flex items-center gap-2">
                            <m.icon className="w-4 h-4" />
                            <span>{m.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Photography Niche</Label>
                  <Select value={magnetNiche} onValueChange={setMagnetNiche}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Client Name (Optional)</Label>
                  <Input 
                    placeholder="e.g., Sarah & Mike" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
              
              {/* Magnet Type Cards */}
              <div className="grid grid-cols-3 gap-3">
                {MAGNET_TYPES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMagnetType(m.value)}
                    className={`p-4 rounded-sm border transition-all text-center ${
                      magnetType === m.value 
                        ? "border-green-500 bg-green-500/10" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <m.icon className={`w-6 h-6 mx-auto mb-2 ${magnetType === m.value ? "text-green-400" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium">{m.label}</p>
                  </button>
                ))}
              </div>

              <Button
                onClick={generateMagnet}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-sm h-11"
                data-testid="btn-generate-magnet"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                Generate Client Magnet Post
              </Button>
            </CardContent>
          </Card>

          {/* Magnet Result */}
          {magnet && (
            <Card className="content-card border-green-500/30" data-testid="magnet-result">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-green-400" />
                  Your Client Magnet Post
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Caption</Label>
                  <Textarea 
                    value={magnet.caption} 
                    readOnly 
                    className="min-h-[200px] bg-background"
                  />
                </div>
                
                {magnet.cta && (
                  <div className="p-3 bg-green-500/10 rounded-sm border border-green-500/20">
                    <p className="text-xs text-green-300 mb-1">Call to Action:</p>
                    <p className="text-sm font-medium">{magnet.cta}</p>
                  </div>
                )}
                
                {magnet.hashtags && (
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Hashtags</Label>
                    <div className="flex flex-wrap gap-1">
                      {magnet.hashtags.map((tag, i) => (
                        <span key={i} className="hashtag-chip text-xs">{tag.startsWith("#") ? tag : `#${tag}`}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {magnet.posting_tips && (
                  <div className="p-3 bg-yellow-500/10 rounded-sm border border-yellow-500/20">
                    <p className="text-xs text-yellow-300 mb-2">Posting Tips:</p>
                    <ul className="text-sm space-y-1">
                      {(Array.isArray(magnet.posting_tips) ? magnet.posting_tips : [magnet.posting_tips]).map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={() => copyText("magnet", `${magnet.caption}\n\n${magnet.cta || ""}\n\n${magnet.hashtags?.join(" ") || ""}`)}
                >
                  {copiedId === "magnet" ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Full Post
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CTA Library Tab */}
        <TabsContent value="cta-library" className="mt-6 space-y-6">
          <Card className="content-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label>CTA Type</Label>
                  <Select value={ctaType} onValueChange={(v) => { setCtaType(v); setCtas([]); }}>
                    <SelectTrigger className="bg-background" data-testid="select-cta-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={fetchCTAs}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-sm h-11 px-6"
                  data-testid="btn-fetch-ctas"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Load CTAs
                </Button>
              </div>
              
              {/* CTA Type Quick Select */}
              <div className="grid grid-cols-3 gap-3">
                {CTA_TYPES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => { setCtaType(c.value); setCtas([]); }}
                    className={`p-3 rounded-sm border transition-all text-center ${
                      ctaType === c.value 
                        ? "border-blue-500 bg-blue-500/10" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <p className="text-sm font-medium">{c.label}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA Results */}
          {ctas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ctas.map((cta, index) => (
                <Card key={index} className="content-card" data-testid={`cta-card-${index}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <p className="text-sm flex-1">{cta}</p>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyText(`cta-${index}`, cta)}
                    >
                      {copiedId === `cta-${index}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="content-card bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-400" />
                CTA Best Practices
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Booking CTAs:</strong> Use urgency and scarcity (limited spots, booking fast)</li>
                <li>• <strong>Engagement CTAs:</strong> Ask questions, create polls, encourage saves</li>
                <li>• <strong>Lead Gen CTAs:</strong> Offer free value (guides, presets, tips) in exchange for DMs</li>
                <li>• <strong>Pro tip:</strong> Mix different CTAs to avoid sounding repetitive</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
