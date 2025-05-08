"use client"

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

function DevelopmentBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 w-full z-[51] bg-amber-50 dark:bg-amber-900/70 border-b border-amber-200 dark:border-amber-700/50">
            <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-amber-800 dark:text-amber-200">
                <div className="flex items-center space-x-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <p className="text-xs font-medium">
                        Esta página está en desarrollo. Algunas funciones podrían no estar disponibles.
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                    aria-label="Cerrar aviso"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}

export default DevelopmentBanner;