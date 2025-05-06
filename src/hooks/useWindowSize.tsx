"use client";

import { useState, useEffect } from 'react';

interface WindowSize {
    width: number;
    height: number;
}

/**
 * Hook para obtener y escuchar cambios en el tamaño de la ventana
 * @returns {WindowSize} Objeto con el ancho y alto actuales de la ventana
 */
function useWindowSize(): WindowSize {
    // Estado inicial con valores seguros para SSR
    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        // Función para actualizar el estado con las dimensiones de la ventana
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        // Configurar el listener para cambios de tamaño
        window.addEventListener('resize', handleResize);

        // Llamar a handleResize inmediatamente para establecer el tamaño inicial
        handleResize();

        // Limpiar el listener al desmontar
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}

export default useWindowSize;