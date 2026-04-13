import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Reservation from './pages/Reservation';
import EventDetails from './pages/EventDetails';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminDbBrowser from './pages/AdminDbBrowser';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/reserve" element={
              <ProtectedRoute>
                <Reservation />
              </ProtectedRoute>
            } />
            <Route path="/event/:eventId" element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } />
            <Route path="/worker" element={
              <ProtectedRoute>
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/db" element={
              <ProtectedRoute>
                <AdminDbBrowser />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

function Home() {
  const { profile } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600">Sushiparty</h1>
      <p className="mt-4 text-gray-600">Welcome, {profile?.displayName || 'User'}!</p>
      <p className="text-sm text-gray-500">Role: {profile?.role}</p>
    </div>
  );
}

export default App;
