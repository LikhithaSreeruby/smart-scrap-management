/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { RequestPickup } from "./pages/RequestPickup";
import { Login } from "./pages/Login";
import { CollectorView } from "./pages/CollectorView";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/request" 
        element={user ? <RequestPickup /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/collector" 
        element={user ? <CollectorView /> : <Navigate to="/login" replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100">
            <AppRoutes />
            <Toaster position="bottom-center" />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
