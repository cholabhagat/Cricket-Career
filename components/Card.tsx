
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-white dark:bg-dark-card rounded-lg shadow-lg p-6 sm:p-8 mb-8 transition-colors duration-300 ${className}`}>
            {title && (
                <h2 className="text-2xl font-bold text-gray-700 dark:text-dark-secondary-text border-b border-gray-200 dark:border-dark-border pb-4 mb-6">
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
};
