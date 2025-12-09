
import React, { useEffect, useRef, useState } from 'react';
import { UserProfile, Message } from '../types';
import { ToastType } from './Toast';
import { Send, Video, Mic, StopCircle, MicOff, VideoOff, Copy } from 'lucide-react';
import { listenToRoomStatus, sendMessageToRoom, listenToMessages, leaveRoom, sendSignal, listenToSignals } from '../services/roomService';

interface Props {
  user: UserProfile;
  roomId: string;
  isHost: boolean;
  onEndChat: (earned: boolean) => void;
  addToast: (msg: string, type: ToastType) => void;
}

const SERVERS = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
};

export const ChatInterface: React.FC<Props> = ({ user, roomId, isHost, onEndChat, addToast }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [status, setStatus] = useState<'waiting' | 'connected' | 'ended'>('waiting');
  const [peerName, setPeerName] = useState('Waiting...');
  
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteStreamActive, setRemoteStreamActive] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const candidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const [timer, setTimer] = useState(0);

  const myRole = isHost ? 'host' : 'guest';

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === 'connected') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // 1. Initialize Media & Firebase Status Listeners
  useEffect(() => {
    const init = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.current = stream;
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                // Important: Mute local video to prevent feedback/echo
                localVideoRef.current.muted = true;
            }
        } catch (err) {
            console.error(err);
            addToast("Camera/Mic access denied. Video will not work.", "error");
        }
    };
    
    init();

    // Listen to Status
    const unsubscribeStatus = listenToRoomStatus(roomId, (newStatus: any, peer: any) => {
        if (newStatus === 'ended') {
            addToast("Chat ended by peer.", 'info');
            handleCleanup();
            onEndChat(false);
            return;
        }
        
        setStatus(newStatus);
        
        if (newStatus === 'connected') {
             if (peer && peer.name !== user.name) {
                 setPeerName(peer.name);
             } else {
                 setPeerName(isHost ? "Guest" : "Host");
             }
        }
    });

    // Listen to Messages
    const unsubscribeMessages = listenToMessages(roomId, (msgs) => {
        setMessages(msgs);
    });

    return () => {
        unsubscribeStatus();
        unsubscribeMessages();
        handleCleanup();
    };
  }, []);

  // 2. WebRTC Logic - Triggers when Connected
  useEffect(() => {
    if (status === 'connected' && localStream.current) {
        setupWebRTC();
    }
  }, [status, localStream.current]); // Added dependency to ensure stream exists

  const processCandidateQueue = async () => {
      const pc = peerConnection.current;
      if (!pc || !pc.remoteDescription) return;
      
      while (candidateQueue.current.length > 0) {
          const candidate = candidateQueue.current.shift();
          if (candidate) {
              try {
                  await pc.addIceCandidate(candidate);
                  console.log("Buffered candidate added");
              } catch (e) {
                  console.error("Error adding buffered candidate", e);
              }
          }
      }
  };

  const setupWebRTC = async () => {
    if (peerConnection.current) return; // Already setup

    console.log("Setting up WebRTC connection...");
    const pc = new RTCPeerConnection(SERVERS);
    peerConnection.current = pc;

    // Add local tracks to PC
    localStream.current?.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current!);
    });

    // Handle Remote Stream
    pc.ontrack = (event) => {
        console.log("Remote track received", event.streams);
        if (event.streams && event.streams[0]) {
             if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setRemoteStreamActive(true);
            }
        }
    };

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignal(roomId, 'candidate', JSON.stringify(event.candidate), myRole);
        }
    };

    // Listen for Signals
    listenToSignals(roomId, myRole, 
        async (offerStr) => {
             // Got Offer (Guest only)
             if (!pc.currentRemoteDescription) {
                 console.log("Received Offer");
                 const offer = JSON.parse(offerStr);
                 await pc.setRemoteDescription(offer);
                 
                 // Process any candidates waiting for this description
                 await processCandidateQueue();

                 const answer = await pc.createAnswer();
                 await pc.setLocalDescription(answer);
                 sendSignal(roomId, 'answer', JSON.stringify(answer), myRole);
             }
        },
        async (answerStr) => {
             // Got Answer (Host only)
             if (!pc.currentRemoteDescription) {
                 console.log("Received Answer");
                 const answer = JSON.parse(answerStr);
                 await pc.setRemoteDescription(answer);
                 
                 // Process any candidates waiting for this description
                 await processCandidateQueue();
             }
        },
        async (candidateStr) => {
             // Got Candidate
             try {
                const candidate = JSON.parse(candidateStr);
                if (pc.remoteDescription) {
                    await pc.addIceCandidate(candidate);
                } else {
                    console.log("Buffering candidate (no remote description yet)");
                    candidateQueue.current.push(candidate);
                }
             } catch (e) { console.error("Error adding candidate", e); }
        }
    );

    // If Host, Create Offer
    if (isHost) {
        console.log("Creating Offer...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal(roomId, 'offer', JSON.stringify(offer), myRole);
    }
  };

  const handleCleanup = () => {
      localStream.current?.getTracks().forEach(t => t.stop());
      if (peerConnection.current) {
          peerConnection.current.close();
          peerConnection.current = null;
      }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      sender: user.name as any, 
      text: inputText,
      timestamp: new Date()
    };
    
    sendMessageToRoom(roomId, msg);
    setInputText('');
  };

  const handleEnd = () => {
    leaveRoom(roomId);
    handleCleanup();
    onEndChat(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    addToast("Room code copied!", 'success');
  };

  const toggleMic = () => {
      if (localStream.current) {
          localStream.current.getAudioTracks().forEach(t => t.enabled = !micOn);
          setMicOn(!micOn);
      }
  }

  const toggleCam = () => {
      if (localStream.current) {
          localStream.current.getVideoTracks().forEach(t => t.enabled = !camOn);
          setCamOn(!camOn);
      }
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-green-50 relative z-20">
      
      {/* Left: Video Feeds */}
      <div className="w-full md:w-2/3 flex flex-col p-4 gap-4">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center gap-4">
                 <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-mono text-xl tracking-widest font-bold flex items-center gap-2">
                    {roomId}
                    <button onClick={copyCode} className="text-gray-400 hover:text-white"><Copy size={14}/></button>
                 </div>
                 <div className="h-6 w-px bg-gray-200"></div>
                 <div className="flex items-center gap-2">
                    {status === 'connected' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                    <span className="font-mono text-gray-600 font-bold">{formatTime(timer)}</span>
                 </div>
             </div>
             
             <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                {status === 'waiting' ? 'WAITING FOR FRIEND...' : 'LIVE CONNECTION'}
             </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
            {/* Peer Video */}
            <div className="flex-1 relative bg-gray-100 rounded-2xl shadow-inner border border-gray-200 overflow-hidden group">
                 {status === 'waiting' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/10 backdrop-blur-sm z-10">
                        <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center animate-pulse">
                            <h3 className="font-bold text-gray-800 text-lg">Waiting for Peer...</h3>
                            <p className="text-gray-500 text-sm">Share code: <span className="font-mono font-bold">{roomId}</span></p>
                        </div>
                    </div>
                 )}
                 
                 <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
                     {!remoteStreamActive && status === 'connected' && (
                         <div className="absolute z-10 text-white/50 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            Connecting Video...
                         </div>
                     )}
                     <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                     
                     <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-gray-800 text-sm font-bold shadow-lg flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                        {peerName}
                     </div>
                 </div>
            </div>

            {/* User Video */}
            <div className="flex-1 relative bg-gray-100 rounded-2xl shadow-inner border border-gray-200 overflow-hidden">
                 <div className="relative w-full h-full bg-gray-900">
                     {!camOn && (
                         <div className="absolute inset-0 flex items-center justify-center text-white/30">
                             <VideoOff size={48} />
                         </div>
                     )}
                     <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform scale-x-[-1] ${!camOn ? 'hidden' : ''}`} />
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-gray-800 text-sm font-bold shadow-lg">
                        You
                     </div>
                 </div>
            </div>
        </div>

        {/* Controls */}
        <div className="h-24 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between px-8">
            <div className="flex gap-4">
                <button onClick={toggleMic} className={`p-4 rounded-full transition shadow-sm border ${micOn ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                    {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button onClick={toggleCam} className={`p-4 rounded-full transition shadow-sm border ${camOn ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                     {camOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={handleEnd}
                    className="px-8 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-red-500/30 transition transform hover:scale-105 active:scale-95"
                >
                    <StopCircle size={24} className="fill-current" /> END CALL
                </button>
            </div>
        </div>
      </div>

      {/* Right: Chat Column */}
      <div className="w-full md:w-1/3 bg-white flex flex-col h-full border-l border-green-100 shadow-xl z-30">
          <div className="p-4 border-b border-gray-100 bg-white shadow-sm z-10">
              <h3 className="font-black text-gray-800 text-lg">Realtime Chat</h3>
              <p className="text-xs text-green-600 font-bold">Encrypted via Firebase</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide">
              {messages.map((msg: any) => {
                  const isMe = msg.sender === user.name;
                  return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${isMe ? 'bg-green-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                              <span className="block text-[10px] opacity-70 mb-1 font-bold uppercase">{isMe ? 'You' : msg.sender}</span>
                              {msg.text}
                          </div>
                      </div>
                  )
              })}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
              <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-gray-50 border-gray-200 border rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-700"
                  />
                  <button type="submit" className="absolute right-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                      <Send size={18} />
                  </button>
              </div>
          </form>
      </div>
    </div>
  );
};
