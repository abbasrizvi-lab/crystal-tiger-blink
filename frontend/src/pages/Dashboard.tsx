"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = "http://127.0.0.1:8001/api/v1";

interface DailyQuote {
  quote: string;
  author: string;
  reflectionPrompt: string;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
}

interface GrowthTrend {
  weekSummary: string;
  nextGoal: string;
}

interface DashboardData {
  dailyQuote: DailyQuote;
  newsArticles: NewsArticle[];
  growthTrends: GrowthTrend;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [momentText, setMomentText] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        toast.error(String(error));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogMoment = async (audioBlob?: Blob) => {
    if (!momentText.trim() && !audioBlob) {
      toast.error("Please enter a moment or record a voice note to log.");
      return;
    }
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("text", momentText);
    if (audioBlob) {
      formData.append("file", audioBlob, "moment.webm");
    }

    try {
      const response = await fetch(`${API_URL}/moments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to log moment");
      toast.success("Character Moment Logged!");
      setMomentText("");
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleVoiceLog = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      toast.error("Voice recording is not supported in your browser.");
      return;
    }

    if (isRecording) {
      // This part will be handled by the onstop event of the MediaRecorder
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.onstart = () => {
        setIsRecording(true);
        toast.info("Recording...");
      };

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        handleLogMoment(audioBlob);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      // Stop recording after a delay or on a user action
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 5000); // Stop after 5 seconds for example

    } catch (error) {
      toast.error("Error accessing microphone.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">Your Innovation Character Dashboard</h1>

        {loading ? (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        ) : dashboardData && (
          <>
            {/* Daily Philosophical Quote */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Reflection</CardTitle>
                <CardDescription>Cultivate wisdom through daily contemplation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
                  "{dashboardData.dailyQuote.quote}"
                  <footer className="text-sm mt-2 not-italic">- {dashboardData.dailyQuote.author}</footer>
                </blockquote>
                <p className="font-medium">{dashboardData.dailyQuote.reflectionPrompt}</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigate("/reflection", {
                      state: {
                        quote: dashboardData.dailyQuote.quote,
                        author: dashboardData.dailyQuote.author,
                        reflectionPrompt: dashboardData.dailyQuote.reflectionPrompt,
                      },
                    })
                  }
                >
                  Reflect Now
                </Button>
              </CardContent>
            </Card>

            {/* Quick Character Moment Logging */}
            <Card>
              <CardHeader>
                <CardTitle>Log a Character Moment</CardTitle>
                <CardDescription>Quickly capture insights, successes, or challenges.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., 'Showed resilience by pushing through a tough coding bug.'"
                  value={momentText}
                  onChange={(e) => setMomentText(e.target.value)}
                  rows={3}
                />
                <Button onClick={() => handleLogMoment()} className="w-full">Log Moment</Button>
                <Button variant="outline" className="w-full" onClick={handleVoiceLog} disabled={isRecording}>
                  {isRecording ? "Listening..." : "Log with Voice"}
                </Button>
              </CardContent>
            </Card>

            {/* Character Growth Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Character Growth Trends</CardTitle>
                <CardDescription>Visualize your development over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: dashboardData.growthTrends.weekSummary }} />
                  <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: dashboardData.growthTrends.nextGoal }} />
                </div>
                <Link to="/weekly-reflection">
                  <Button variant="outline" className="w-full mt-4">View Weekly Reflection & Progress</Button>
                </Link>
                <Link to="/settings">
                  <Button variant="secondary" className="w-full mt-2">Adjust Priority Virtues</Button>
                </Link>
                <Link to="/moments">
                  <Button variant="outline" className="w-full mt-2">View Logged Moments</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Additional Features Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Explore More</CardTitle>
                <CardDescription>Unlock advanced insights and collaboration features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/integrations">
                  <Button variant="outline" className="w-full">Integrations & Advanced Insights</Button>
                </Link>
                <Link to="/peer-feedback">
                  <Button variant="outline" className="w-full">Peer Accountability & Feedback</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Character in Action: News Articles */}
            <Card>
              <CardHeader>
                <CardTitle>Character in Action: News</CardTitle>
                <CardDescription>Discover inspiring examples of virtue in the world.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.newsArticles.map((article) => (
                  <div key={article.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{article.summary}</p>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                      Read More
                    </a>
                  </div>
                ))}
                <Link to="/articles">
                  <Button variant="outline" className="w-full">Find More Articles</Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;