import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Image as ImageIcon,
  Trash2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const nicheColors = {
  wedding: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  portrait: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  landscape: "bg-green-500/20 text-green-300 border-green-500/30",
  event: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  housewarming: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  baby_shower: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarItems, setCalendarItems] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const month = format(currentDate, "MM");
      const year = format(currentDate, "yyyy");
      
      const [calendarRes, contentRes] = await Promise.all([
        axios.get(`${API}/calendar?month=${month}&year=${year}`),
        axios.get(`${API}/content?status=draft`),
      ]);
      
      setCalendarItems(calendarRes.data.calendar || []);
      setContent(contentRes.data.content || []);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getItemsForDay = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return calendarItems.filter((item) => item.scheduled_date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setScheduleDialogOpen(true);
  };

  const handleSchedule = async () => {
    if (!selectedContent || !selectedDate) {
      toast.error("Please select content to schedule");
      return;
    }

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      await axios.post(
        `${API}/calendar/schedule?content_id=${selectedContent}&scheduled_date=${dateStr}&scheduled_time=${selectedTime}`
      );
      
      toast.success("Post scheduled successfully!");
      setScheduleDialogOpen(false);
      setSelectedContent("");
      fetchData();
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post");
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    try {
      await axios.delete(`${API}/calendar/${scheduleId}`);
      toast.success("Scheduled post cancelled");
      fetchData();
    } catch (error) {
      console.error("Error cancelling schedule:", error);
      toast.error("Failed to cancel scheduled post");
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  // Calculate empty days at start
  const firstDayOfMonth = startOfMonth(currentDate).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  return (
    <div className="space-y-8 animate-fade-in" data-testid="calendar-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight heading-display">
            Content Calendar
          </h1>
          <p className="text-muted-foreground mt-2">
            Schedule and manage your Instagram posts
          </p>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="rounded-sm"
            data-testid="btn-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-medium min-w-[180px] text-center heading-display">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="rounded-sm"
            data-testid="btn-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="content-card border-border" data-testid="calendar-grid">
        <CardContent className="p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="spinner" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before first of month */}
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="calendar-cell opacity-30" />
              ))}
              
              {/* Actual days */}
              {days.map((day) => {
                const dayItems = getItemsForDay(day);
                const hasItems = dayItems.length > 0;
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`calendar-cell ${hasItems ? "has-content" : ""} ${
                      isToday ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleDayClick(day)}
                    data-testid={`calendar-day-${format(day, "d")}`}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={`text-sm font-medium ${
                          isToday ? "text-blue-400" : ""
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                      {dayItems.slice(0, 2).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="mt-1 text-[10px] truncate text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewItem(item);
                          }}
                        >
                          {item.content?.title || "Scheduled"}
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayItems.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Posts */}
      <div>
        <h2 className="text-2xl font-medium heading-display mb-4">Upcoming Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendarItems.filter(item => item.status === "pending").slice(0, 6).map((item, index) => (
            <Card key={item.id || index} className="content-card" data-testid={`upcoming-post-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-sm bg-secondary flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium truncate max-w-[150px]">
                        {item.content?.title || "Untitled"}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <CalendarIcon className="w-3 h-3" />
                        {item.scheduled_date}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {item.scheduled_time}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewItem(item)}
                      data-testid={`view-post-${index}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => handleCancelSchedule(item.id)}
                      data-testid={`cancel-post-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {calendarItems.filter(item => item.status === "pending").length === 0 && (
            <Card className="content-card col-span-full">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No scheduled posts</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a date to schedule content
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="bg-card border-border" data-testid="schedule-dialog">
          <DialogHeader>
            <DialogTitle className="heading-display">
              Schedule Post for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select Content</Label>
              <Select value={selectedContent} onValueChange={setSelectedContent}>
                <SelectTrigger className="bg-background" data-testid="select-content">
                  <SelectValue placeholder="Choose a draft to schedule" />
                </SelectTrigger>
                <SelectContent>
                  {content.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title} ({item.niche})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="bg-background"
                data-testid="input-time"
              />
            </div>

            <Button
              onClick={handleSchedule}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-sm"
              disabled={!selectedContent}
              data-testid="btn-confirm-schedule"
            >
              Schedule Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg" data-testid="detail-dialog">
          <DialogHeader>
            <DialogTitle className="heading-display">
              {selectedItem?.content?.title || "Scheduled Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedItem?.content?.niche && (
              <Badge className={nicheColors[selectedItem.content.niche] || ""}>
                {selectedItem.content.niche.replace("_", " ")}
              </Badge>
            )}
            
            <div>
              <Label className="text-muted-foreground">Caption</Label>
              <p className="mt-1 text-sm">{selectedItem?.content?.caption}</p>
            </div>
            
            {selectedItem?.content?.hashtags?.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Hashtags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedItem.content.hashtags.map((tag, idx) => (
                    <span key={idx} className="hashtag-chip text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {selectedItem?.scheduled_date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedItem?.scheduled_time}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
