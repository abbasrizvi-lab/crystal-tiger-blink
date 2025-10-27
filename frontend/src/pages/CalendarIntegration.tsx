"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const CALENDAR_CONNECTED_KEY = "calendarConnected";

const CalendarIntegration = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const status = localStorage.getItem(CALENDAR_CONNECTED_KEY) === "true";
    setIsConnected(status);
  }, []);

  const handleConnectCalendar = () => {
    // Simulate connecting to a calendar service
    localStorage.setItem(CALENDAR_CONNECTED_KEY, "true");
    setIsConnected(true);
    toast.success("Calendar Connected!", {
      description: "Your calendar is now integrated for time analysis.",
    });
    // Navigate to the dashboard after successful connection
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Calendar Integration</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Connect your calendar to enable detailed time analysis and character-driven growth insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {isConnected ? (
            <>
              <p className="text-lg text-green-600 dark:text-green-400 font-medium">
                Your calendar is successfully connected!
              </p>
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </>
          ) : (
            <Button onClick={handleConnectCalendar} className="w-full">
              Connect Calendar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarIntegration;