"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import apiClient from "@/lib/api";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
}

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/articles");
        if (response.status !== 200) {
          if (response.status === 401) {
            navigate("/");
          }
          throw new Error("Failed to fetch articles");
        }
        setArticles(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || String(error));
        if (error.response?.status === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-foreground">All Articles</h1>
        {loading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : (
          <Card>
            <CardContent className="space-y-4 pt-6">
              {articles && articles.length > 0 ? (
                articles.map((article) => (
                  <div key={article.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{article.summary}</p>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                      Read More
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No articles available at the moment.</p>
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

export default Articles;