import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase/config';
import { LogOut, Home, Calendar, Shield, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/reserve', label: 'Book Now', icon: Calendar, show: profile?.role === 'client' },
    { to: '/worker', label: 'My Schedule', icon: User, show: profile?.role === 'worker' },
    { to: '/admin', label: 'Admin', icon: Shield, show: profile?.role === 'admin' },
  ];

  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold tracking-wider flex items-center gap-2">
              🍣 SUSHI PARTY
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {links.filter(l => l.show !== false).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-red-700 pb-4 px-2">
          {links.filter(l => l.show !== false).map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3"
            >
              <link.icon size={20} />
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-3"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
