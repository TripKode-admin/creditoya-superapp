"use client";
import { useState, useCallback } from "react";

function useLoadingState(initialState = false) {
    const [isLoading, setIsLoading] = useState<boolean>(initialState);

    /**
     * Ejecuta una función asíncrona mientras maneja automáticamente
     * el estado de carga
     */
    const executeWithLoading = useCallback(async <T,>(
        asyncFunction: () => Promise<T>
    ): Promise<T> => {
        setIsLoading(true);
        try {
            const result = await asyncFunction();
            return result;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        setIsLoading,
        executeWithLoading,
    };
}

export default useLoadingState;