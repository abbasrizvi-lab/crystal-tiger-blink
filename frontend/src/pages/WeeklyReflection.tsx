"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlayCircle } from "lucide-react"; // Using lucide-react for an icon
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WeeklyReflection = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockAudioSummary = {
    title: "Week 1: Embracing Resilience",
    duration: "10 min",
    summary: "This week, your calendar data showed increased focus during challenging tasks, indicating a growing resilience. You also logged a moment about overcoming a coding bug, reinforcing this trend. Keep nurturing your ability to bounce back!",
  };

  const mockCalendarInsights = [
    "Identified a pattern: You tend to schedule deep work sessions early in the morning, which aligns with your goal of 'Thoughtfulness'.",
    "Opportunity for growth: Mid-afternoon meetings sometimes disrupt your flow. Consider blocking out focus time before and after these.",
    "Behavioral pattern: You consistently allocate time for learning, demonstrating 'Grit' and 'Persistence'.",
  ];

  const mockVirtueSuggestion = {
    virtue: "Empathy",
    practice: "For the coming week, actively listen to a colleague's challenge without interrupting, and try to articulate their perspective back to them before offering solutions.",
  };

  // Mock data for advanced insights chart
  const mockGrowthData = [
    { name: "Week 1", Resilience: 65, Empathy: 70, Grit: 75 },
    { name: "Week 2", Resilience: 70, Empathy: 72, Grit: 78 },
    { name: "Week 3", Resilience: 75, Empathy: 75, Grit: 80 },
    { name: "Week 4", Resilience: 78, Empathy: 77, Grit: 82 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">Weekly Character Reflection</h1>

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
                <h3 className="font-semibold">{mockAudioSummary.title}</h3>
                <p className="text-sm text-muted-foreground">{mockAudioSummary.duration}</p>
              </div>
            </div>
            <p className="text-muted-foreground">{mockAudioSummary.summary}</p>
            <Button className="w-full" onClick={() => alert("Playing audio summary...")}>
              Play Audio Reflection
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
                  data={mockGrowthData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
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
            {mockCalendarInsights.map((insight, index) => (
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
            <h3 className="font-semibold text-lg">{mockVirtueSuggestion.virtue}</h3>
            <p className="text-muted-foreground">{mockVirtueSuggestion.practice}</p>
          </CardContent>
        </Card>

        <Button onClick={() => navigate("/dashboard")} className="w-full mt-8">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default WeeklyReflection;