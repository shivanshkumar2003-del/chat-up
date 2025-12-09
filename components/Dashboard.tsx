
import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { Play, Coins, User, Users, Activity, LogOut, Share2, X, Globe, Zap, Server, Bot, AlertTriangle, KeyRound, ArrowRight } from 'lucide-react';
import { ToastType } from './Toast';
import { createRoom, joinRoom } from '../services/roomService';

interface Props {
  user: UserProfile;
  onJoinRoom: (roomId: string, isHost: boolean) => void;
  onLogout: () => void;
  addToast: (msg: string, type: ToastType) => void;
}

export const Dashboard: React.FC<Props> = ({ user, onJoinRoom, onLogout, addToast }) => {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        addToast("App link copied to clipboard!", "success");
    }).catch(() => {
        addToast("Failed to copy link.", "error");
    });
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
        const code = await createRoom(user);
        onJoinRoom(code, true); // True = I am host
    } catch (e) {
        console.error(e);
        addToast("Failed to connect to Firebase. Check config.", "error");
    } finally {
        setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (joinCode.length !== 6) {
        addToast("Please enter a valid 6-digit room code.", "error");
        return;
    }
    try {
        await joinRoom(joinCode, user);
        onJoinRoom(joinCode, false); // False = I am guest
    } catch (e: any) {
        addToast(e.message || "Could not join room.", "error");
    }
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setShowStatsModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <X size={20} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Community Stats</h3>
                        <p className="text-xs text-gray-500">Real-time platform activity</p>
                    </div>
                </div>
                {/* Stats content */}
                <p className="text-center text-gray-500">Connecting to real humans server...</p>
            </div>
        </div>
      )}

      <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 ring-1 ring-black/5">
        
        {/* Header (Name Bar) */}
        <div className="bg-white border-b border-gray-100 p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-gray-900">
                Mental Health <span className="text-green-500">Chat Up</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <p className="text-gray-400 font-medium text-sm">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-gray-50 border border-gray-100 py-2 px-4 rounded-xl flex items-center gap-3">
                    <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Credits</span>
                        <span className="text-xl font-black text-gray-800">{user.earnings}</span>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-500">
                        <Coins size={20} className="fill-current" />
                    </div>
                </div>
                
                <button onClick={handleShare} className="p-3 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100">
                  <Share2 size={20} />
                </button>

                <button onClick={onLogout} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                  <LogOut size={20} />
                </button>

                 <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-200">
                    {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <User size={20} />
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-gray-50/50">
            
            {/* User Stat Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-20 h-20 shrink-0 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                             <div className={`w-full h-full flex items-center justify-center ${user.role === UserRole.SPEAKER ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                <User size={32} />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Your Profile Status</h3>
                        <p className="text-gray-500 text-sm max-w-md mt-1">
                            You are currently set as a <strong className="text-gray-800">{user.role}</strong>. 
                        </p>
                    </div>
                </div>
            </div>

            {/* Room Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Create Room */}
                <button 
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="group relative h-full min-h-[220px] bg-white border-2 border-green-500 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-green-50 transition-all overflow-hidden cursor-pointer active:scale-95"
                >
                    <div className="p-5 bg-green-500 text-white rounded-full shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
                        <Users size={40} className="fill-current" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-gray-800 group-hover:text-green-600 transition-colors">CREATE ROOM</h3>
                        <p className="text-gray-500 text-sm mt-1">Generate a code to invite a friend</p>
                        {isCreating && <span className="text-xs text-green-600 font-bold mt-2 block">Connecting...</span>}
                    </div>
                </button>

                {/* Join Room */}
                <div className="h-full min-h-[220px] bg-white border border-gray-200 rounded-2xl flex flex-col p-8 justify-center shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                             <KeyRound size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Join a Friend</h3>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-4">Enter the 6-digit code shared by your friend.</p>
                    
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="123456"
                            maxLength={6}
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="flex-1 bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-center focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <button 
                            onClick={handleJoinRoom}
                            className="bg-gray-900 text-white px-6 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            <ArrowRight />
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
