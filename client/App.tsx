import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import DCCU from "./pages/DCCU";
import NotFound from "./pages/NotFound";
import ControlCenter from "./pages/ControlCenter";
import OpsBoard from "./pages/OpsBoard";
import Vault from "./pages/Vault";
import Monitor from "./pages/Monitor";
import Creator from "./pages/Creator";
import { AuthProvider } from "@/state/auth";
import { DCCUProvider } from "@/state/dccu";
import { SiteProvider } from "@/state/site";
import { OpsProvider } from "@/state/ops";
import { VaultProvider } from "@/state/vault";
import { CreatorProvider } from "@/state/creator";
import AccessGuard from "@/components/AccessGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <SiteProvider>
        <DCCUProvider>
          <OpsProvider>
            <VaultProvider>
              <CreatorProvider>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/"
                      element={
                        <AccessGuard>
                          <Dashboard />
                        </AccessGuard>
                      }
                    />
                    <Route
                      path="/dccu"
                      element={
                        <AccessGuard>
                          <DCCU />
                        </AccessGuard>
                      }
                    />
                    <Route
                      path="/control"
                      element={
                        <AccessGuard>
                          <ControlCenter />
                        </AccessGuard>
                      }
                    />
                    <Route
                      path="/ops"
                      element={
                        <AccessGuard>
                          <OpsBoard />
                        </AccessGuard>
                      }
                    />
                    <Route
                      path="/vault"
                      element={
                        <AccessGuard>
                          <Vault />
                        </AccessGuard>
                      }
                    />
                    <Route
                      path="/monitor"
                      element={
                        <AccessGuard>
                          <Monitor />
                        </AccessGuard>
                      }
                    />
                    <Route
                      path="/creator"
                      element={
                        <AccessGuard>
                          <Creator />
                        </AccessGuard>
                      }
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </CreatorProvider>
            </VaultProvider>
          </OpsProvider>
        </DCCUProvider>
      </SiteProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
