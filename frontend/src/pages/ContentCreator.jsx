import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Wand2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NICHES = [
  { value: "wedding", label: "Wedding" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "event", label: "Event" },
  { value: "housewarming", label: "Housewarming" },
  { value: "baby_shower", label: "Baby Shower" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "inspirational", label: "Inspirational" },
  { value: "fun", label: "Fun & Playful" },
];

export default function ContentCreator() {
  const [niche, setNiche] = useState("wedding");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [includeCta, setIncludeCta] = useState(true);
  
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [engagementTips, setEngagementTips] = useState([]);
  
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageProvider, setImageProvider] = useState("gemini");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  
  const [captionLoading, setCaptionLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [title, setTitle] = useState("");
  const fileInputRef = useRef(null);

  const generateCaption = async () => {
    if (!niche) {
      toast.error("Please select a photography niche");
      return;
    }
    
    setCaptionLoading(true);
    try {
      const response = await axios.post(`${API}/content/generate-caption`, {
        niche,
        topic: topic || null,
        tone,
        include_cta: includeCta,
      });
      
      setCaption(response.data.caption);
      setHashtags(response.data.hashtags);
      setEngagementTips(response.data.engagement_tips);
      toast.success("Caption generated successfully!");
    } catch (error) {
      console.error("Error generating caption:", error);
      toast.error("Failed to generate caption. Please try again.");
    } finally {
      setCaptionLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt) {
      toast.error("Please enter an image prompt");
      return;
    }
    
    setImageLoading(true);
    setGeneratedImage(null);
    try {
      const response = await axios.post(`${API}/content/generate-image`, {
        prompt: imagePrompt,
        niche,
        provider: imageProvider,
        style: "professional photography, high quality",
      });
      
      setGeneratedImage(`data:image/png;base64,${response.data.image_base64}`);
      toast.success(`Image generated with ${imageProvider === "gemini" ? "Gemini Nano Banana" : "OpenAI GPT Image 1"}!`);
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
      toast.success("Image uploaded successfully!");
    }
  };

  const copyToClipboard = async () => {
    const textToCopy = `${caption}\n\n${hashtags.join(" ")}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const saveContent = async () => {
    if (!title || !caption) {
      toast.error("Please add a title and generate a caption first");
      return;
    }
    
    setSaveLoading(true);
    try {
      await axios.post(`${API}/content`, {
        title,
        caption,
        hashtags,
        niche,
        media_url: generatedImage || uploadedImage || null,
        media_type: generatedImage ? "ai_generated" : uploadedImage ? "uploaded" : null,
        status: "draft",
      });
      
      toast.success("Content saved as draft!");
      // Reset form
      setTitle("");
      setCaption("");
      setHashtags([]);
      setEngagementTips([]);
      setGeneratedImage(null);
      setUploadedImage(null);
      setTopic("");
      setImagePrompt("");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaveLoading(false);
    }
  };

  const clearImage = () => {
    setGeneratedImage(null);
    setUploadedImage(null);
  };

  return (
    <div className="space-y-8 animate-fade-in" data-testid="content-creator">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight heading-display">
          Create Content
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate AI-powered captions and images for your Instagram posts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Caption Generator */}
        <div className="space-y-6">
          <Card className="content-card border-border" data-testid="caption-generator-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wand2 className="w-5 h-5 text-blue-400" />
                Caption Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Post Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Wedding at Sunset Beach"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background border-input"
                  data-testid="input-title"
                />
              </div>

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
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Golden hour portraits, Beach ceremony"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-background border-input"
                  data-testid="input-topic"
                />
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label>Caption Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-background" data-testid="select-tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CTA Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="cta-toggle">Include Call-to-Action</Label>
                <Switch
                  id="cta-toggle"
                  checked={includeCta}
                  onCheckedChange={setIncludeCta}
                  data-testid="switch-cta"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateCaption}
                disabled={captionLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-sm h-11"
                data-testid="btn-generate-caption"
              >
                {captionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Caption
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Caption */}
          {caption && (
            <Card className="content-card border-border animate-fade-in" data-testid="generated-caption-card">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Generated Caption</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    data-testid="btn-copy-caption"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="caption-textarea min-h-[120px]"
                  data-testid="textarea-caption"
                />

                {/* Hashtags */}
                <div>
                  <Label className="mb-2 block">Hashtags</Label>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <span key={index} className="hashtag-chip" data-testid={`hashtag-${index}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Engagement Tips */}
                {engagementTips.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Engagement Tips</Label>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {engagementTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Image Generator */}
        <div className="space-y-6">
          <Card className="content-card border-border" data-testid="image-generator-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                Image Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Image Preview */}
              <div className={`image-preview ${imageLoading ? "generating" : ""}`}>
                {generatedImage || uploadedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={generatedImage || uploadedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      data-testid="image-preview"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                      onClick={clearImage}
                      data-testid="btn-clear-image"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : imageLoading ? (
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Generating image...</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload an image or generate one with AI
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full rounded-sm"
                onClick={() => fileInputRef.current?.click()}
                data-testid="btn-upload-image"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your Photo
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or generate with AI</span>
                </div>
              </div>

              {/* AI Provider Selection */}
              <div className="provider-toggle">
                <button
                  type="button"
                  className={imageProvider === "gemini" ? "active" : ""}
                  onClick={() => setImageProvider("gemini")}
                  data-testid="btn-provider-gemini"
                >
                  Gemini Nano Banana
                </button>
                <button
                  type="button"
                  className={imageProvider === "openai" ? "active" : ""}
                  onClick={() => setImageProvider("openai")}
                  data-testid="btn-provider-openai"
                >
                  OpenAI GPT Image 1
                </button>
              </div>

              {/* Image Prompt */}
              <div className="space-y-2">
                <Label htmlFor="image-prompt">Image Prompt</Label>
                <Textarea
                  id="image-prompt"
                  placeholder="e.g., A romantic sunset wedding ceremony on a beach with golden light..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="caption-textarea min-h-[80px]"
                  data-testid="textarea-image-prompt"
                />
              </div>

              {/* Generate Image Button */}
              <Button
                onClick={generateImage}
                disabled={imageLoading || !imagePrompt}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-sm h-11"
                data-testid="btn-generate-image"
              >
                {imageLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={saveContent}
            disabled={saveLoading || !caption || !title}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-sm h-12"
            data-testid="btn-save-content"
          >
            {saveLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
