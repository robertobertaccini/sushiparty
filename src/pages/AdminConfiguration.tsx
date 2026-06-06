import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

export default function AdminConfiguration() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [config, setConfig] = useState({
    minParticipants: 2,
    maxParticipants: 20,
    reservationDelayDays: 1,
  });

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    
    const fetchConfig = async () => {
      try {
        const data = await api.get('/settings');
        if (data) {
          setConfig(data);
        }
      } catch (err) {
        console.error('Failed to load configuration:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/settings', config);
      setMessage('Configuration saved successfully!');
    } catch (err) {
      console.error('Failed to save configuration:', err);
      setMessage('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (profile?.role !== 'admin') return <div className="p-10 text-center">Access Denied</div>;

  if (loading) return <div className="p-10 text-center">Loading configuration...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Application Configuration</h2>
        <p className="text-gray-600 mt-2">Manage the rules and parameters for reservations.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Reservation Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Participants
                </label>
                <input
                  type="number"
                  name="minParticipants"
                  value={config.minParticipants}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border rounded focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The lowest number of participants allowed in a reservation.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={config.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border rounded focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The highest number of participants allowed in a reservation.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reservation Delay (Days)
                </label>
                <input
                  type="number"
                  name="reservationDelayDays"
                  value={config.reservationDelayDays}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-2 border rounded focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum number of days in advance a reservation must be made. (e.g. 1 means tomorrow)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
