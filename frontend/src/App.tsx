import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CalendarIntegration from "./pages/CalendarIntegration";
import Dashboard from "./pages/Dashboard";
import WeeklyReflection from "./pages/WeeklyReflection";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations"; // Import new Integrations page
import PeerFeedback from "./pages/PeerFeedback"; // Import new PeerFeedback page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calendar-integration" element={<CalendarIntegration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/weekly-reflection" element={<WeeklyReflection />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/integrations" element={<Integrations />} /> {/* New route */}
          <Route path="/peer-feedback" element={<PeerFeedback />} /> {/* New route */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;