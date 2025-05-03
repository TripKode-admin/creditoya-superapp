"use client";

import { Loader2 } from "lucide-react";

type SpinnerProps = {
    size?: "sm" | "md" | "lg";
    color?: "green" | "gray" | "white" | "auto";
    className?: string;
};

function LoadingSpinner({ size = "md", color = "auto", className = "" }: SpinnerProps) {
    // Tamaños del spinner
    const sizeClasses = {
        sm: 16,
        md: 24,
        lg: 32,
    };

    // Colores del spinner optimizados para modo claro y oscuro
    const colorClasses = {
        green: "text-green-500 dark:text-green-300",
        gray: "text-gray-500 dark:text-gray-300",
        white: "text-gray-600 dark:text-gray-100",
        auto: "text-gray-600 dark:text-green-300",
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <Loader2
                size={sizeClasses[size]}
                className={`animate-spin ${colorClasses[color]}`}
                aria-label="cargando"
                strokeWidth={2}
            />
        </div>
    );
}

export default LoadingSpinner;