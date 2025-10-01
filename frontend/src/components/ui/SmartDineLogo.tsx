import React from 'react';

interface SmartDineLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'full' | 'icon' | 'text';
}

const SmartDineLogo: React.FC<SmartDineLogoProps> = ({ 
  size = 40, 
  className = '', 
  showText = false,
  variant = 'icon'
}) => {
  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
          Smart Dine
        </span>
        <span className="text-sm text-gray-600 ml-1">Crete</span>
      </div>
    );
  }

  const LogoSVG = () => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Circle with Maroon Border */}
      <circle cx="100" cy="100" r="95" fill="#8B4513" stroke="#8B4513" strokeWidth="5"/>
      
      {/* Inner Circle with Cream Background */}
      <circle cx="100" cy="100" r="85" fill="#F5F5DC"/>
      
      {/* Top Text "SMART DINE" */}
      <defs>
        <path id="topCircle" d="M 30,100 A 70,70 0 0,1 170,100" fill="none"/>
        <path id="bottomCircle" d="M 170,100 A 70,70 0 0,1 30,100" fill="none"/>
      </defs>
      
      <text fontFamily="serif" fontSize="18" fontWeight="bold" fill="#8B4513">
        <textPath href="#topCircle" startOffset="50%" textAnchor="middle">SMART DINE</textPath>
      </text>
      
      {/* Bottom Text "CRETE" */}
      <text fontFamily="serif" fontSize="18" fontWeight="bold" fill="#8B4513">
        <textPath href="#bottomCircle" startOffset="50%" textAnchor="middle">CRETE</textPath>
      </text>
      
      {/* Central Cooking Pot */}
      <g transform="translate(100,100)">
        {/* Pot Body */}
        <ellipse cx="0" cy="5" rx="25" ry="15" fill="#8B4513"/>
        {/* Pot Lid */}
        <ellipse cx="0" cy="-5" rx="30" ry="8" fill="#8B4513"/>
        {/* Lid Handle */}
        <ellipse cx="0" cy="-8" rx="4" ry="3" fill="#8B4513"/>
        
        {/* Steam Lines */}
        <path 
          d="M -10,-15 Q -10,-25 -5,-20 Q -5,-30 0,-25 Q 0,-35 5,-30 Q 5,-20 10,-25" 
          stroke="#8B4513" 
          strokeWidth="2" 
          fill="none" 
          opacity="0.7"
        />
        
        {/* Left Spoon */}
        <g transform="translate(-35,-10) rotate(-30)">
          <ellipse cx="0" cy="-8" rx="6" ry="3" fill="#8B4513"/>
          <rect x="-1" y="-5" width="2" height="15" fill="#8B4513"/>
        </g>
        
        {/* Right Fork */}
        <g transform="translate(35,-10) rotate(30)">
          <rect x="-1" y="-5" width="2" height="15" fill="#8B4513"/>
          <rect x="-3" y="-8" width="1.5" height="5" fill="#8B4513"/>
          <rect x="-1" y="-8" width="1.5" height="5" fill="#8B4513"/>
          <rect x="1" y="-8" width="1.5" height="5" fill="#8B4513"/>
        </g>
      </g>
      
      {/* Decorative Diamonds */}
      <g fill="#8B4513" opacity="0.6">
        <polygon points="85,45 90,50 85,55 80,50" />
        <polygon points="115,45 120,50 115,55 110,50" />
        <polygon points="70,65 75,70 70,75 65,70" />
        <polygon points="130,65 135,70 130,75 125,70" />
        <polygon points="60,130 65,135 60,140 55,135" />
        <polygon points="140,130 145,135 140,140 135,135" />
      </g>
      
      {/* Small Leaf Decoration */}
      <g transform="translate(130,110)">
        <path d="M 0,0 Q 8,-3 12,2 Q 8,7 0,4 Z" fill="#8B4513" opacity="0.7"/>
        <path d="M 0,4 L 6,1" stroke="#8B4513" strokeWidth="1" opacity="0.7"/>
      </g>
      
      {/* Sound Waves (left side) */}
      <g transform="translate(40,120)" fill="none" stroke="#8B4513" strokeWidth="2" opacity="0.6">
        <path d="M 0,0 Q 5,-5 0,-10"/>
        <path d="M 0,5 Q 8,-8 0,-15"/>
        <path d="M 0,10 Q 12,-12 0,-20"/>
      </g>
    </svg>
  );

  if (variant === 'full') {
    return (
      <div className={`flex items-center ${className}`}>
        <LogoSVG />
        {showText && (
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-800">Smart Dine</h1>
            <p className="text-sm text-gray-600">Crete</p>
          </div>
        )}
      </div>
    );
  }

  return <LogoSVG />;
};

export default SmartDineLogo;