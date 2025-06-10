"use client";
import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  showText = true, 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} relative`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#6344F5", stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:"#8B5CF6", stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#A855F7", stopOpacity:1}} />
            </linearGradient>
            
            <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background glow */}
          <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" opacity="0.1" filter="url(#logoGlow)"/>
          
          {/* Document */}
          <g transform="translate(12, 8)">
            <rect x="0" y="0" width="16" height="20" rx="2" fill="url(#logoGradient)" filter="url(#logoGlow)"/>
            <path d="M13 0 L16 3 L13 3 Z" fill="#4C1D95" opacity="0.3"/>
            
            {/* Text lines */}
            <rect x="2" y="6" width="8" height="1" rx="0.5" fill="white" opacity="0.8"/>
            <rect x="2" y="9" width="11" height="1" rx="0.5" fill="white" opacity="0.6"/>
            <rect x="2" y="12" width="9" height="1" rx="0.5" fill="white" opacity="0.6"/>
            <rect x="2" y="15" width="7" height="1" rx="0.5" fill="white" opacity="0.4"/>
          </g>
          
          {/* Animated sparkles */}
          <g>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "32px 12px" }}
            >
              <path 
                d="M32 8 L33 11 L36 12 L33 13 L32 16 L31 13 L28 12 L31 11 Z" 
                fill="#FFD700" 
                opacity="0.9"
              />
            </motion.g>
            
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "8px 30px" }}
            >
              <path 
                d="M8 28 L9 30 L11 30 L9 31 L8 33 L7 31 L5 30 L7 30 Z" 
                fill="#00D4FF" 
                opacity="0.8"
              />
            </motion.g>
          </g>
          
          {/* Magic wand effect */}
          <motion.g
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <line x1="18" y1="28" x2="25" y2="21" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round"/>
            <motion.circle 
              cx="25" 
              cy="21" 
              r="1.5" 
              fill="#FFD700"
              animate={{ r: [1, 2.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.g>
        </svg>
      </motion.div>
      
      {showText && (
        <motion.span 
          className={`font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent ${textSizeClasses[size]}`}
          whileHover={{ scale: 1.02 }}
        >
          GitSpicefy
        </motion.span>
      )}
    </div>
  );
};

export default Logo;
