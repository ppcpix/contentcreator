import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  FileText,
  Lightbulb,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f97316", "#eab308"];

const nicheColors = {
  wedding: "#ec4899",
  portrait: "#3b82f6",
  landscape: "#22c55e",
  event: "#a855f7",
  housewarming: "#f97316",
  baby_shower: "#eab308",
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="analytics-loading">
        <div className="spinner" />
      </div>
    );
  }

  const nicheData = analytics?.posts_by_niche
    ? Object.entries(analytics.posts_by_niche).map(([name, value]) => ({
        name: name.replace("_", " "),
        value,
        color: nicheColors[name] || "#71717a",
      }))
    : [];

  const statsCards = [
    {
      title: "Total Posts",
      value: analytics?.total_posts || 0,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Scheduled",
      value: analytics?.scheduled_posts || 0,
      icon: Calendar,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Published",
      value: analytics?.published_posts || 0,
      icon: ImageIcon,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Ideas Generated",
      value: analytics?.content_ideas_generated || 0,
      icon: Lightbulb,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" data-testid="analytics-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight heading-display">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your content performance and growth
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card
            key={index}
            className="stat-card border-border"
            data-testid={`stat-${stat.title.toLowerCase().replace(" ", "-")}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-sm ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-semibold heading-display">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <Card className="chart-container border-border" data-testid="engagement-chart">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Weekly Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.engagement_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="day"
                    stroke="#71717a"
                    fontSize={12}
                  />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "4px",
                      color: "#fafafa",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#22c55e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Posts by Day */}
        <Card className="chart-container border-border" data-testid="posts-chart">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Posts by Day
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.engagement_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="day"
                    stroke="#71717a"
                    fontSize={12}
                  />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "4px",
                      color: "#fafafa",
                    }}
                  />
                  <Bar
                    dataKey="posts"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Niche Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="chart-container border-border lg:col-span-1" data-testid="niche-chart">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg">Content by Niche</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nicheData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {nicheData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "4px",
                      color: "#fafafa",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {nicheData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="capitalize text-muted-foreground">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Best Performing & Insights */}
        <Card className="content-card border-border lg:col-span-2" data-testid="insights-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Best Niche */}
            <div className="flex items-center justify-between p-4 bg-background rounded-sm border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Best Performing Niche</p>
                <p className="text-2xl font-semibold capitalize heading-display">
                  {analytics?.best_performing_niche?.replace("_", " ") || "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-sm bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-sm border border-border">
                <p className="text-sm text-muted-foreground">Drafts Pending</p>
                <p className="text-xl font-semibold">
                  {analytics?.drafts || 0}
                </p>
              </div>
              <div className="p-4 bg-background rounded-sm border border-border">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-semibold">
                  {analytics?.total_posts > 0
                    ? Math.round(
                        ((analytics?.published_posts || 0) /
                          analytics.total_posts) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="p-4 bg-yellow-500/10 rounded-sm border border-yellow-500/20">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">
                Pro Tip
              </h4>
              <p className="text-sm text-muted-foreground">
                Posts scheduled between 9 AM - 11 AM and 7 PM - 9 PM typically
                receive 23% more engagement. Consider scheduling your{" "}
                <span className="capitalize">
                  {analytics?.best_performing_niche?.replace("_", " ")}
                </span>{" "}
                content during these peak hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
