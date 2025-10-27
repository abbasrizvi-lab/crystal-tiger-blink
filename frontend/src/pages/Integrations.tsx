"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Slack, Users } from "lucide-react";
import { toast } from "sonner";

const EMAIL_CONNECTED_KEY = "emailConnected";
const SLACK_CONNECTED_KEY = "slackConnected";
const TEAMS_CONNECTED_KEY = "teamsConnected";

const Integrations = () => {
  const navigate = useNavigate();
  const [emailConnected, setEmailConnected] = React.useState(false);
  const [slackConnected, setSlackConnected] = React.useState(false);
  const [teamsConnected, setTeamsConnected] = React.useState(false);

  React.useEffect(() => {
    setEmailConnected(localStorage.getItem(EMAIL_CONNECTED_KEY) === "true");
    setSlackConnected(localStorage.getItem(SLACK_CONNECTED_KEY) === "true");
    setTeamsConnected(localStorage.getItem(TEAMS_CONNECTED_KEY) === "true");
  }, []);

  const handleConnect = (key: string, setter: React.Dispatch<React.SetStateAction<boolean>>, name: string) => {
    localStorage.setItem(key, "true");
    setter(true);
    toast.success(`${name} Connected!`, {
      description: `Your ${name} is now integrated.`,
    });
  };

  const handleDisconnect = (key: string, setter: React.Dispatch<React.SetStateAction<boolean>>, name: string) => {
    localStorage.removeItem(key);
    setter(false);
    toast.info(`${name} Disconnected.`, {
      description: `Your ${name} integration has been removed.`,
    });
  };

  // Mock data for email analysis
  const mockEmailAnalysis = {
    sentiment: "Overall Positive (85%)",
    patterns: [
      "Identified a pattern of sending emails late at night (after 10 PM) on Tuesdays and Thursdays.",
      "Your average response time to critical emails is 2 hours.",
      "You tend to use encouraging language in team communications.",
    ],
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">Integrations & Advanced Insights</h1>

        {/* Email Integration & Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Email Integration
            </CardTitle>
            <CardDescription>
              Connect your email to analyze communication patterns and sentiment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailConnected ? (
              <>
                <p className="text-green-600 dark:text-green-400 font-medium">Email is connected.</p>
                <Button variant="outline" onClick={() => handleDisconnect(EMAIL_CONNECTED_KEY, setEmailConnected, "Email")} className="w-full">
                  Disconnect Email
                </Button>
                <Separator />
                <h3 className="text-lg font-semibold">Communication Pattern Analysis</h3>
                <p className="text-muted-foreground">Sentiment: {mockEmailAnalysis.sentiment}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {mockEmailAnalysis.patterns.map((pattern, index) => (
                    <li key={index}>{pattern}</li>
                  ))}
                </ul>
              </>
            ) : (
              <Button onClick={() => handleConnect(EMAIL_CONNECTED_KEY, setEmailConnected, "Email")} className="w-full">
                Connect Email
              </Button>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Workplace Tools Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Workplace Tools
            </CardTitle>
            <CardDescription>
              Integrate with your team's communication platforms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Slack Integration */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Slack className="h-5 w-5 text-[#E01E5A]" />
                <span>Slack</span>
              </div>
              {slackConnected ? (
                <Button variant="outline" size="sm" onClick={() => handleDisconnect(SLACK_CONNECTED_KEY, setSlackConnected, "Slack")}>
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" onClick={() => handleConnect(SLACK_CONNECTED_KEY, setSlackConnected, "Slack")}>
                  Connect
                </Button>
              )}
            </div>

            {/* Teams Integration */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#6264A7]" />
                <span>Microsoft Teams</span>
              </div>
              {teamsConnected ? (
                <Button variant="outline" size="sm" onClick={() => handleDisconnect(TEAMS_CONNECTED_KEY, setTeamsConnected, "Microsoft Teams")}>
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" onClick={() => handleConnect(TEAMS_CONNECTED_KEY, setTeamsConnected, "Microsoft Teams")}>
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => navigate("/dashboard")} className="w-full mt-8">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Integrations;