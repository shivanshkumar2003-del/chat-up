import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';
import { Heart, Ear, ArrowRight, User, MessageSquare, Tag, CheckCircle, Shield } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  
  // Form State
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [mood, setMood] = useState('');
  const [bio, setBio] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const toggleTopic = (t: string) => {
    if (topics.includes(t)) {
      setTopics(topics.filter(i => i !== t));
    } else {
      setTopics([...topics, t]);
    }
  };

  const handleNext = () => {
    if (step === 4) {
      if (role && name && mood && agreedToTerms) {
        onComplete({
          name,
          ageRange,
          role,
          mood,
          bio,
          topics,
          earnings: 0
        });
      }
    } else {
      setStep(step + 1);
    }
  };

  const isStepValid = () => {
    switch(step) {
        case 1: return name.length > 2 && ageRange !== '';
        case 2: return role !== null;
        case 3: return mood !== '' && bio.length > 5;
        case 4: return topics.length > 0 && agreedToTerms;
        default: return false;
    }
  };

  const topicOptions = [
    "Anxiety & Stress", "Depression", "Work-Life Balance", "Relationships", 
    "Loneliness", "Academic Pressure", "Family Issues", "Self-Improvement",
    "Grief & Loss", "Social Anxiety", "LGBTQ+", "Just Chatting"
  ];

  return (
    <div className="relative z-10 w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[500px]">
      
      {/* Sidebar / Progress */}
      <div className="bg-green-600 text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-2xl font-black mb-1">Chat Up</h1>
            <p className="text-green-100 text-xs mb-8">Professional Mental Health Peer Support</p>
            
            <div className="space-y-6">
                {[
                    { s: 1, label: 'Identity', icon: User },
                    { s: 2, label: 'Role', icon: Heart },
                    { s: 3, label: 'Context', icon: MessageSquare },
                    { s: 4, label: 'Interests', icon: Tag },
                ].map((item) => (
                    <div key={item.s} className={`flex items-center gap-3 transition-all duration-300 ${step === item.s ? 'opacity-100 translate-x-2' : step > item.s ? 'opacity-70' : 'opacity-40'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= item.s ? 'bg-white text-green-600 border-white' : 'border-green-300'}`}>
                            {step > item.s ? <CheckCircle size={16} /> : <item.icon size={16} />}
                        </div>
                        <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
        {/* Decor */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute top-10 -left-10 w-20 h-20 bg-green-400 rounded-full opacity-50 blur-xl"></div>
      </div>

      {/* Form Area */}
      <div className="p-8 md:w-2/3 flex flex-col">
        
        <div className="flex-1">
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Let's get to know you.</h2>
                    <p className="text-gray-500 text-sm">Your identity remains anonymous to other peers.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. SereneSky"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age Group</label>
                            <select 
                                value={ageRange}
                                onChange={(e) => setAgeRange(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-gray-50 text-gray-700"
                            >
                                <option value="">Select Age Range</option>
                                <option value="18-24">18 - 24</option>
                                <option value="25-34">25 - 34</option>
                                <option value="35-44">35 - 44</option>
                                <option value="45+">45+</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Choose your path.</h2>
                    <p className="text-gray-500 text-sm">Are you here to share or to support?</p>

                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => setRole(UserRole.SPEAKER)}
                            className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all group ${role === UserRole.SPEAKER ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'}`}
                        >
                            <div className={`p-3 rounded-full ${role === UserRole.SPEAKER ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-green-100 group-hover:text-green-500'}`}>
                                <Heart size={24} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-gray-800">I need to talk</span>
                                <span className="text-xs text-gray-500">Connect with a listener to vent and process feelings.</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setRole(UserRole.LISTENER)}
                            className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all group ${role === UserRole.LISTENER ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'}`}
                        >
                            <div className={`p-3 rounded-full ${role === UserRole.LISTENER ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                                <Ear size={24} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-gray-800">I want to listen</span>
                                <span className="text-xs text-gray-500">Provide support to others and earn Karma coins.</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">How are you feeling?</h2>
                    <p className="text-gray-500 text-sm">Help us find the right match for you.</p>

                    <div className="space-y-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Mood</label>
                             <div className="flex flex-wrap gap-2">
                                {['Calm', 'Anxious', 'Sad', 'Happy', 'Frustrated', 'Lonely', 'Hopeful'].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMood(m)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${mood === m ? 'bg-green-500 text-white border-green-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                {role === UserRole.SPEAKER ? "What's on your mind?" : "Why do you want to listen?"}
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder={role === UserRole.SPEAKER ? "Briefly describe what you're going through..." : "Tell us a bit about your empathy style..."}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-gray-50 h-24 text-sm resize-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
                 <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Relevant Topics</h2>
                    <p className="text-gray-500 text-sm">Select tags that relate to the conversation you want.</p>
                    
                    <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar mb-4">
                        {topicOptions.map(topic => (
                        <button
                            key={topic}
                            onClick={() => toggleTopic(topic)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${topics.includes(topic) ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
                        >
                            {topic}
                        </button>
                        ))}
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex gap-3 items-start">
                        <div className="mt-1 text-green-600">
                            <Shield size={20} />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500" 
                                />
                                <span className="text-xs text-gray-600 font-bold">I agree to the Community Guidelines</span>
                            </label>
                            <p className="text-[10px] text-gray-500 mt-1 pl-6">
                                I confirm I am 18+ and will be respectful. Zero tolerance for harassment.
                            </p>
                        </div>
                    </div>
                 </div>
            )}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
            {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-gray-600 text-sm font-bold px-4 py-2">
                    Back
                </button>
            ) : <div />}
            
            <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-200 flex items-center gap-2 transition-all transform active:scale-95"
            >
                {step === 4 ? "Enter Chat" : "Next"} <ArrowRight size={18} />
            </button>
        </div>

      </div>
    </div>
  );
};