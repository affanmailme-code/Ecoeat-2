import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    className = '', 
    variant = 'primary',
    size = 'medium',
    ...props 
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px focus:ring-offset-gray-800';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/20 focus:ring-emerald-500',
        secondary: 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 focus:ring-red-500',
    };
    
    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg'
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};