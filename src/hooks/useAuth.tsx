import { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: any | null; // Simulating the raw user object
  profile: UserProfile | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    login: () => {},
    logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('sushi_user');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setProfile(parsedUser);
        } catch (e) {
            console.error('Failed to parse stored user', e);
            localStorage.removeItem('sushi_user');
        }
    }
    setLoading(false);
  }, []);

  const login = (userData: any) => {
      localStorage.setItem('sushi_user', JSON.stringify(userData));
      setUser(userData);
      setProfile(userData);
  };

  const logout = () => {
      localStorage.removeItem('sushi_user');
      setUser(null);
      setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};