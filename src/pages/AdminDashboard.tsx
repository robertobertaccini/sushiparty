import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import type { UserProfile, AdditionalService } from '../types';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [services] = useState<AdditionalService[]>([
    { id: '1', name: 'Premium Fish Upgrade', price: 20 },
    { id: '2', name: 'Waiter Service', price: 100 },
    { id: '3', name: 'Extra Wasabi/Ginger', price: 5 },
  ]);

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const qEvents = query(collection(db, 'events'));
    const unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const fetchWorkers = async () => {
      const qWorkers = query(collection(db, 'users'), where('role', '==', 'worker'));
      const snapshot = await getDocs(qWorkers);
      setWorkers(snapshot.docs.map(doc => doc.data() as UserProfile));
    };

    fetchWorkers();
    return unsubscribeEvents;
  }, [profile]);

  const updateEvent = async (eventId: string, updates: any) => {
    await updateDoc(doc(db, 'events', eventId), updates);
  };

  const calculateTotal = (event: any) => {
    const basePrice = event.participantCount * 50;
    const servicesPrice = event.additionalServices.reduce((acc: number, serviceId: string) => {
      const service = services.find(s => s.id === serviceId);
      return acc + (service?.price || 0);
    }, 0);
    return basePrice + servicesPrice;
  };

  if (profile?.role !== 'admin') return <div className="p-10 text-center">Access Denied</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Event Info</th>
              <th className="p-4 font-semibold">Worker</th>
              <th className="p-4 font-semibold">Participants</th>
              <th className="p-4 font-semibold">Services</th>
              <th className="p-4 font-semibold">Total Bill</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map(event => (
              <tr key={event.id}>
                <td className="p-4">
                  <div className="font-medium">{event.city}</div>
                  <div className="text-sm text-gray-500">{event.date}</div>
                </td>
                <td className="p-4">
                  <select
                    value={event.workerId}
                    onChange={(e) => updateEvent(event.id, { workerId: e.target.value })}
                    className="border rounded p-1 text-sm"
                  >
                    {workers.map(w => (
                      <option key={w.uid} value={w.uid}>{w.displayName}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    value={event.participantCount}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      const total = calculateTotal({ ...event, participantCount: count });
                      updateEvent(event.id, { participantCount: count, totalAmount: total });
                    }}
                    className="border rounded p-1 w-16"
                  />
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {services.map(service => (
                      <label key={service.id} className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={event.additionalServices.includes(service.id)}
                          onChange={(e) => {
                            const newServices = e.target.checked
                              ? [...event.additionalServices, service.id]
                              : event.additionalServices.filter((id: string) => id !== service.id);
                            const total = calculateTotal({ ...event, additionalServices: newServices });
                            updateEvent(event.id, { additionalServices: newServices, totalAmount: total });
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
                  <button
                    onClick={() => updateEvent(event.id, { status: 'cancelled' })}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
