import { useState, useEffect } from "react";
import axios from "axios";
import { 
  PenTool, 
  Calendar as CalendarIcon, 
  Lightbulb, 
  TrendingUp,
  Image as ImageIcon,
  Clock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const nicheColors = {
  wedding: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  portrait: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  landscape: "bg-green-500/20 text-green-300 border-green-500/30",
  event: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  housewarming: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  baby_shower: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, contentRes] = await Promise.all([
        axios.get(`${API}/analytics`),
        axios.get(`${API}/content`),
      ]);
      setAnalytics(analyticsRes.data);
      setRecentContent(contentRes.data.content?.slice(0, 4) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = analytics ? [
    { label: "Total Posts", value: analytics.total_posts, icon: ImageIcon, color: "text-blue-400" },
    { label: "Scheduled", value: analytics.scheduled_posts, icon: CalendarIcon, color: "text-green-400" },
    { label: "Ideas Generated", value: analytics.content_ideas_generated, icon: Lightbulb, color: "text-yellow-400" },
    { label: "Best Niche", value: analytics.best_performing_niche?.replace("_", " "), icon: TrendingUp, color: "text-red-400" },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="dashboard-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight heading-display">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2">
            Your photography content hub. Create, schedule, and grow.
          </p>
        </div>
        <Link to="/create">
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white rounded-sm h-12 px-6"
            data-testid="create-content-btn"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="stat-card border-border"
            data-testid={`stat-${stat.label.toLowerCase().replace(" ", "-")}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl font-semibold mt-4 heading-display capitalize">
                {stat.value || 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/create" className="group">
          <Card className="content-card card-hover h-full" data-testid="quick-action-caption">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-sm bg-blue-500/20 flex items-center justify-center mb-4">
                <PenTool className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Generate Caption</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered captions with hashtags for any photography niche
              </p>
              <div className="mt-4 flex items-center text-sm text-blue-400 group-hover:translate-x-1 transition-transform">
                Create now <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/ideas" className="group">
          <Card className="content-card card-hover h-full" data-testid="quick-action-ideas">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-sm bg-yellow-500/20 flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Get Content Ideas</h3>
              <p className="text-sm text-muted-foreground">
                Fresh content ideas tailored to your photography niche
              </p>
              <div className="mt-4 flex items-center text-sm text-yellow-400 group-hover:translate-x-1 transition-transform">
                Generate ideas <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/calendar" className="group">
          <Card className="content-card card-hover h-full" data-testid="quick-action-schedule">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-sm bg-green-500/20 flex items-center justify-center mb-4">
                <CalendarIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Schedule Posts</h3>
              <p className="text-sm text-muted-foreground">
                Plan your content calendar and never miss a post
              </p>
              <div className="mt-4 flex items-center text-sm text-green-400 group-hover:translate-x-1 transition-transform">
                View calendar <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-medium heading-display">Recent Content</h2>
          <Link to="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
        
        {recentContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentContent.map((content, index) => (
              <Card key={content.id || index} className="content-card" data-testid={`recent-content-${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-sm bg-secondary flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{content.title}</h4>
                        <Badge variant="outline" className={`text-[10px] ${nicheColors[content.niche] || ''}`}>
                          {content.niche?.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {content.caption}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="capitalize">{content.status}</span>
                        {content.scheduled_date && (
                          <span>• {content.scheduled_date}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="content-card">
            <CardContent className="p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No content yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start creating amazing content for your photography business
              </p>
              <Link to="/create">
                <Button className="bg-red-500 hover:bg-red-600 text-white rounded-sm" data-testid="empty-create-btn">
                  Create Your First Post
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
