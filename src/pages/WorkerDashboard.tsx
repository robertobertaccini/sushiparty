import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

export default function WorkerDashboard() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');

  useEffect(() => {
    if (!user || profile?.role !== 'worker') return;

    const q = query(collection(db, 'events'), where('workerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [user, profile]);

  useEffect(() => {
    if (!selectedEvent) return;

    const q = query(
      collection(db, `events/${selectedEvent.id}/chat`),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [selectedEvent]);

  const addAvailability = async () => {
    if (!user || !availabilityDate) return;
    const userRef = doc(db, 'users', user.uid);
    const newAvailability = [...(profile?.availability || []), availabilityDate];
    await updateDoc(userRef, { availability: newAvailability });
    setAvailabilityDate('');
  };

  const markCompleted = async (eventId: string) => {
    await updateDoc(doc(db, 'events', eventId), { status: 'completed' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedEvent || !user) return;
    await addDoc(collection(db, `events/${selectedEvent.id}/chat`), {
      senderId: user.uid,
      senderName: profile?.displayName || 'Worker',
      text: newMessage,
      createdAt: serverTimestamp(),
    });
    setNewMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Worker Schedule</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={availabilityDate}
            onChange={(e) => setAvailabilityDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={addAvailability} className="bg-red-600 text-white px-4 rounded">Add Availability</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile?.availability?.map(date => (
            <span key={date} className="bg-gray-200 px-3 py-1 rounded-full text-sm">{date}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Your Events</h3>
          {events.map(event => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 border rounded-lg cursor-pointer transition ${selectedEvent?.id === event.id ? 'border-red-600 ring-1 ring-red-600' : 'bg-white hover:border-gray-400'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{event.city}</p>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded uppercase ${event.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {event.status}
                </span>
              </div>
              {event.status !== 'completed' && (
                <button
                  onClick={(e) => { e.stopPropagation(); markCompleted(event.id); }}
                  className="mt-2 text-xs text-red-600 font-medium hover:underline"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          {selectedEvent ? (
            <div className="bg-white rounded-lg shadow-md h-[500px] flex flex-col">
              <div className="p-4 border-b bg-red-600 text-white rounded-t-lg">
                <h4 className="font-bold">Worker Chat - {selectedEvent.city}</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500">{msg.senderName}</span>
                    <p className={`p-2 rounded-lg max-w-[80%] ${msg.senderId === user?.uid ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border p-2 rounded"
                />
                <button type="submit" className="bg-red-600 text-white px-4 rounded">Send</button>
              </form>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg border-2 border-dashed">
              Select an event to open worker chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
