import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import WorkerCalendar from '../components/WorkerCalendar';
import { ADDITIONAL_SERVICES } from '../lib/constants';
import type { UserProfile, SushiEvent } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation, Trans } from 'react-i18next';

export default function Reservation() {
  const { t } = useTranslation();
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
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardInfo, setCardInfo] = useState({ number: '4242 4242 4242 4242', expiry: '12/25', cvc: '123' });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);



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
      const response = await api.post('/events', eventData) as { eventId: string };
      setCreatedEventId(response.eventId);
      setStep(4); // Payment step
    } catch (error) {
      console.error('Error creating event:', error);
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!createdEventId) return;
    setPaymentLoading(true);
    try {
      const depositAmount = calculateTotal() / 2;
      const response = await api.post('/payment', {
        eventId: createdEventId,
        amount: depositAmount,
      }) as { success: boolean };

      if (response.success) {
        setStep(5);
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
    setPaymentLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-red-600">{t('reservation.title')}</h2>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="block text-sm font-medium text-gray-700">{t('reservation.step1.city')}</p>
            <p className="text-lg font-semibold mt-1">{city || t('reservation.step1.noCity')}</p>
          </div>
          {city && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('reservation.step1.selectDate')}</label>
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
          <h3 className="text-xl font-semibold">{t('reservation.step2.title', { city, date })}</h3>
          {workers.length === 0 ? (
            <p>{t('reservation.step2.noWorkers')}</p>
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
                      <p className="text-sm text-gray-600">{t('reservation.step2.compensation', { amount: worker.defaultCompensation })}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleWorkerSelect(worker, date)}
                    className="mt-4 w-full py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
                  >
                    {t('reservation.step2.select')}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(1)} className="w-full py-2 border rounded">{t('common.back')}</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{t('reservation.step3.title')}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('reservation.step3.participants')}</label>
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
            <p className="font-semibold text-gray-800 mb-3">{t('reservation.step3.additionalServices')}</p>
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
            <p><strong>{t('reservation.step3.summary.worker')}:</strong> {selectedWorker?.displayName}</p>
            <p><strong>{t('reservation.step3.summary.date')}:</strong> {date}</p>
            <p><strong>{t('reservation.step3.summary.location')}:</strong> {city}</p>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <p><strong>{t('reservation.step3.summary.participantsCost')}:</strong> €{participantTotal}</p>
              <p><strong>{t('reservation.step3.summary.workerCost')}:</strong> €{workerCost}</p>
              <p><strong>{t('reservation.step3.summary.additionalServices')}:</strong> €{servicesTotal}</p>
              <p className="text-lg font-bold mt-2">{t('reservation.step3.summary.totalEstimate')}: €{calculateTotal()}</p>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                <Trans i18nKey="reservation.step3.privacy" values={{ name: selectedWorker?.displayName }}>
                  I understand and agree that my contact number will be shared with the sushiman (<strong>{selectedWorker?.displayName}</strong>) to coordinate the party setup at my location.
                </Trans>
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 py-2 border rounded hover:bg-gray-50 transition">{t('common.back')}</button>
            <button
              onClick={handleBooking}
              disabled={loading || !privacyAccepted}
              className={`flex-1 py-2 text-white rounded transition ${
                !privacyAccepted ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? t('reservation.step3.processing') : t('reservation.step3.proceed')}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800">{t('reservation.step4.title')}</h3>
            <p className="text-gray-600 mt-2">{t('reservation.step4.desc')}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-600">{t('reservation.step4.totalAmount')}:</span>
              <span className="font-bold">€{calculateTotal()}</span>
            </div>
            <div className="flex justify-between items-center text-xl text-red-600 font-bold border-t pt-4">
              <span>{t('reservation.step4.depositToPay')}:</span>
              <span>€{calculateTotal() / 2}</span>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <Trans i18nKey="reservation.step4.remainingBalance" values={{ amount: calculateTotal() / 2, date }}>
                Remaining balance of <strong>€{calculateTotal() / 2}</strong> to be paid on <strong>{date}</strong>.
              </Trans>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservation.step4.cardNumber')}</label>
              <input
                type="text"
                value={cardInfo.number}
                onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                placeholder="0000 0000 0000 0000"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservation.step4.expiryDate')}</label>
                <input
                  type="text"
                  value={cardInfo.expiry}
                  onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                  placeholder="MM/YY"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('reservation.step4.cvc')}</label>
                <input
                  type="text"
                  value={cardInfo.cvc}
                  onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                  placeholder="123"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className="w-full py-4 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg flex items-center justify-center gap-2"
          >
            {paymentLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('reservation.step4.processing')}
              </>
            ) : (
              t('reservation.step4.payNow', { amount: calculateTotal() / 2 })
            )}
          </button>
          
          <p className="text-center text-xs text-gray-500">
            {t('reservation.step4.secureNotice')}
          </p>
        </div>
      )}

      {step === 5 && (
        <div className="text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-5xl">
            ✓
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900">{t('reservation.step5.title')}</h3>
            <p className="text-gray-600">{t('reservation.step5.desc')}</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left space-y-3">
            <div className="border-b pb-2 mb-2">
              <p className="text-sm text-gray-500">{t('reservation.step5.detailsTitle')}</p>
              <p><strong>{t('reservation.step5.bookingId')}:</strong> {createdEventId}</p>
              <p><strong>{t('reservation.step5.date')}:</strong> {date}</p>
              <p><strong>{t('reservation.step5.worker')}:</strong> {selectedWorker?.displayName}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>{t('reservation.step5.totalAmount')}:</span>
                <span>€{calculateTotal()}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>{t('reservation.step5.depositPaid')}:</span>
                <span>-€{calculateTotal() / 2}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 font-bold text-lg text-red-600">
                <span>{t('reservation.step5.remainingBalance')}:</span>
                <span>€{calculateTotal() / 2}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <Trans i18nKey="reservation.step5.balanceNotice" values={{ date }}>
                  * The remaining balance is due in person on <strong>{date}</strong>.
                </Trans>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <p className="font-bold text-gray-800">{t('reservation.step5.qrTitle')}</p>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              {(() => {
                const qrUrl = `${window.location.origin.replace(/localhost|127\.0\.0\.1/, '192.168.1.237')}/event/${createdEventId}`;
                return (
                  <a 
                    href={qrUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-105"
                  >
                    <QRCodeCanvas
                      value={qrUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </a>
                );
              })()}
            </div>
            <p className="text-sm text-gray-500 italic">
              {t('reservation.step5.qrNotice')}
            </p>
          </div>

          <button 
            onClick={handleMakeAnotherBooking} 
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            {t('reservation.step5.anotherBooking')}
          </button>
        </div>
      )}
    </div>
  );
}
