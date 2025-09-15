import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}) => {
  const baseStyle = 'rounded-lg overflow-hidden';
  
  const variants = {
    default: 'bg-white',
    bordered: 'bg-white border border-secondary-200',
    elevated: 'bg-white shadow-custom',
  };
  
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };
  
  return (
    <div className={`${baseStyle} ${variants[variant]} ${paddings[padding]} ${className} transition-all duration-200 hover:shadow-lg`}>
      {children}
    </div>
  );
};

export default Card;