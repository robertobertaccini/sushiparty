import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

export default function EventDetails() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      const docSnap = await getDoc(doc(db, 'events', eventId));
      if (docSnap.exists()) {
        setEvent(docSnap.data());
      }
    };

    const q = query(collection(db, `events/${eventId}/submissions`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    fetchEvent();
    return unsubscribe;
  }, [eventId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !eventId || !user) return;
    setUploading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `events/${eventId}/${user.uid}_${Date.now()}`);

    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, `events/${eventId}/submissions`), {
        participantId: user.uid,
        participantName: user.displayName,
        photoURL: url,
        votes: [],
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
    setUploading(false);
  };

  const handleVote = async (photoId: string) => {
    if (!user || !eventId) return;
    const photoRef = doc(db, `events/${eventId}/submissions`, photoId);
    await updateDoc(photoRef, {
      votes: arrayUnion(user.uid)
    });
  };

  if (!event) return <div>Loading event...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-600">
        <h2 className="text-2xl font-bold">Sushiparty: {event.city}</h2>
        <p className="text-gray-600">{event.date}</p>
        <p className="mt-2 font-semibold">Status: <span className="uppercase text-red-600">{event.status}</span></p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Sushi Roll Competition 🍣</h3>
        <p className="text-gray-600">Upload your masterpiece and vote for the best!</p>

        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition">
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden border">
              <img src={photo.photoURL} alt="Sushi Roll" className="w-full h-48 object-cover" />
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">By {photo.participantName || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">{photo.votes.length} votes</p>
                </div>
                <button
                  onClick={() => handleVote(photo.id)}
                  disabled={photo.votes.includes(user?.uid)}
                  className="p-2 rounded-full hover:bg-red-50 text-red-600 disabled:text-gray-300"
                >
                  ❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
