"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// Mock data for demonstration
const mockQuote = {
  quote: "The unexamined life is not worth living.",
  author: "Socrates",
  reflectionPrompt: "How did you examine your actions today in relation to your chosen virtues?",
};

const mockNewsArticles = [
  {
    id: "1",
    title: "CEO Demonstrates Humility in Crisis",
    summary: "A tech CEO took full responsibility for a product failure, showcasing humility and integrity.",
    link: "#",
  },
  {
    id: "2",
    title: "Team's Grit Leads to Breakthrough Innovation",
    summary: "Despite numerous setbacks, a small team's persistence and grit resulted in a groundbreaking discovery.",
    link: "#",
  },
  {
    id: "3",
    title: "Empathy Drives Design of New Accessibility Tool",
    summary: "Designers focused on user empathy to create an innovative tool that significantly improves accessibility.",
    link: "#",
  },
];

const Dashboard = () => {
  const [momentText, setMomentText] = React.useState("");

  const handleLogMoment = () => {
    if (momentText.trim()) {
      toast.success("Character Moment Logged!", {
        description: `"${momentText}"`,
      });
      setMomentText("");
    } else {
      toast.error("Please enter a moment to log.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">Your Innovation Character Dashboard</h1>

        {/* Daily Philosophical Quote */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Reflection</CardTitle>
            <CardDescription>Cultivate wisdom through daily contemplation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
              "{mockQuote.quote}"
              <footer className="text-sm mt-2 not-italic">- {mockQuote.author}</footer>
            </blockquote>
            <p className="font-medium">{mockQuote.reflectionPrompt}</p>
            <Button variant="outline" className="w-full">Reflect Now (Coming Soon)</Button>
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
            <Button onClick={handleLogMoment} className="w-full">Log Moment</Button>
            <Button variant="outline" className="w-full">Log with Voice (Coming Soon)</Button>
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
              <p className="text-muted-foreground">
                **Week 1 Summary:** You've shown strong progress in **Resilience** and **Thoughtfulness**.
                Your ability to focus during challenging tasks has improved by 15%.
              </p>
              <p className="text-muted-foreground">
                **Next Goal:** Continue to develop **Empathy** by actively listening.
              </p>
            </div>
            <Link to="/weekly-reflection">
              <Button variant="outline" className="w-full mt-4">View Weekly Reflection & Progress</Button>
            </Link>
            <Link to="/settings">
              <Button variant="secondary" className="w-full mt-2">Adjust Priority Virtues</Button>
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
            {mockNewsArticles.map((article) => (
              <div key={article.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{article.summary}</p>
                <Link to={article.link} className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                  Read More
                </Link>
              </div>
            ))}
            <Button variant="outline" className="w-full">Find More Articles (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;