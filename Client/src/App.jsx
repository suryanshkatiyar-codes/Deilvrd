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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected shell */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            {/* Day 3+ */}
            <Route path="/milestones" element={<div className="text-white">Milestones — Day 3</div>} />
            <Route path="/disputes" element={<div className="text-white">Disputes — Day 4</div>} />
            <Route path="/reviews" element={<div className="text-white">Reviews — Day 4</div>} />
            <Route path="/contracts/new" element={<CreateContractPage />} />
            <Route path="/contracts/:id" element={<ContractDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}