import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { QRCodeCanvas } from 'qrcode.react';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SushiEvent } from '../types';

type Reservation = SushiEvent & { eventId: string };

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const events = await api.get(`/events?clientId=${user.uid}`) as Reservation[];
        const activeEvents = (events || []).filter(event => event.status !== 'cancelled');
        setReservations(activeEvents);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user]);

  const generateShareableQRCode = (reservation: Reservation) => {
    // Create a shareable link with reservation details
    // Use the local IP instead of localhost so it's accessible from mobile devices
    const origin = window.location.origin.replace(/localhost|127\.0\.0\.1/, '192.168.1.237');
    return `${origin}/event/${reservation.eventId}`;
  };


  const shareQRCode = async (reservation: Reservation) => {
    const shareUrl = generateShareableQRCode(reservation);
    const shareText = t('dashboard.shareText', { date: reservation.date, count: reservation.participantCount });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Sushi Party Reservation',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert(t('dashboard.copied'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div className="text-center py-8">{t('common.navbar.login')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red-600 mb-2">Sushiparty</h1>
        <p className="text-gray-600">{t('dashboard.welcome', { name: profile?.displayName || 'User' })}</p>
        <p className="text-sm text-gray-500">{t('dashboard.role', { role: profile?.role })}</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('dashboard.loading')}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{t('dashboard.error', { message: error })}</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-700 mb-4">{t('dashboard.noReservations')}</p>
          <a
            href="/reserve"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            {t('dashboard.makeReservation')}
          </a>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('dashboard.title')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <div
                key={reservation.eventId}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                  <p className="text-sm opacity-90">{t('dashboard.reservationId')}</p>
                  <p className="font-mono text-lg font-bold truncate">{reservation.eventId}</p>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('dashboard.date')}:</span>
                      <span className="font-semibold">
                        {new Date(reservation.date).toLocaleDateString(i18n.language === 'it' ? 'it-IT' : 'en-US')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('dashboard.city')}:</span>
                      <span className="font-semibold">{reservation.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('dashboard.participants')}:</span>
                      <span className="font-semibold">{reservation.participantCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('dashboard.totalAmount')}:</span>
                      <span className="font-semibold text-red-600">
                        €{reservation.totalAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('dashboard.status')}:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {t(`dashboard.statuses.${reservation.status}`)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 text-center">
                      {t('dashboard.qrTitle')}
                    </p>
                    <div
                      id={`qr-${reservation.eventId}`}
                      className="flex justify-center bg-gray-50 p-2 rounded"
                    >
                      <a 
                        href={generateShareableQRCode(reservation)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="transition-transform hover:scale-105"
                      >
                        <QRCodeCanvas
                          value={generateShareableQRCode(reservation)}
                          size={150}
                          level="H"
                          includeMargin={true}
                          fgColor="#1f2937"
                          bgColor="#ffffff"
                        />
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => shareQRCode(reservation)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm font-semibold"
                      title={t('dashboard.share')}
                    >
                      <Share2 size={16} />
                      {t('dashboard.share')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/reserve"
              className="inline-block px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              {t('dashboard.makeAnother')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
