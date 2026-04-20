import { useState, useEffect } from 'react';
import { format, getDay, getDaysInMonth, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../lib/api';
import type { UserProfile, SushiEvent } from '../types';

interface CalendarDay {
  date: string;
  dayNumber: number;
  workers: UserProfile[];
  isCurrentMonth: boolean;
  clientEvent?: SushiEvent;
}

interface WorkerCalendarProps {
  city: string;
  onDateSelect: (date: string, workers: UserProfile[]) => void;
  onWorkerSelect: (worker: UserProfile, date: string) => void;
  selectedDate?: string;
  clientEvents?: SushiEvent[];
}

export default function WorkerCalendar({ city, onDateSelect, onWorkerSelect, selectedDate, clientEvents = [] }: WorkerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventModal, setEventModal] = useState<SushiEvent | null>(null);
  const [workerAvailability, setWorkerAvailability] = useState<{
    [date: string]: UserProfile[];
  }>({});

  // Generate calendar days
  useEffect(() => {
    const firstDay = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const startingDayOfWeek = getDay(firstDay);

    const eventsByDate = clientEvents.reduce((acc, event) => {
      acc[event.date] = event;
      return acc;
    }, {} as Record<string, SushiEvent>);

    const days: CalendarDay[] = [];

    // Previous month's days
    const prevMonthDays = startingDayOfWeek;
    const prevMonth = subMonths(currentMonth, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);

    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), dayNum);
      const dateStr = format(date, 'yyyy-MM-dd');
      days.push({
        date: dateStr,
        dayNumber: dayNum,
        workers: workerAvailability[dateStr] || [],
        isCurrentMonth: false,
        clientEvent: eventsByDate[dateStr],
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = format(date, 'yyyy-MM-dd');
      days.push({
        date: dateStr,
        dayNumber: day,
        workers: workerAvailability[dateStr] || [],
        isCurrentMonth: true,
        clientEvent: eventsByDate[dateStr],
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
      const dateStr = format(date, 'yyyy-MM-dd');
      days.push({
        date: dateStr,
        dayNumber: day,
        workers: workerAvailability[dateStr] || [],
        isCurrentMonth: false,
        clientEvent: eventsByDate[dateStr],
      });
    }

    setCalendarDays(days);
  }, [currentMonth, workerAvailability, clientEvents]);

  // Fetch workers for the current month
  useEffect(() => {
    if (!city) return;

    const fetchWorkerAvailability = async () => {
      setLoading(true);
      try {
        const allWorkers = await api.get(`/users?role=worker&city=${encodeURIComponent(city)}`);
        
        const availability: { [date: string]: UserProfile[] } = {};
        allWorkers.forEach((worker: UserProfile) => {
          if (worker.availability && Array.isArray(worker.availability)) {
            worker.availability.forEach((date: string) => {
              if (!availability[date]) {
                availability[date] = [];
              }
              availability[date].push(worker);
            });
          }
        });

        setWorkerAvailability(availability);
      } catch (error) {
        console.error('Error fetching worker availability:', error);
      }
      setLoading(false);
    };

    fetchWorkerAvailability();
  }, [city]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex gap-4 bg-white rounded-lg border overflow-hidden" style={{ minHeight: '500px' }}>
      {/* Calendar Section */}
      <div className="flex-1 flex flex-col border-r">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading && <div className="p-4 text-center text-gray-500">Loading availability...</div>}

        {!loading && (
          <div className="p-4 flex-1 flex flex-col">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayLabels.map(day => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const hasEvent = !!day.clientEvent;
                const isAvailable = !hasEvent && day.workers.length > 0;
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (hasEvent) {
                        setEventModal(day.clientEvent!);
                      } else if (day.isCurrentMonth && isAvailable) {
                        onDateSelect(day.date, day.workers);
                      }
                    }}
                    disabled={!day.isCurrentMonth || (!isAvailable && !hasEvent)}
                    className={`aspect-square p-1 rounded-lg text-sm font-medium transition relative ${
                      !day.isCurrentMonth
                        ? 'text-gray-300'
                        : hasEvent
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 cursor-pointer'
                        : isAvailable
                        ? selectedDate === day.date
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-50 hover:bg-red-50 border border-red-200 cursor-pointer'
                        : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    <div>{day.dayNumber}</div>
                    {!hasEvent && day.workers.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {day.workers.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              selectedDate === day.date ? 'bg-white' : 'bg-red-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Workers Panel */}
      <div className="w-72 bg-gray-50 flex flex-col">
        {selectedDate ? (
          <>
            <div className="p-4 border-b bg-white">
              <p className="text-sm font-semibold text-gray-700">
                {format(new Date(selectedDate), 'MMM dd, yyyy')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(workerAvailability[selectedDate] || []).length} worker{(workerAvailability[selectedDate] || []).length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(workerAvailability[selectedDate] || []).map(worker => (
                <div
                  key={worker.uid}
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:border-red-200 transition flex flex-col"
                >
                  {worker.photoURL && (
                    <img
                      src={worker.photoURL}
                      alt={worker.displayName}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="font-semibold text-gray-800">{worker.displayName}</p>
                    {worker.city && (
                      <p className="text-xs text-gray-500">{worker.city}</p>
                    )}
                    {typeof worker.defaultCompensation === 'number' && (
                      <p className="text-sm text-gray-600">€{worker.defaultCompensation} default compensation</p>
                    )}
                  </div>
                  <button
                    onClick={() => onWorkerSelect(worker, selectedDate)}
                    className="mt-3 w-full py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">Select a date to view available workers</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {eventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl overflow-hidden relative">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Reservation Details</h3>
              <button 
                onClick={() => setEventModal(null)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="font-semibold text-gray-800">{eventModal.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">City:</span>
                <span className="font-semibold text-gray-800">{eventModal.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Participants:</span>
                <span className="font-semibold text-gray-800">{eventModal.participantCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className="font-semibold text-gray-800 capitalize">{eventModal.status}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="font-bold text-lg text-red-600">${eventModal.totalAmount}</span>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setEventModal(null)}
                className="w-full py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
