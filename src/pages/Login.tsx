import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import LocationDropdown from '../components/LocationDropdown';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        login(res.user);
      } else {
        // Validate location is selected for signup
        if (!location) {
          setError(t('auth.locationRequired'));
          return;
        }
        const res = await api.post('/auth/register', { email, password, role: 'client', city: location });
        login(res.user);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? t('auth.login') : t('auth.signup')}</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.location')} <span className="text-red-500">*</span>
              </label>
              <LocationDropdown
                value={location}
                onChange={setLocation}
                allowEmpty
                emptyLabel={t('auth.locationPlaceholder')}
                className="w-full mt-1"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            {isLogin ? t('auth.login') : t('auth.signup')}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-sm text-gray-600 hover:text-red-600"
        >
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
        </button>
      </div>
    </div>
  );
}
