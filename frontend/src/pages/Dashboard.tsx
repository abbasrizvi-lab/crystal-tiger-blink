"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";

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
      try {
        setLoading(true);
        const response = await apiClient.get("/dashboard");
        if (response.status !== 200) {
          if (response.status === 401) {
            navigate("/");
          }
          throw new Error("Failed to fetch dashboard data");
        }
        setDashboardData(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || String(error));
        if (error.response?.status === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Your Innovation Character Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

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
                {dashboardData.dailyQuote && dashboardData.dailyQuote.quote ? (
                  <>
                    <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
                      "{dashboardData.dailyQuote.quote}"
                      <footer className="text-sm mt-2 not-italic">- {dashboardData.dailyQuote.author}</footer>
                    </blockquote>
                    <p className="font-medium">{dashboardData.dailyQuote.reflectionPrompt}</p>
                  </>
                ) : (
                  <p>Your daily reflection will appear here soon.</p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navigate("/reflection", {
                      state: {
                        quote: dashboardData.dailyQuote.quote,
                        author: dashboardData.dailyQuote.author,
                        reflectionPrompt: dashboardData.dailyQuote.reflectionPrompt,
                        type: "reflection",
                      },
                    })
                  }
                >
                  Reflect on this quote
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
                <Link to="/reflections">
                  <Button variant="outline" className="w-full mt-2">View Reflections</Button>
                </Link>
                <Button onClick={() => navigate("/reflection", { state: { type: "moment" } })} className="w-full mt-2">
                  Log a Moment
                </Button>
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