import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Reservation from './pages/Reservation';
import EventDetails from './pages/EventDetails';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminDbBrowser from './pages/AdminDbBrowser';
import AdminConfiguration from './pages/AdminConfiguration';
import Gallery from './pages/Gallery';
import Occasion from './pages/Occasion';
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
            <Route path="/" element={<Landing />} />
            <Route path="/occasions/:id" element={<Occasion />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/dashboard" element={
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
            <Route path="/admin/config" element={
              <ProtectedRoute>
                <AdminConfiguration />
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

export default App;
