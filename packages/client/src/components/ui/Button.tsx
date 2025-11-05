// packages/client/src/components/ui/Button.tsx

import React from 'react';
import Spinner from './Spinner'; // 1. Import our new Spinner component

// 2. Add the optional 'isLoading' prop to the interface.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           className = '',
                                           isLoading = false, // 3. Destructure the new prop with a default value
                                           ...props
                                       }) => {
    const baseStyles =
        'px-6 py-2 rounded-md shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-75 disabled:cursor-not-allowed disabled:scale-100';

    const variants = {
        primary:
            'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
        secondary:
            'bg-transparent border border-primary text-primary hover:bg-primary/10 focus:ring-primary',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            // 4. The button is disabled if 'isLoading' is true OR if it was already disabled.
            disabled={isLoading || props.disabled}
            {...props}
        >
            {/* 5. Conditional Rendering: Show the spinner or the original content. */}
            {isLoading ? <Spinner /> : children}
        </button>
    );
};

export default Button;