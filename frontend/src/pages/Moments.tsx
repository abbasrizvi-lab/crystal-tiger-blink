"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import apiClient from "@/lib/api";

interface Moment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  audioUrl?: string;
}

const Moments = () => {
  const navigate = useNavigate();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/moments");
        if (response.status !== 200) {
          if (response.status === 401) {
            navigate("/");
          }
          throw new Error("Failed to fetch moments");
        }
        setMoments(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || String(error));
        if (error.response?.status === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMoments();
  }, [navigate]);

  const handlePlayMoment = (moment: Moment) => {
    if (!('speechSynthesis' in window)) {
      toast.error("Speech synthesis is not supported in your browser.");
      return;
    }

    if (playingId === moment.id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(moment.text);
    utterance.onstart = () => {
      setPlayingId(moment.id);
    };
    utterance.onend = () => {
      setPlayingId(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">Your Logged Moments</h1>
        {loading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <Card>
            <CardContent className="space-y-4 pt-6">
              {Array.isArray(moments) && moments.length > 0 ? (
                moments.map((moment, index) => (
                  <div key={`${moment.id}-${index}`} className="border-b pb-3 last:border-b-0 last:pb-0 flex justify-between items-center">
                    <div>
                      <p className="text-muted-foreground">{new Date(moment.createdAt).toLocaleString()}</p>
                      <p className="text-lg">{moment.text}</p>
                      {moment.audioUrl && (
                        <audio controls src={`http://127.0.0.1:8001${moment.audioUrl}`} className="mt-2" />
                      )}
                    </div>
                    <Button onClick={() => handlePlayMoment(moment)} size="sm">
                      {playingId === moment.id ? "Stop" : "Play"}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">You haven't logged any moments yet.</p>
              )}
            </CardContent>
          </Card>
        )}
        <Button onClick={() => navigate("/reflection", { state: { type: "moment" } })} className="w-full mt-8">
          Log a New Moment
        </Button>
        <Button onClick={() => navigate("/dashboard")} className="w-full mt-8">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Moments;