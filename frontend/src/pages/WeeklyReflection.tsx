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

const API_URL = "http://127.0.0.1:8001/api/v1";

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
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/reflections/weekly`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch weekly reflection data");
        const data = await response.json();
        setReflectionData(data);
      } catch (error) {
        toast.error(String(error));
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const ws = new WebSocket("ws://127.0.0.1:8001/ws/reflections");
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

    const utterance = new SpeechSynthesisUtterance(reflectionData.audioSummary.summary);
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
        ) : reflectionData && (
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
                    <h3 className="font-semibold">{reflectionData.audioSummary.title}</h3>
                    <p className="text-sm text-muted-foreground">{reflectionData.audioSummary.duration}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{reflectionData.audioSummary.summary}</p>
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
                      data={reflectionData.growthData}
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
                {reflectionData.calendarInsights.map((insight, index) => (
                  <p key={index} className="text-muted-foreground">
                    • {insight}
                  </p>
                ))}
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
                <h3 className="font-semibold text-lg">{reflectionData.virtueSuggestion.virtue}</h3>
                <p className="text-muted-foreground">{reflectionData.virtueSuggestion.practice}</p>
              </CardContent>
            </Card>
          </>
        )}

        <Button onClick={() => navigate("/dashboard")} className="w-full mt-8">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default WeeklyReflection;