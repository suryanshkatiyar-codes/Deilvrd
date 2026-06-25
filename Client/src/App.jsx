import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ContractsPage from "./pages/ContractsPage";
import CreateContractPage from "./pages/CreateContractPage";
import ContractDetailPage from "./pages/ContractDetailPage";
import MilestonesPage from "./pages/MilestonesPage";
import DisputesPage from "./pages/DisputesPage";
import ReviewsPage from "./pages/ReviewsPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"      element={<DashboardPage />} />
            <Route path="/contracts"      element={<ContractsPage />} />
            <Route path="/contracts/new"  element={<CreateContractPage />} />
            <Route path="/contracts/:id"  element={<ContractDetailPage />} />
            <Route path="/milestones"     element={<MilestonesPage />} />
            <Route path="/disputes"       element={<DisputesPage />} />
            <Route path="/reviews"        element={<ReviewsPage />} />
            <Route path="/admin"          element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}