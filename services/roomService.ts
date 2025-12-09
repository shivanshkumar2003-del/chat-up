
import { db } from "./firebaseConfig";
import { ref, set, update, onValue, push, remove, get, child, onChildAdded } from "firebase/database";
import { UserProfile, Message } from "../types";

export const generateRoomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createRoom = async (user: UserProfile): Promise<string> => {
  const roomId = generateRoomCode();
  const roomRef = ref(db, `rooms/${roomId}`);
  
  await set(roomRef, {
    roomId,
    host: user,
    status: 'waiting',
    createdAt: Date.now()
  });

  return roomId;
};

export const joinRoom = async (roomId: string, user: UserProfile): Promise<boolean> => {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error("Room not found");
  }

  const roomData = snapshot.val();
  if (roomData.status !== 'waiting') {
    throw new Error("Room is full or ended");
  }

  // Add guest to room
  await update(roomRef, {
    guest: user,
    status: 'connected'
  });

  return true;
};

export const listenToRoomStatus = (roomId: string, callback: (status: string, peer?: UserProfile) => void) => {
  const roomRef = ref(db, `rooms/${roomId}`);
  return onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        callback(data.status, data.guest || data.host);
    } else {
        callback('ended');
    }
  });
};

export const sendMessageToRoom = (roomId: string, message: Message) => {
  const msgRef = ref(db, `rooms/${roomId}/messages`);
  push(msgRef, message);
};

export const listenToMessages = (roomId: string, callback: (msgs: Message[]) => void) => {
  const msgRef = ref(db, `rooms/${roomId}/messages`);
  return onValue(msgRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const parsedMessages = Object.values(data) as Message[];
      parsedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      callback(parsedMessages);
    }
  });
};

export const leaveRoom = (roomId: string) => {
    const roomRef = ref(db, `rooms/${roomId}`);
    remove(roomRef);
};

// --- WebRTC Signaling ---

export const sendSignal = (roomId: string, type: 'offer' | 'answer' | 'candidate', data: any, senderRole: 'host' | 'guest') => {
    if (type === 'candidate') {
        const candidatesRef = ref(db, `rooms/${roomId}/candidates/${senderRole}`);
        push(candidatesRef, data);
    } else {
        // Offer/Answer goes to the main signal path
        const signalRef = ref(db, `rooms/${roomId}/signal/${type}`);
        set(signalRef, data);
    }
};

export const listenToSignals = (
    roomId: string, 
    myRole: 'host' | 'guest',
    onOffer: (data: any) => void, 
    onAnswer: (data: any) => void, 
    onCandidate: (data: any) => void
) => {
    const signalRef = ref(db, `rooms/${roomId}/signal`);
    const peerRole = myRole === 'host' ? 'guest' : 'host';
    const candidatesRef = ref(db, `rooms/${roomId}/candidates/${peerRole}`);

    // Listen for Offer/Answer
    const unsubSignal = onValue(signalRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (data.offer && myRole === 'guest') onOffer(data.offer);
            if (data.answer && myRole === 'host') onAnswer(data.answer);
        }
    });

    // Listen for ICE Candidates
    const unsubCandidates = onChildAdded(candidatesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) onCandidate(data);
    });

    return () => {
        unsubSignal();
        unsubCandidates();
    }
};
