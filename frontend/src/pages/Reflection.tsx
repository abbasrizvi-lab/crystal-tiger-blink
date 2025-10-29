"use client";

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import apiClient from "@/lib/api";

const Reflection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quote, author, reflectionPrompt, type = "moment" } = location.state || {};
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.ondataavailable = (e) => {
          setAudioBlob(e.data);
        };
        recorder.start();
        setIsRecording(true);
      } catch (error) {
        toast.error("Microphone access denied.");
      }
    }
  };

  const handleSave = async () => {
    console.log(`--- handleSave started for type: ${type} ---`);
    if (!text.trim()) {
      console.error("--- Validation failed: Text is empty. ---");
      toast.error(`Please enter your ${type}.`);
      return;
    }
    try {
      const formData = new FormData();
      const momentText = type === "reflection" && quote ? `Reflection on "${quote}": ${text}` : text;
      formData.append("text", momentText);
      formData.append("type", type);
      if (audioBlob) {
        formData.append("file", audioBlob, "moment.webm");
      }
      
      console.log("--- Sending data to backend ---", {
        text: momentText,
        type: type,
        hasAudio: !!audioBlob,
      });

      const response = await apiClient.post("/moments", formData);

      console.log("--- Received response from backend ---", response);

      if (response.status !== 200) {
        console.error("--- Backend returned non-200 status ---", response);
        throw new Error(`Failed to save ${type}`);
      }

      console.log("--- ${type} saved successfully, navigating... ---");
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`);
      navigate(type === "reflection" ? "/reflections" : "/moments");
    } catch (error: any) {
      console.error("--- Error in handleSave ---", error);
      toast.error(error.response?.data?.detail || String(error));
    }
  };

  const pageTitle = type === "reflection" ? "Daily Reflection" : "Log a Moment";
  const placeholderText = type === "reflection" ? "Write your reflection here..." : "What's on your mind?";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            {type === "reflection" && quote && (
              <CardDescription>"{quote}" - {author}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {type === "reflection" && reflectionPrompt && (
              <p className="font-medium">{reflectionPrompt}</p>
            )}
            <Textarea
              placeholder={placeholderText}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
            />
            <div className="flex space-x-2">
              <Button onClick={handleSave} className="w-full">Save {type.charAt(0).toUpperCase() + type.slice(1)}</Button>
              <Button onClick={handleToggleRecording} className="w-full" variant={isRecording ? "destructive" : "outline"}>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reflection;