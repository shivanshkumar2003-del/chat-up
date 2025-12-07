import React from 'react';

export const Watermark: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden bg-white">
      <div className="opacity-[0.03] transform scale-150">
        <svg
          width="800px"
          height="800px"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#22c55e" fillRule="nonzero">
            {/* Frontal Lobe */}
            <path d="M160,160 C120,160 90,190 85,230 C60,240 40,270 45,300 C50,340 80,360 110,360 L140,360 L140,300 L160,250 L160,160 Z" opacity="0.8" />
            
            {/* Parietal Lobe */}
            <path d="M160,160 C180,120 240,110 280,130 C310,145 320,170 320,200 L320,260 L240,260 L160,250 Z" opacity="0.6" />
            
            {/* Occipital Lobe */}
            <path d="M320,200 C360,200 390,230 400,270 C410,310 390,350 350,370 C320,385 280,370 260,350 L260,260 L320,260 Z" opacity="0.9" />
            
            {/* Temporal Lobe */}
            <path d="M140,300 C140,340 160,390 200,400 C240,410 260,380 260,350 L260,260 L160,250 L140,300 Z" opacity="0.7" />
            
            {/* Cerebellum */}
            <path d="M220,410 C200,430 210,460 240,470 C280,480 320,460 330,420 C335,400 320,380 300,380 L220,410 Z" opacity="0.5" />
          </g>
        </svg>
      </div>
      
      {/* Abstract floating circles for aesthetic depth */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse" style={{animationDelay: "2s"}} />
    </div>
  );
};