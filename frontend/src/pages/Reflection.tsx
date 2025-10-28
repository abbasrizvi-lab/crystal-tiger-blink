"use client";

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const API_URL = "http://127.0.0.1:8001/api/v1";

const Reflection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quote, author, reflectionPrompt } = location.state || {};
  const [reflectionText, setReflectionText] = useState("");

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) {
      toast.error("Please enter your reflection.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/moments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: `Reflection on "${quote}": ${reflectionText}` }),
      });
      if (!response.ok) throw new Error("Failed to save reflection");
      toast.success("Reflection saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(String(error));
    }
  };

  if (!quote) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold">No quote to reflect on.</h1>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Reflection</CardTitle>
            <CardDescription>"{quote}" - {author}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{reflectionPrompt}</p>
            <Textarea
              placeholder="Write your reflection here..."
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              rows={6}
            />
            <Button onClick={handleSaveReflection} className="w-full">Save Reflection</Button>
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