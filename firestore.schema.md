/*
  Firestore Database Schema (Conceptual)

  users (Collection)
    - uid (Doc ID)
    - email: string
    - role: 'client' | 'worker' | 'admin' | 'participant'
    - displayName: string
    - photoURL: string
    - city: string (optional, for workers)
    - availability: string[] (optional, for workers, list of ISO date strings)

  events (Collection)
    - eventId (Doc ID)
    - clientId: string (UID)
    - workerId: string (UID)
    - date: string (ISO)
    - city: string
    - participantCount: number
    - status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    - totalAmount: number
    - paidAmount: number
    - additionalServices: string[] (IDs)
    - qrCode: string (URL or encoded string)
    - createdAt: timestamp

  services (Collection)
    - serviceId (Doc ID)
    - name: string
    - price: number
    - description: string

  messages (Collection)
    - eventId (Doc ID)
      - chat (Sub-collection)
        - messageId (Doc ID)
        - senderId: string (UID)
        - text: string
        - createdAt: timestamp

  submissions (Collection)
    - eventId (Doc ID)
      - photos (Sub-collection)
        - photoId (Doc ID)
        - participantId: string (UID)
        - photoURL: string
        - votes: string[] (UIDs of voters)
        - specialMention: boolean
        - createdAt: timestamp
*/
