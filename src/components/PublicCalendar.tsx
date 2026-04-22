import { useState, useEffect } from 'react';
import { format, getDay, getDaysInMonth, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import type { UserProfile } from '../types';

interface CalendarDay {
  date: string;
  dayNumber: number;
  workers: UserProfile[];
  isCurrentMonth: boolean;
}

interface PublicCalendarProps {
  city: string;
}

export default function PublicCalendar({ city }: PublicCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workerAvailability, setWorkerAvailability] = useState<{
    [date: string]: UserProfile[];
  }>({});

  // Fetch workers for the current month/city
  useEffect(() => {
    if (!city) return;

    const fetchWorkerAvailability = async () => {
      setLoading(true);
      setSelectedDate(null); // Reset selected date when city changes
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

  // Generate calendar days
  useEffect(() => {
    const firstDay = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const startingDayOfWeek = getDay(firstDay);

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
      });
    }

    setCalendarDays(days);
  }, [currentMonth, workerAvailability]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg border overflow-hidden" style={{ minHeight: '400px' }}>
      {/* Calendar Section */}
      <div className="flex-1 flex flex-col md:border-r">
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
                const isAvailable = day.workers.length > 0;
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (day.isCurrentMonth && isAvailable) {
                        setSelectedDate(day.date);
                      }
                    }}
                    disabled={!day.isCurrentMonth || !isAvailable}
                    className={`aspect-square p-1 rounded-lg text-sm font-medium transition relative ${
                      !day.isCurrentMonth
                        ? 'text-gray-300'
                        : isAvailable
                        ? selectedDate === day.date
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-50 hover:bg-red-50 border border-red-200 cursor-pointer'
                        : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    <div>{day.dayNumber}</div>
                    {day.workers.length > 0 && (
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

      {/* Info Panel */}
      <div className="w-full md:w-64 bg-gray-50 flex flex-col">
        {selectedDate ? (
          <div className="flex items-center justify-center h-full p-6 text-center">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100">
              <p className="text-lg font-bold text-gray-800 mb-2">
                {format(new Date(selectedDate), 'MMM dd, yyyy')}
              </p>
              <p className="text-red-600 font-medium text-lg">
                {(workerAvailability[selectedDate] || []).length} SushiMan available in {city} for this day
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 p-6 text-center">
            <p className="text-sm">Select an available date to see how many SushiMan are ready in your city!</p>
          </div>
        )}
      </div>
    </div>
  );
}
