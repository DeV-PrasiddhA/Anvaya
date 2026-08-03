import React from 'react';
import anvayaLogo from '../assets/anvaya-logo.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12',
    xl: 'h-14 sm:h-16',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
    >
      <img
        src={anvayaLogo}
        alt="Anvaya Logo"
        className={`${sizeClasses[size]} w-auto object-contain brightness-95 filter drop-shadow-xs`}
      />
    </div>
  );
};

export default BrandLogo;
