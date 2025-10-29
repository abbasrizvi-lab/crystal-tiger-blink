"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Slack, Users } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";

interface IntegrationSettings {
  connected: boolean;
  settings: any;
}

interface IntegrationsData {
  email: IntegrationSettings;
  slack: IntegrationSettings;
  jira: IntegrationSettings;
}

const Integrations = () => {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<IntegrationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntegrations = async () => {
      console.log("--- fetchIntegrations started ---");
      try {
        setLoading(true);
        const response = await apiClient.get("/integrations");
        console.log("--- Received integrations from backend ---", response);
        if (response.status !== 200) {
          console.error("--- Backend returned non-200 status ---", response);
          if (response.status === 401) {
            navigate("/");
          }
          throw new Error("Failed to fetch integrations");
        }
        console.log("--- Setting integrations data ---", response.data);
        setIntegrations(response.data);
      } catch (error: any) {
        console.error("--- Error in fetchIntegrations ---", error);
        toast.error(error.response?.data?.detail || String(error));
        if (error.response?.status === 401) {
          navigate("/");
        }
      } finally {
        console.log("--- fetchIntegrations finished ---");
        setLoading(false);
      }
    };
    fetchIntegrations();
  }, [navigate]);

  const handleToggleIntegration = async (integrationName: keyof IntegrationsData) => {
    console.log(`--- handleToggleIntegration started for ${integrationName} ---`);
    if (!integrations) return;

    const integration = integrations[integrationName];
    if (!integration) {
        toast.error(`Settings for ${integrationName} not found.`);
        return;
    }

    const updatedIntegrations = {
      ...integrations,
      [integrationName]: {
        ...integration,
        connected: !integration.connected,
      },
    };

    try {
      console.log(`--- Sending updated integrations to backend for ${integrationName} ---`, updatedIntegrations);
      const response = await apiClient.put("/integrations", updatedIntegrations);
      console.log("--- Received response from backend ---", response);
      if (response.status !== 200) {
        console.error("--- Backend returned non-200 status ---", response);
        throw new Error(`Failed to update ${integrationName} integration`);
      }
      console.log(`--- ${integrationName} integration updated successfully ---`);
      setIntegrations(updatedIntegrations);
      toast.success(`${integrationName} integration updated successfully!`);
    } catch (error: any) {
      console.error(`--- Error in handleToggleIntegration for ${integrationName} ---`, error);
      toast.error(error.response?.data?.detail || String(error));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">Integrations & Advanced Insights</h1>

        {loading ? (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        ) : integrations && (
          <>
            {/* Email Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" /> Email Integration
                </CardTitle>
                <CardDescription>
                  Connect your email to analyze communication patterns and sentiment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleToggleIntegration("email")} className="w-full">
                  {integrations.email?.connected ? "Disconnect Email" : "Connect Email"}
                </Button>
              </CardContent>
            </Card>

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
                  <Button size="sm" onClick={() => handleToggleIntegration("slack")}>
                    {integrations.slack?.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
                {/* Jira Integration */}
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-[#0052CC]" />
                    <span>Jira</span>
                  </div>
                  <Button size="sm" onClick={() => handleToggleIntegration("jira")}>
                    {integrations.jira?.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
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

export default Integrations;