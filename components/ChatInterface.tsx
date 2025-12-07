import React, { useEffect, useRef, useState } from 'react';
import { UserProfile, Message, UserRole } from '../types';
import { ChatBackend, ConnectionStatus } from '../services/backend';
import { ToastType } from './Toast';
import { Send, Video, Mic, StopCircle, AlertCircle, Award, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  user: UserProfile;
  onEndChat: (earned: boolean) => void;
  addToast: (msg: string, type: ToastType) => void;
}

export const ChatInterface: React.FC<Props> = ({ user, onEndChat, addToast }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Connection State
  const [status, setStatus] = useState<ConnectionStatus>('IDLE');
  const [peerName, setPeerName] = useState('Anonymous');
  const [isTyping, setIsTyping] = useState(false);
  
  // Backend Reference
  const backendRef = useRef<ChatBackend | null>(null);
  
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [timer, setTimer] = useState(0);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === 'CONNECTED') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Initialize Media (Webcam)
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        addToast("Camera access is required for video matching.", "error");
      }
    };
    startVideo();

    return () => {
        if (userVideoRef.current && userVideoRef.current.srcObject) {
            const stream = userVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [addToast]);

  // Initialize Backend Connection
  useEffect(() => {
    const startBackend = () => {
        // Instantiate the "Backend" service
        backendRef.current = new ChatBackend(user, {
            onStatusChange: (newStatus) => {
              setStatus(newStatus);
              if (newStatus === 'CONNECTED') {
                addToast("Encrypted connection established.", "success");
              } else if (newStatus === 'DISCONNECTED') {
                addToast("Connection lost. Trying to reconnect...", "error");
              }
            },
            onMessage: (msg) => setMessages(prev => [...prev, msg]),
            onPeerTyping: (typing) => setIsTyping(typing),
            onPeerFound: (name) => setPeerName(name)
        });

        backendRef.current.startSearch();
    };

    startBackend();

    return () => {
        backendRef.current?.disconnect();
    };
  }, [user, addToast]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || status !== 'CONNECTED') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    // Send to backend
    backendRef.current?.sendMessage(userMsg.text);
  };

  const handleSkip = () => {
    // If listener, no coins if skipped early (e.g., < 30 seconds)
    const earned = user.role === UserRole.LISTENER && timer > 30;
    if (user.role === UserRole.LISTENER && !earned) {
      addToast("Session too short to earn coins.", "info");
    }
    onEndChat(earned);
  };

  const handleReport = () => {
    addToast("User reported. Our safety team will review the logs.", "error");
    // In a real app, this would send a flag to the server
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to render the overlay content based on connection status
  const renderVideoOverlay = () => {
    switch (status) {
        case 'SEARCHING':
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/10 backdrop-blur-sm z-10 transition-all">
                    <div className="bg-white/90 p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <RefreshCw className="w-10 h-10 text-green-500 animate-spin mb-3" />
                        <h3 className="font-bold text-gray-800 text-lg">Finding a Match...</h3>
                        <p className="text-gray-500 text-sm">Searching for similar peers</p>
                    </div>
                </div>
            );
        case 'MATCHED':
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/20 backdrop-blur-sm z-10">
                     <div className="bg-white/95 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce-in">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <Wifi size={32} />
                        </div>
                        <h3 className="font-black text-2xl text-gray-800">Match Found!</h3>
                        <p className="text-green-600 font-bold text-lg mt-1">Connecting to {peerName}...</p>
                    </div>
                </div>
            );
        case 'DISCONNECTED':
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10">
                    <div className="text-center text-white">
                         <WifiOff size={48} className="mx-auto mb-4 opacity-50" />
                         <p>Connection Lost</p>
                    </div>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-green-50 relative z-20">
      
      {/* Left: Video Feeds */}
      <div className="w-full md:w-2/3 flex flex-col p-4 gap-4">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center gap-2">
                 {status === 'CONNECTED' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                 <span className="font-mono text-gray-600 font-bold">{formatTime(timer)}</span>
                 <span className="text-gray-300 mx-2">|</span>
                 <span className="text-gray-500 text-sm font-bold tracking-wide">MENTAL HEALTH CHAT UP</span>
             </div>
             <div className="flex gap-2">
                 <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                    Role: {user.role === UserRole.SPEAKER ? 'Speaker' : 'Listener'}
                 </div>
             </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
            {/* Peer Video */}
            <div className="flex-1 relative bg-gray-100 rounded-2xl shadow-inner border border-gray-200 overflow-hidden group">
                 {renderVideoOverlay()}
                 
                 <div className="relative w-full h-full bg-gray-800">
                     {/* Static Peer Image / Avatar */}
                     <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${peerName}&backgroundColor=c0ebcf`}
                        className="w-full h-full object-cover opacity-90 transition-opacity duration-500" 
                        alt="Peer" 
                     />
                     <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-gray-800 text-sm font-bold shadow-lg flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                        {peerName}
                     </div>
                 </div>
            </div>

            {/* User Video */}
            <div className="flex-1 relative bg-gray-100 rounded-2xl shadow-inner border border-gray-200 overflow-hidden">
                 <div className="relative w-full h-full bg-gray-900">
                     <video 
                        ref={userVideoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                     />
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-gray-800 text-sm font-bold shadow-lg">
                        You
                     </div>
                 </div>
            </div>
        </div>

        {/* Controls */}
        <div className="h-24 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between px-8">
            <div className="flex gap-4">
                <button className="p-4 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition shadow-sm border border-gray-100"><Mic size={24} /></button>
                <button className="p-4 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition shadow-sm border border-gray-100"><Video size={24} /></button>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={handleSkip}
                    className="px-8 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-red-500/30 transition transform hover:scale-105 active:scale-95"
                >
                    <StopCircle size={24} className="fill-current" /> END CALL
                </button>
            </div>
        </div>
      </div>

      {/* Right: Chat Column */}
      <div className="w-full md:w-1/3 bg-white flex flex-col h-full border-l border-green-100 shadow-xl z-30">
          
          <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm z-10">
              <div>
                  <h3 className="font-black text-gray-800 text-lg">Live Chat</h3>
                  {status === 'CONNECTED' ? (
                     <p className="text-xs text-green-600 flex items-center gap-1 font-bold mt-0.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
                        Encrypted Connection
                     </p>
                  ) : (
                     <p className="text-xs text-yellow-500 flex items-center gap-1 font-bold mt-0.5">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span> 
                        {status === 'SEARCHING' ? 'Searching...' : 'Offline'}
                     </p>
                  )}
              </div>
              {user.role === UserRole.LISTENER && (
                  <div className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 shadow-sm">
                      <Award size={14} /> +Coins Active
                  </div>
              )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide">
              {status !== 'CONNECTED' && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 opacity-50">
                      <p className="text-sm font-medium">Waiting to connect...</p>
                  </div>
              )}
              {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                  >
                      <div className={`
                        max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm font-medium
                        ${msg.sender === 'user' 
                            ? 'bg-green-500 text-white rounded-br-none' 
                            : msg.sender === 'system'
                                ? 'bg-red-50 text-red-500 w-full text-center'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'}
                      `}>
                          {msg.text}
                      </div>
                  </div>
              ))}
              {isTyping && (
                  <div className="flex justify-start animate-pulse">
                      <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 border border-gray-100">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
              <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={status === 'CONNECTED' ? "Type a message..." : "Connecting..."}
                    disabled={status !== 'CONNECTED'}
                    className="w-full bg-gray-50 border-gray-200 border rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all disabled:opacity-50 disabled:bg-gray-100 font-medium text-gray-700 placeholder-gray-400"
                  />
                  <button 
                    type="submit" 
                    disabled={status !== 'CONNECTED' || !inputText.trim()}
                    className="absolute right-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors shadow-sm"
                  >
                      <Send size={18} />
                  </button>
              </div>
              <div className="text-center mt-3">
                 <button 
                    type="button" 
                    onClick={handleReport}
                    className="text-[10px] uppercase font-bold text-gray-300 hover:text-red-500 flex items-center justify-center gap-1 mx-auto transition-colors"
                 >
                    <AlertCircle size={10} /> Report User
                 </button>
              </div>
          </form>
      </div>
    </div>
  );
};