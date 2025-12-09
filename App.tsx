
import React, { useState, useEffect } from 'react';
import { Watermark } from './components/Watermark';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { UserProfile, AppState, UserRole } from './types';
import { ShieldAlert } from 'lucide-react';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mh_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("LocalStorage access denied");
      return null;
    }
  });

  const [appState, setAppState] = useState<AppState>(() => {
    return userProfile ? AppState.DASHBOARD : AppState.ONBOARDING;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // New State for Room Codes
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [isRoomHost, setIsRoomHost] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (userProfile) {
        localStorage.setItem('mh_user_profile', JSON.stringify(userProfile));
      } else {
        localStorage.removeItem('mh_user_profile');
      }
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  }, [userProfile]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState(AppState.DASHBOARD);
    addToast(`Welcome to the community, ${profile.name}!`, 'success');
  };

  const handleJoinRoom = (roomId: string, isHost: boolean) => {
    setCurrentRoomId(roomId);
    setIsRoomHost(isHost);
    setAppState(AppState.CHATTING);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to reset your profile? All Credits will be lost.")) {
      setUserProfile(null);
      setAppState(AppState.ONBOARDING);
      addToast('Profile reset successfully.', 'info');
    }
  };

  const handleEndChat = (earned: boolean) => {
    if (userProfile && earned && userProfile.role === UserRole.LISTENER) {
       const newProfile = {
           ...userProfile,
           earnings: userProfile.earnings + 10
       };
       setUserProfile(newProfile);
       addToast("You earned 10 Credits!", 'success');
    }
    setAppState(AppState.DASHBOARD);
    setCurrentRoomId('');
  };

  return (
    <div className="relative min-h-screen w-full font-sans flex flex-col bg-gray-50 text-gray-900">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {appState !== AppState.CHATTING && <Watermark />}
      
      <main className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        
        {appState === AppState.ONBOARDING && (
           <div className="w-full flex justify-center p-4">
              <Onboarding onComplete={handleOnboardingComplete} />
           </div>
        )}

        {appState === AppState.DASHBOARD && userProfile && (
            <Dashboard 
              user={userProfile} 
              onJoinRoom={handleJoinRoom}
              onLogout={handleLogout}
              addToast={addToast}
            />
        )}

        {appState === AppState.CHATTING && userProfile && (
            <ChatInterface 
              user={userProfile} 
              roomId={currentRoomId}
              isHost={isRoomHost}
              onEndChat={handleEndChat} 
              addToast={addToast}
            />
        )}

      </main>

      {appState !== AppState.CHATTING && (
        <footer className="w-full bg-white border-t border-gray-200 py-6 px-4 relative z-20">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 text-center md:text-left">
              <p className="font-bold text-gray-600 mb-1">© 2024 Mental Health Chat Up</p>
              <p>Peer-to-Peer Encrypted Connections.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 px-4 py-2 rounded-lg text-red-700">
                <ShieldAlert size={20} />
                <div className="text-xs font-bold text-left">
                    <p>IN CRISIS?</p>
                    <p className="font-normal">Call 911 or emergency services immediately.</p>
                </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
