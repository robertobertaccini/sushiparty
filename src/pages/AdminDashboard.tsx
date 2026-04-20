import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import LocationDropdown from '../components/LocationDropdown';
import { ADDITIONAL_SERVICES } from '../lib/constants';
import { Share2, XCircle } from 'lucide-react';
import type { UserProfile } from '../types';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<{ [key: string]: UserProfile }>({});

  const fetchEvents = async () => {
    if (profile?.role !== 'admin') return;
    try {
      const data = await api.get('/events');
      // Fix parsing for additionalServices if we needed to
      const parsedData = data.map((e: any) => ({
        ...e,
        additionalServices: e.additionalServices ? (typeof e.additionalServices === 'string' ? JSON.parse(e.additionalServices) : e.additionalServices) : []
      }));
      setEvents(parsedData);

      // Fetch client info for each event
      const clientIds = new Set(parsedData.map((e: any) => e.clientId));
      const clientMap: { [key: string]: UserProfile } = {};
      
      for (const clientId of clientIds) {
        try {
          const clientData = await api.get(`/users/${clientId}`);
          clientMap[clientId] = clientData;
        } catch (e) {
          console.error(`Failed to fetch client ${clientId}:`, e);
        }
      }
      setClients(clientMap);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    fetchEvents();

    const fetchWorkers = async () => {
      try {
         const data = await api.get('/users?role=worker');
         setWorkers(data);
      } catch (e) {
         console.error(e);
      }
    };

    fetchWorkers();
  }, [profile]);

  const updateEvent = async (eventId: string, updates: any) => {
    try {
      // In SQLite we should stringify the additional services if that's what's being updated
      if (updates.additionalServices) {
         updates.additionalServices = JSON.stringify(updates.additionalServices);
      }
      await api.put(`/events/${eventId}`, updates);
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEvent = async (eventId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this reservation?');
    if (!confirmed) return;

    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
    } catch (e) {
      console.error('Failed to delete reservation:', e);
    }
  };

  const calculateTotal = (event: any) => {
    const basePrice = event.participantCount * 50;
    const servicesPrice = event.additionalServices.reduce((acc: number, serviceId: string) => {
      const service = ADDITIONAL_SERVICES.find(s => s.id === serviceId);
      return acc + (service?.price || 0);
    }, 0);
    return basePrice + servicesPrice;
  };

  const getShareHref = (event: any, client?: UserProfile, worker?: UserProfile) => {
    const subject = `Your Sushiparty reservation on ${event.date}`;
    const body = `Hello ${client?.displayName || 'there'},\n\n` +
      `Here are your reservation details:\n` +
      `Date: ${event.date}\n` +
      `Location: ${event.city}\n` +
      `Worker: ${worker?.displayName || 'TBD'}\n` +
      `Participants: ${event.participantCount}\n` +
      `Total: $${event.totalAmount}\n\n` +
      `Please reply if you need to change anything.\n\n` +
      `Best regards,\n` +
      `Sushiparty Team`;

    const mailto = `mailto:${client?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return mailto;
  };

  if (profile?.role !== 'admin') return <div className="p-10 text-center">Access Denied</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Link
          to="/admin/db"
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          User Management
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold">Worker Info</th>
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold">Participants</th>
              <th className="p-4 font-semibold">Services</th>
              <th className="p-4 font-semibold">Total Bill</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map(event => {
              const worker = workers.find(w => w.uid === event.workerId);
              const client = clients[event.clientId];
              return (
                <tr key={event.eventId}>
                  <td className="p-4">
                    <div className="text-sm text-gray-700">{event.date}</div>
                  </td>
                  <td className="p-4">
                    <LocationDropdown
                      value={event.city}
                      onChange={(newCity) => updateEvent(event.eventId, { city: newCity })}
                      className="text-sm"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {worker?.photoURL && (
                        <img
                          src={worker.photoURL}
                          alt={worker.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      {!worker?.photoURL && (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600">
                            {worker?.displayName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <select
                        value={event.workerId}
                        onChange={(e) => updateEvent(event.eventId, { workerId: e.target.value })}
                        className="border rounded p-1 text-sm"
                      >
                        {workers.map(w => (
                          <option key={w.uid} value={w.uid}>{w.displayName}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{client?.displayName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={event.participantCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        const total = calculateTotal({ ...event, participantCount: count });
                        updateEvent(event.eventId, { participantCount: count, totalAmount: total });
                      }}
                      className="border rounded p-1 w-16"
                    />
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {ADDITIONAL_SERVICES.map(service => (
                        <label key={service.id} className="flex items-center text-xs">
                          <input
                            type="checkbox"
                            checked={event.additionalServices.includes(service.id)}
                            onChange={(e) => {
                              const newServices = e.target.checked
                                ? [...event.additionalServices, service.id]
                                : event.additionalServices.filter((id: string) => id !== service.id);
                              const total = calculateTotal({ ...event, additionalServices: newServices });
                              updateEvent(event.eventId, { additionalServices: newServices, totalAmount: total });
                            }}
                            className="mr-1"
                          />
                          {service.name}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-bold">
                    ${event.totalAmount}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => deleteEvent(event.eventId)}
                        className="text-red-600 hover:text-red-800 transition"
                        aria-label="Delete reservation"
                      >
                        <XCircle size={20} />
                      </button>
                      <a
                        href={getShareHref(event, client, worker)}
                        className="text-gray-600 hover:text-red-600 transition"
                        aria-label="Share reservation via email"
                      >
                        <Share2 size={20} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
