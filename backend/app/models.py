from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserSettings(BaseModel):
    priorityVirtues: List[str]
    customVirtues: List[str]

class MomentCreate(BaseModel):
    text: str

class Moment(MomentCreate):
    id: str
    userId: str
    createdAt: datetime
    audioUrl: Optional[str] = None

    class Config:
        from_attributes = True

class DailyQuote(BaseModel):
    quote: str
    author: str
    reflectionPrompt: str

class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str
    link: str

class GrowthTrend(BaseModel):
    weekSummary: str
    nextGoal: str

class DashboardData(BaseModel):
    dailyQuote: DailyQuote
    newsArticles: List[NewsArticle]
    growthTrends: GrowthTrend

class AudioSummary(BaseModel):
    title: str
    duration: str
    summary: str

class VirtueSuggestion(BaseModel):
    virtue: str
    practice: str
    
class GrowthDataPoint(BaseModel):
    name: str
    Moments: Optional[int] = None
    Resilience: Optional[int] = None
    Empathy: Optional[int] = None
    Grit: Optional[int] = None

class WeeklyReflectionData(BaseModel):
    audioSummary: AudioSummary
    calendarInsights: List[str]
    virtueSuggestion: VirtueSuggestion
    growthData: List[GrowthDataPoint]

class IntegrationSettings(BaseModel):
    connected: bool
    settings: dict

class Integrations(BaseModel):
    email: IntegrationSettings
    slack: IntegrationSettings
    jira: IntegrationSettings