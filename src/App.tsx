import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import OccasionPage from "./pages/OccasionPage.tsx";
import OccasionEditorPage from "./pages/OccasionEditorPage.tsx";
import FlowersPage from "./pages/FlowersPage.tsx";
import ChocolatesPage from "./pages/ChocolatesPage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import PrintPage from "./pages/PrintPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/occasions/:slug" element={<OccasionPage />} />
          <Route path="/occasions/:slug/customise/:templateId" element={<OccasionEditorPage />} />
          <Route path="/gifts/flowers" element={<FlowersPage />} />
          <Route path="/gifts/chocolates" element={<ChocolatesPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/print" element={<PrintPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
