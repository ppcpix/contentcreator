import { useState } from "react";
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

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NICHES = [
  { value: "wedding", label: "Wedding", icon: "💒" },
  { value: "portrait", label: "Portrait", icon: "👤" },
  { value: "landscape", label: "Landscape", icon: "🏞️" },
  { value: "event", label: "Event", icon: "🎉" },
  { value: "housewarming", label: "Housewarming", icon: "🏠" },
  { value: "baby_shower", label: "Baby Shower", icon: "👶" },
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

export default function IdeasGenerator() {
  const [niche, setNiche] = useState("wedding");
  const [count, setCount] = useState([5]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const generateIdeas = async () => {
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

  const copyCaption = async (id, caption, hashtags) => {
    const textToCopy = `${caption}\n\n${hashtags?.join(" ") || ""}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    toast.success("Caption copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveAsContent = async (idea) => {
    try {
      await axios.post(`${API}/content`, {
        title: idea.title,
        caption: idea.suggested_caption,
        hashtags: idea.suggested_hashtags || [],
        niche: idea.niche,
        status: "draft",
      });
      
      toast.success("Idea saved as draft content!");
    } catch (error) {
      console.error("Error saving idea:", error);
      toast.error("Failed to save idea");
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
          Content Ideas
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered content ideas tailored to your photography niche
        </p>
      </div>

      {/* Generator Controls */}
      <Card className="content-card border-border" data-testid="ideas-controls">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Niche Selection */}
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

            {/* Count Slider */}
            <div className="space-y-2">
              <Label>Number of Ideas: {count[0]}</Label>
              <Slider
                value={count}
                onValueChange={setCount}
                min={1}
                max={10}
                step={1}
                className="mt-3"
                data-testid="slider-count"
              />
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <Button
                onClick={generateIdeas}
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-sm h-11"
                data-testid="btn-generate-ideas"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Ideas
                  </>
                )}
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
            className={`rounded-sm ${
              niche === n.value ? "bg-secondary text-foreground" : ""
            }`}
            data-testid={`niche-quick-${n.value}`}
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
            <Card
              key={idea.id || index}
              className="idea-card"
              data-testid={`idea-card-${index}`}
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium heading-display">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {idea.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={nicheColors[idea.niche] || ""}>
                      {idea.niche?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Content Type & Time */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ContentTypeIcon type={idea.content_type} />
                    <span className="capitalize">{idea.content_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{idea.best_time_to_post}</span>
                  </div>
                </div>

                {/* Suggested Caption */}
                <div className="bg-background rounded-sm p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-muted-foreground">Suggested Caption</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => copyCaption(idea.id, idea.suggested_caption, idea.suggested_hashtags)}
                      data-testid={`copy-caption-${index}`}
                    >
                      {copiedId === idea.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm">{idea.suggested_caption}</p>
                </div>

                {/* Hashtags */}
                {idea.suggested_hashtags?.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Suggested Hashtags
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {idea.suggested_hashtags.map((tag, idx) => (
                        <span key={idx} className="hashtag-chip text-xs">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-sm"
                    onClick={() => saveAsContent(idea)}
                    data-testid={`save-idea-${index}`}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="content-card">
          <CardContent className="p-12 text-center">
            <Lightbulb className="w-16 h-16 mx-auto text-yellow-400/50 mb-4" />
            <h3 className="text-xl font-medium mb-2 heading-display">
              Ready to Spark Creativity?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Select your photography niche and generate AI-powered content ideas
              that will help grow your Instagram presence.
            </p>
            <Button
              onClick={generateIdeas}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-sm"
              data-testid="btn-generate-ideas-empty"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Your First Ideas
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
