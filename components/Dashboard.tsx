import React from 'react';
import { UserProfile, UserRole } from '../types';
import { Play, Coins, User, Users, Activity, LogOut, Share2 } from 'lucide-react';
import { ToastType } from './Toast';

interface Props {
  user: UserProfile;
  onStartMatch: () => void;
  onLogout: () => void;
  addToast: (msg: string, type: ToastType) => void;
}

export const Dashboard: React.FC<Props> = ({ user, onStartMatch, onLogout, addToast }) => {
  
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        addToast("App link copied to clipboard!", "success");
    }).catch(() => {
        addToast("Failed to copy link.", "error");
    });
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 ring-1 ring-black/5">
        
        {/* Header (Name Bar) - White Background, Green Text */}
        <div className="bg-white border-b border-gray-100 p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-gray-900">
                Mental Health <span className="text-green-500">Chat Up</span>
              </h2>
              <p className="text-gray-400 mt-1 font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Welcome back, {user.name}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-gray-50 border border-gray-100 py-2 px-4 rounded-xl flex items-center gap-3">
                    <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Karma Coins</span>
                        <span className="text-xl font-black text-gray-800">{user.earnings}</span>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-500">
                        <Coins size={20} className="fill-current" />
                    </div>
                </div>
                
                <button 
                  onClick={handleShare}
                  className="p-3 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100"
                  title="Share App"
                >
                  <Share2 size={20} />
                </button>

                <button 
                  onClick={onLogout}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title="Reset Profile"
                >
                  <LogOut size={20} />
                </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-gray-50/50">
            {/* User Stat Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-full ${user.role === UserRole.SPEAKER ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        <User size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Your Profile Status</h3>
                        <p className="text-gray-500 text-sm max-w-md mt-1">
                            You are currently set as a <strong className="text-gray-800">{user.role}</strong>. 
                            {user.bio ? ` "${user.bio}"` : ''}
                        </p>
                        <div className="flex gap-2 mt-3">
                            {user.topics.map(t => (
                                <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="h-12 w-px bg-gray-100 hidden md:block" />
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <span className="text-xs text-gray-400 font-bold uppercase">Mood</span>
                        <p className="text-xl font-bold text-gray-800">{user.mood}</p>
                    </div>
                    <div className="text-center">
                         <span className="text-xs text-gray-400 font-bold uppercase">Age</span>
                         <p className="text-xl font-bold text-gray-800">{user.ageRange}</p>
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Stats */}
                <div className="space-y-4">
                    <div className="bg-green-500 text-white p-6 rounded-2xl shadow-lg shadow-green-200 hover:scale-[1.02] transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-bold opacity-80">Online Peers</span>
                            <Users className="opacity-80" />
                        </div>
                        <p className="text-4xl font-black">{Math.floor(Math.random() * 500) + 1200}</p>
                        <p className="text-sm opacity-80 mt-1">People helping people right now.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-400 font-bold text-xs uppercase">
                            <Activity size={14} /> System Health
                        </div>
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            All systems operational
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <button 
                    onClick={onStartMatch}
                    className="group relative h-full min-h-[200px] bg-white border-2 border-green-500 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-green-50 transition-all overflow-hidden cursor-pointer"
                >
                    <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-5 transition-opacity" />
                    <div className="p-5 bg-green-500 text-white rounded-full shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
                        <Play size={40} className="fill-current ml-1" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-gray-800 group-hover:text-green-600 transition-colors">START MATCHING</h3>
                        <p className="text-gray-500 text-sm mt-1">Find a {user.role === UserRole.SPEAKER ? 'Listener' : 'Speaker'}</p>
                    </div>
                </button>

            </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
                Matches are anonymous. Please adhere to our community safety guidelines.
            </p>
        </div>

      </div>
    </div>
  );
};