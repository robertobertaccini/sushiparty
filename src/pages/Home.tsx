import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
// TODO: Fix QRCode import - qrcode.react doesn't provide a default export
// import QRCode from 'qrcode.react';
const QRCode = () => null;
import { Download, Share2 } from 'lucide-react';
import type { SushiEvent } from '../types';

type Reservation = SushiEvent & { eventId: string };

export default function Home() {
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
    return `${window.location.origin}/event/${reservation.eventId}`;
  };

  const downloadQRCode = (reservationId: string) => {
    const qrCodeElement = document.getElementById(`qr-${reservationId}`);
    if (qrCodeElement) {
      const canvas = qrCodeElement.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `reservation-${reservationId}.png`;
        link.click();
      }
    }
  };

  const shareQRCode = async (reservation: Reservation) => {
    const shareUrl = generateShareableQRCode(reservation);
    const shareText = `Check out my Sushi Party reservation! Date: ${reservation.date}, Participants: ${reservation.participantCount}`;

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
      alert('Reservation link copied to clipboard!');
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
    return <div className="text-center py-8">Please log in first</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red-600 mb-2">Sushiparty</h1>
        <p className="text-gray-600">Welcome, {profile?.displayName || 'User'}!</p>
        <p className="text-sm text-gray-500">Role: {profile?.role}</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your reservations...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error: {error}</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-700 mb-4">No reservations yet</p>
          <a
            href="/reserve"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Make a Reservation
          </a>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Reservations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <div
                key={reservation.eventId}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                  <p className="text-sm opacity-90">Reservation ID</p>
                  <p className="font-mono text-lg font-bold truncate">{reservation.eventId}</p>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">
                        {new Date(reservation.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-semibold">{reservation.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-semibold">{reservation.participantCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-red-600">
                        ${reservation.totalAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 text-center">
                      Shareable QR Code
                    </p>
                    <div
                      id={`qr-${reservation.eventId}`}
                      className="flex justify-center bg-gray-50 p-2 rounded"
                    >
                      <QRCode
                        value={generateShareableQRCode(reservation)}
                        size={150}
                        level="H"
                        includeMargin={true}
                        fgColor="#1f2937"
                        bgColor="#ffffff"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => downloadQRCode(reservation.eventId)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-semibold"
                      title="Download QR Code"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={() => shareQRCode(reservation)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm font-semibold"
                      title="Share QR Code"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Reservation Button */}
          <div className="mt-8 text-center">
            <a
              href="/reserve"
              className="inline-block px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Make Another Reservation
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
