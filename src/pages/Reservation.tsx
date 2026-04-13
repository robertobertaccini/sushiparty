import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import type { UserProfile } from '../types';

export default function Reservation() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<UserProfile | null>(null);
  const [participants, setParticipants] = useState(2);
  const [loading, setLoading] = useState(false);

  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];

  const searchWorkers = async () => {
    setLoading(true);
    try {
      const workerList = await api.get(`/users?role=worker&city=${encodeURIComponent(city)}`);

      const availableWorkers = workerList.filter((data: UserProfile) => {
        return data.availability?.includes(date);
      });

      setWorkers(availableWorkers);
      setStep(2);
    } catch (error) {
      console.error('Error searching workers:', error);
    }
    setLoading(false);
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
        totalAmount: participants * 50, // Dummy price calculation
        paidAmount: 0,
        additionalServices: [],
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
            <label className="block text-sm font-medium text-gray-700">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="">Select a city</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <button
            onClick={searchWorkers}
            disabled={!city || !date || loading}
            className="w-full py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Find Workers'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Workers in {city}</h3>
          {workers.length === 0 ? (
            <p>No workers available for this date/location.</p>
          ) : (
            <div className="grid gap-4">
              {workers.map(worker => (
                <div
                  key={worker.uid}
                  onClick={() => setSelectedWorker(worker)}
                  className={`p-4 border rounded cursor-pointer transition ${selectedWorker?.uid === worker.uid ? 'border-red-600 bg-red-50' : 'hover:border-gray-400'}`}
                >
                  <p className="font-bold">{worker.displayName}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 py-2 border rounded">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedWorker}
              className="flex-1 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Event Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Participants</label>
            <input
              type="number"
              min="2"
              value={participants}
              onChange={(e) => setParticipants(parseInt(e.target.value))}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p><strong>Worker:</strong> {selectedWorker?.displayName}</p>
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Location:</strong> {city}</p>
            <p className="text-lg font-bold mt-2">Total Estimate: ${participants * 50}</p>
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
          <button onClick={() => setStep(1)} className="py-2 px-6 bg-red-600 text-white rounded">Make another booking</button>
        </div>
      )}
    </div>
  );
}
