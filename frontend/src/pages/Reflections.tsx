"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import apiClient from "@/lib/api";

interface Reflection {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  audioUrl?: string;
}

const Reflections = () => {
  const navigate = useNavigate();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReflections = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/reflections");
        if (response.status !== 200) {
          if (response.status === 401) {
            navigate("/");
          }
          throw new Error("Failed to fetch reflections");
        }
        setReflections(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || String(error));
        if (error.response?.status === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReflections();
  }, [navigate]);

  const handlePlayReflection = (reflection: Reflection) => {
    if (!('speechSynthesis' in window)) {
      toast.error("Speech synthesis is not supported in your browser.");
      return;
    }

    if (playingId === reflection.id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(reflection.text);
    utterance.onstart = () => {
      setPlayingId(reflection.id);
    };
    utterance.onend = () => {
      setPlayingId(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">Your Logged Reflections</h1>
        {loading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <Card>
            <CardContent className="space-y-4 pt-6">
              {Array.isArray(reflections) && reflections.length > 0 ? (
                reflections.map((reflection, index) => (
                  <div key={`${reflection.id}-${index}`} className="border-b pb-3 last:border-b-0 last:pb-0 flex justify-between items-center">
                    <div>
                      <p className="text-muted-foreground">{new Date(reflection.createdAt).toLocaleString()}</p>
                      <p className="text-lg">{reflection.text}</p>
                      {reflection.audioUrl && (
                        <audio controls src={`http://127.0.0.1:8001${reflection.audioUrl}`} className="mt-2" />
                      )}
                    </div>
                    <Button onClick={() => handlePlayReflection(reflection)} size="sm">
                      {playingId === reflection.id ? "Stop" : "Play"}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">You haven't logged any reflections yet.</p>
              )}
            </CardContent>
          </Card>
        )}
        <Button onClick={() => navigate("/dashboard")} className="w-full mt-8">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Reflections;