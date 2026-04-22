import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import WorkerCalendar from '../components/WorkerCalendar';
import { ADDITIONAL_SERVICES } from '../lib/constants';
import type { UserProfile, SushiEvent } from '../types';

export default function Reservation() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const city = profile?.city || '';
  const [date, setDate] = useState('');
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<UserProfile | null>(null);
  const [participants, setParticipants] = useState(6);
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientEvents, setClientEvents] = useState<SushiEvent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [config, setConfig] = useState({ minParticipants: 6, maxParticipants: 12, reservationDelayDays: 1 });

  const fetchReservations = async () => {
    if (!user) return;
    try {
      const events = await api.get(`/events?clientId=${user.uid}`) as SushiEvent[];
      const activeEvents = (events || []).filter(event => event.status !== 'cancelled');
      setClientEvents(activeEvents);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  };

  useEffect(() => {
    fetchReservations();
    const fetchConfig = async () => {
      try {
        const data = await api.get('/settings');
        if (data) {
          setConfig(data);
          if (participants < data.minParticipants) setParticipants(data.minParticipants);
          if (participants > data.maxParticipants) setParticipants(data.maxParticipants);
        }
      } catch (err) {}
    };
    fetchConfig();
  }, [user]);

  const handleMakeAnotherBooking = () => {
    setRefreshKey(prev => prev + 1);
    fetchReservations();
    setDate('');
    setSelectedWorker(null);
    setStep(1);
  };

  const handleDateSelect = (selectedDate: string, availableWorkers: UserProfile[]) => {
    setDate(selectedDate);
    setWorkers(availableWorkers);
  };

  const handleWorkerSelect = (worker: UserProfile, selectedDate: string) => {
    setSelectedWorker(worker);
    setDate(selectedDate);
    setStep(3);
  };

  const workerCost = selectedWorker?.defaultCompensation ?? 0;
  const participantTotal = participants * 30;
  const servicesTotal = additionalServices.reduce((sum, serviceId) => {
    const service = ADDITIONAL_SERVICES.find((item) => item.id === serviceId);
    return sum + (service?.price || 0);
  }, 0);
  const calculateTotal = () => participantTotal + workerCost + servicesTotal;

  const toggleService = (serviceId: string) => {
    setAdditionalServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  };

  const handleBooking = async () => {
    if (!user || !selectedWorker) return;
    setLoading(true);
    try {
      const eventData = {
        clientId: user.uid,
        workerId: selectedWorker.uid,
        date,
        city,
        participantCount: participants,
        status: 'pending',
        totalAmount: calculateTotal(),
        paidAmount: 0,
        additionalServices,
      };
      await api.post('/events', eventData);
      setStep(4); // Confirmation/Payment step
    } catch (error) {
      console.error('Error creating event:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-red-600">Reserve your Sushiparty</h2>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="block text-sm font-medium text-gray-700">City</p>
            <p className="text-lg font-semibold mt-1">{city || 'No city set'}</p>
          </div>
          {city && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date & View Available Workers</label>
              <WorkerCalendar
                key={refreshKey}
                city={city}
                onDateSelect={handleDateSelect}
                onWorkerSelect={handleWorkerSelect}
                selectedDate={date}
                clientEvents={clientEvents}
                reservationDelayDays={config.reservationDelayDays}
                onMobileProceed={() => setStep(2)}
              />
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Workers in {city} for {date}</h3>
          {workers.length === 0 ? (
            <p>No workers available for this date/location.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {workers.map(worker => (
                <div
                  key={worker.uid}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-red-200 transition flex flex-col"
                >
                  {worker.photoURL && (
                    <img
                      src={worker.photoURL.replace('localhost', window.location.hostname)}
                      alt={worker.displayName}
                      className="w-full h-48 object-cover rounded-md mb-3"
                    />
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-gray-800 text-lg">{worker.displayName}</p>
                    {worker.city && (
                      <p className="text-sm text-gray-500">{worker.city}</p>
                    )}
                    {typeof worker.defaultCompensation === 'number' && (
                      <p className="text-sm text-gray-600">€{worker.defaultCompensation} default compensation</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleWorkerSelect(worker, date)}
                    className="mt-4 w-full py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(1)} className="w-full py-2 border rounded">Back</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Event Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Participants</label>
            <select
              value={participants}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setParticipants(Math.min(config.maxParticipants, Math.max(config.minParticipants, value)));
              }}
              className="w-full mt-1 p-2 border rounded"
            >
              {Array.from({ length: config.maxParticipants - config.minParticipants + 1 }, (_, i) => config.minParticipants + i).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="font-semibold text-gray-800 mb-3">Additional Services</p>
            <div className="space-y-2">
              {ADDITIONAL_SERVICES.map((service) => (
                <label key={service.id} className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={additionalServices.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs text-gray-500">+${service.price}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded space-y-2">
            <p><strong>Worker:</strong> {selectedWorker?.displayName}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Location:</strong> {city}</p>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <p><strong>Participants Cost:</strong> ${participantTotal}</p>
              <p><strong>Worker Cost:</strong> ${workerCost}</p>
              <p><strong>Additional Services:</strong> ${servicesTotal}</p>
              <p className="text-lg font-bold mt-2">Total Estimate: ${calculateTotal()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 py-2 border rounded">Back</button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex-1 py-2 bg-red-600 text-white rounded"
            >
              {loading ? 'Processing...' : 'Proceed to Payment (50%)'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center space-y-4">
          <div className="text-5xl text-green-500">✓</div>
          <h3 className="text-2xl font-bold">Booking Requested!</h3>
          <p>Your reservation is pending. In a real app, you would now complete the Stripe payment of ${(participants * 50) / 2}.</p>
          <button onClick={handleMakeAnotherBooking} className="py-2 px-6 bg-red-600 text-white rounded">Make another booking</button>
        </div>
      )}
    </div>
  );
}
