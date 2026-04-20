import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import ProfileCard from '../components/ProfileCard';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function WorkerDashboard() {
  const { user, profile, login } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchEvents = async () => {
    if (!user || profile?.role !== 'worker') return;
    try {
      const data = await api.get(`/events?workerId=${user.uid}`);
      setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (eventId: string) => {
    try {
      const data = await api.get(`/messages/${eventId}`);
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user, profile]);

  useEffect(() => {
    if (!selectedEvent) return;
    fetchMessages(selectedEvent.eventId);
  }, [selectedEvent]);

  const toggleAvailability = async (dateStr: string) => {
    if (!user) return;
    const currentAvailability = profile?.availability || [];
    
    let newAvailability;
    if (currentAvailability.includes(dateStr)) {
      newAvailability = currentAvailability.filter((d: string) => d !== dateStr);
    } else {
      newAvailability = [...currentAvailability, dateStr];
    }
    
    // Optimistic UI update locally
    const updatedProfile = { ...profile, availability: newAvailability };
    login(updatedProfile); 
    
    try {
      await api.put(`/users/${user.uid}`, { availability: newAvailability });
    } catch (e) {
      console.error("Failed to update availability", e);
      alert("Failed to update availability");
      // Revert in case of failure (lazy implementation, just refresh or let user handle)
    }
  };

  const markCompleted = async (eventId: string) => {
    try {
      await api.put(`/events/${eventId}`, { status: 'completed' });
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedEvent || !user) return;
    try {
      await api.post('/messages', {
        eventId: selectedEvent.eventId,
        senderId: user.uid,
        senderName: profile?.displayName || 'Worker',
        text: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedEvent.eventId);
    } catch (e) {
      console.error(e);
    }
  };

  // Calendar rendering logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const dateFormat = "yyyy-MM-dd";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <ProfileCard 
        profile={profile} 
        onProfileUpdate={(updatedProfile) => login(updatedProfile)}
      />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Worker Schedule</h2>
        
        {/* Calendar Control */}
        <div className="max-w-md mx-auto border rounded-lg overflow-hidden shadow-sm">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-200 rounded">
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-bold text-lg">{format(currentMonth, "MMMM yyyy")}</h3>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-200 rounded">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs font-semibold bg-gray-50">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {days.map((day, i) => {
              const formattedDate = format(day, dateFormat);
              const isSelected = profile?.availability?.includes(formattedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              
              return (
                <div 
                  key={formattedDate + i} 
                  onClick={() => isCurrentMonth && toggleAvailability(formattedDate)}
                  className={`min-h-[60px] p-2 bg-white flex flex-col justify-between transition-colors ${isCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : 'text-gray-300'} ${isSelected ? 'bg-red-50 hover:bg-red-100' : ''}`}
                >
                  <span className={`text-sm font-medium ${!isCurrentMonth ? 'opacity-50' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {isSelected && (
                    <div className="w-full h-1.5 bg-red-600 rounded-full mt-1"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">Click a day to toggle your availability</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Your Events</h3>
          {events.map(event => (
            <div
              key={event.eventId}
              onClick={() => setSelectedEvent(event)}
              className={`p-4 border rounded-lg cursor-pointer transition ${selectedEvent?.eventId === event.eventId ? 'border-red-600 ring-1 ring-red-600' : 'bg-white hover:border-gray-400'}`}
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
                  onClick={(e) => { e.stopPropagation(); markCompleted(event.eventId); }}
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
                  <div key={msg.messageId} className={`flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
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