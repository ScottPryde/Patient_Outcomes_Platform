import React from 'react';

interface InteractiumLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'icon' | 'full';
  className?: string;
}

export function InteractiumLogo({
  size = 'md',
  showText = true,
  variant = 'full',
  className = '',
}: InteractiumLogoProps) {
  const sizeMap = {
    sm: { width: 24, height: 24, textClass: 'text-lg font-bold' },
    md: { width: 32, height: 32, textClass: 'text-2xl font-bold' },
    lg: { width: 48, height: 48, textClass: 'text-3xl font-bold' },
  };

  const { width, height, textClass } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Interactium Logo - Exact Design */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Main circle - central blue dot */}
        <circle cx="30" cy="30" r="10" fill="currentColor" className="text-blue-600 dark:text-blue-500" />
        
        {/* Concentric rings around the circle */}
        <g stroke="currentColor" strokeWidth="3" fill="none" className="text-blue-600 dark:text-blue-500">
          {/* Inner ring */}
          <circle cx="30" cy="30" r="16" />
          {/* Middle ring */}
          <circle cx="30" cy="30" r="22" />
          {/* Outer ring */}
          <circle cx="30" cy="30" r="28" />
        </g>
        
        {/* Segmented arc decoration - characteristic Interactium rings */}
        <g stroke="currentColor" strokeWidth="2.5" fill="none" className="text-blue-600 dark:text-blue-500" strokeLinecap="round">
          {/* Top right arc segments */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={`arc-${i}`}
              d={`M ${30 + 35 * Math.cos((i * 15 - 80) * (Math.PI / 180))} ${30 + 35 * Math.sin((i * 15 - 80) * (Math.PI / 180))} A 35 35 0 0 1 ${30 + 35 * Math.cos((i * 15 - 65) * (Math.PI / 180))} ${30 + 35 * Math.sin((i * 15 - 65) * (Math.PI / 180))}`}
            />
          ))}
        </g>
      </svg>

      {showText && variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-blue-600 dark:text-blue-400 ${textClass}`}>
            interactium
          </span>
          <span className={`text-xs font-medium text-slate-600 dark:text-slate-400`}>
            Patient Outcomes
          </span>
        </div>
      )}
    </div>
  );
}
