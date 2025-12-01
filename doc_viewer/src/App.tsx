import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DocumentViewerPage from "./pages/DocumentViewer";
import NotFound from "./pages/NotFound";
import ManagePdf from "./pages/ManagePdf";
import { RBACProvider } from "./components/rbac/RBACProvider";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <RBACProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/document/:documentId" element={<DocumentViewerPage />} />
                        <Route path="/document/:documentId/manage" element={<ManagePdf />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </RBACProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
