"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquareText, User } from "lucide-react";
import { toast } from "sonner";

const PeerFeedback = () => {
  const navigate = useNavigate();

  // Mock data for peer feedback
  const mockFeedback = [
    {
      id: "1",
      peer: "Alice Johnson",
      virtue: "Grit",
      rating: 5,
      comment: "Alice consistently demonstrates incredible grit, especially when facing complex technical challenges. She never gives up!",
      date: "2024-10-20",
    },
    {
      id: "2",
      peer: "Bob Williams",
      virtue: "Empathy",
      rating: 4,
      comment: "Bob is great at understanding team members' perspectives and offering support. His empathy helps foster a collaborative environment.",
      date: "2024-10-18",
    },
    {
      id: "3",
      peer: "Charlie Brown",
      virtue: "Resilience",
      rating: 4,
      comment: "Charlie bounced back quickly after a project setback, learning from the experience and motivating the team forward.",
      date: "2024-10-15",
    },
  ];

  const handleRequestFeedback = () => {
    toast.info("Feedback Request Sent!", {
      description: "Your peers have been notified to provide feedback.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">Peer Accountability & Feedback</h1>

        {/* Request Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5" /> Request Feedback
            </CardTitle>
            <CardDescription>
              Ask your colleagues for insights on your character development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRequestFeedback} className="w-full">
              Request Feedback from Peers
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Received Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Received Feedback
            </CardTitle>
            <CardDescription>
              Insights from your colleagues on your character in action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockFeedback.length > 0 ? (
              mockFeedback.map((feedback) => (
                <div key={feedback.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>From: <span className="font-medium text-foreground">{feedback.peer}</span></span>
                    <span>{feedback.date}</span>
                  </div>
                  <p className="mt-2 text-foreground">
                    <span className="font-semibold">{feedback.virtue}:</span> {feedback.comment}
                  </p>
                  <div className="text-sm text-muted-foreground mt-1">
                    Rating: {feedback.rating}/5
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No feedback received yet.</p>
            )}
          </CardContent>
        </Card>

        <Button onClick={() => navigate("/dashboard")} className="w-full mt-8">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PeerFeedback;