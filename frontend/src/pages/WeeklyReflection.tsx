"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";

interface AudioSummary {
  title: string;
  duration: string;
  summary: string;
}

interface VirtueSuggestion {
  virtue: string;
  practice: string;
}

interface GrowthDataPoint {
    name: string;
    Resilience: number;
    Empathy: number;
    Grit: number;
}

interface WeeklyReflectionData {
  audioSummary: AudioSummary;
  calendarInsights: string[];
  virtueSuggestion: VirtueSuggestion;
  growthData: GrowthDataPoint[];
}

const WeeklyReflection = () => {
  const navigate = useNavigate();
  const [reflectionData, setReflectionData] = useState<WeeklyReflectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/reflections/weekly");
        if (response.status !== 200) {
          if (response.status === 401) {
            navigate("/");
          }
          throw new Error("Failed to fetch weekly reflection data");
        }
        setReflectionData(response.data);
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

    const wsUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/^http/, 'ws') + '/ws/reflections';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setReflectionData(data);
    };

    return () => {
      ws.close();
    };
  }, [navigate]);

  const handlePlayAudio = () => {
    if (!reflectionData || !('speechSynthesis' in window)) {
      toast.error("Speech synthesis is not supported in your browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(reflectionData.audioSummary?.summary);
    utterance.onstart = () => {
      setIsPlaying(true);
      toast.info("Playing audio summary...");
    };
    utterance.onend = () => {
      setIsPlaying(false);
    };
    window.speechSynthesis.speak(utterance);
  };


  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Weekly Character Reflection</h1>
        </div>

        {loading ? (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        ) : reflectionData ? (
          <>
            {/* Weekly Audio Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Weekly Audio Summary</CardTitle>
                <CardDescription>Listen to personalized insights on your character growth.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                    <PlayCircle className="h-6 w-6" />
                  </Button>
                  <div>
                    <h3 className="font-semibold">{reflectionData.audioSummary?.title || "Summary"}</h3>
                    <p className="text-sm text-muted-foreground">{reflectionData.audioSummary?.duration || "N/A"}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{reflectionData.audioSummary?.summary || "Your weekly audio summary will appear here soon."}</p>
                <Button className="w-full" onClick={handlePlayAudio}>
                  {isPlaying ? "Stop Playback" : "Play Audio Reflection"}
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Advanced Insights: Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Character Growth Over Time</CardTitle>
                <CardDescription>Visualizing your progress in key virtues.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={reflectionData.growthData || []}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-sm text-muted-foreground" />
                      <YAxis className="text-sm text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Line type="monotone" dataKey="Resilience" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Empathy" stroke="hsl(var(--accent))" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Grit" stroke="hsl(var(--destructive))" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Insights from Calendar Data */}
            <Card>
              <CardHeader>
                <CardTitle>Insights from Your Calendar Data</CardTitle>
                <CardDescription>Personalized patterns supporting or hindering your character goals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.isArray(reflectionData.calendarInsights) && reflectionData.calendarInsights.length > 0 ? (
                  reflectionData.calendarInsights.map((insight, index) => (
                    <p key={index} className="text-muted-foreground">
                      • {insight}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">No calendar insights available yet.</p>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Virtue Practice Suggestion */}
            <Card>
              <CardHeader>
                <CardTitle>Virtue Practice Suggestion for Next Week</CardTitle>
                <CardDescription>A focused exercise to develop your chosen virtues.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-semibold text-lg">{reflectionData.virtueSuggestion?.virtue || "Suggestion"}</h3>
                <p className="text-muted-foreground">{reflectionData.virtueSuggestion?.practice || "Your virtue practice suggestion will appear here soon."}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Reflection Data</CardTitle>
              <CardDescription>
                There is no weekly reflection data available yet. Start by logging moments and reflections.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Button onClick={() => navigate("/dashboard")} className="w-full mt-8">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default WeeklyReflection;