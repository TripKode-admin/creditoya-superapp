/**
 * Detección de capacidades del navegador para compatibilidad con dispositivos antiguos
 */

export interface BrowserCapabilities {
    supportsHttpOnly: boolean;
    supportsSameSite: boolean;
    supportsSecureCookies: boolean;
    supportsLocalStorage: boolean;
    supportsSessionStorage: boolean;
    supportsFetch: boolean;
    supportsPromises: boolean;
    javascriptVersion: number;
    isOldAndroid: boolean;
    isOldIOS: boolean;
    isLowMemory: boolean;
    isSlowCPU: boolean;
    connectionSpeed: 'fast' | 'medium' | 'slow';
    userAgent: string;
}

/**
 * Detecta si el navegador soporta cookies HTTP-only
 */
function checkHttpOnlySupport(): boolean {
    if (typeof window === 'undefined') return false; // Verificar que estamos en el navegador
    
    try {
        // Intentar crear una cookie HTTP-only (esto solo funciona en el servidor)
        // En el cliente, asumimos que si soporta cookies modernas, soporta HTTP-only
        return document.cookie !== undefined && 
               typeof document.cookie === 'string' &&
               navigator.cookieEnabled;
    } catch {
        return false;
    }
}

/**
 * Detecta si el navegador soporta SameSite
 */
function checkSameSiteSupport(): boolean {
    if (typeof window === 'undefined') return false; // Verificar que estamos en el navegador
    
    try {
        // Verificar si el navegador soporta SameSite
        const testCookie = 'test=sameSite; SameSite=Strict';
        document.cookie = testCookie;
        const supportsSameSite = document.cookie.includes('test=sameSite');
        document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        return supportsSameSite;
    } catch {
        return false;
    }
}

/**
 * Detecta si el navegador soporta cookies seguras
 */
function checkSecureCookieSupport(): boolean {
    if (typeof window === 'undefined') return false; // Verificar que estamos en el navegador
    
    try {
        // Verificar si estamos en HTTPS
        const isHTTPS = window.location.protocol === 'https:';
        return isHTTPS;
    } catch {
        return false;
    }
}

/**
 * Detecta si el navegador soporta localStorage
 */
function checkLocalStorageSupport(): boolean {
    try {
        const testKey = '__test_localStorage__';
        localStorage.setItem(testKey, 'test');
        const result = localStorage.getItem(testKey) === 'test';
        localStorage.removeItem(testKey);
        return result;
    } catch {
        return false;
    }
}

/**
 * Detecta si el navegador soporta sessionStorage
 */
function checkSessionStorageSupport(): boolean {
    try {
        const testKey = '__test_sessionStorage__';
        sessionStorage.setItem(testKey, 'test');
        const result = sessionStorage.getItem(testKey) === 'test';
        sessionStorage.removeItem(testKey);
        return result;
    } catch {
        return false;
    }
}

/**
 * Detecta si el navegador soporta Fetch API
 */
function checkFetchSupport(): boolean {
    return typeof fetch !== 'undefined' && typeof Response !== 'undefined';
}

/**
 * Detecta si el navegador soporta Promises
 */
function checkPromisesSupport(): boolean {
    return typeof Promise !== 'undefined' && typeof Promise.resolve === 'function';
}

/**
 * Detecta la versión de JavaScript
 */
function detectJSVersion(): number {
    try {
        // Detectar características de ES6+
        if (typeof Symbol !== 'undefined' && typeof Map !== 'undefined') {
            return 6;
        }
        // Detectar características de ES5
        if (typeof Array.prototype.forEach === 'function') {
            return 5;
        }
        return 3; // ES3 o anterior
    } catch {
        return 3;
    }
}

/**
 * Detecta si es Android antiguo
 */
function checkOldAndroid(): boolean {
    if (typeof window === 'undefined') return false; // Verificar que estamos en el navegador
    
    const userAgent = navigator.userAgent.toLowerCase();
    const androidMatch = userAgent.match(/android\s([0-9\.]*)/);
    
    if (androidMatch) {
        const version = parseFloat(androidMatch[1]);
        return version < 5.0; // Android 5.0 (API 21) o anterior
    }
    
    return false;
}

/**
 * Detecta si es iOS antiguo
 */
function checkOldIOS(): boolean {
    if (typeof window === 'undefined') return false; // Verificar que estamos en el navegador
    
    const userAgent = navigator.userAgent.toLowerCase();
    const iosMatch = userAgent.match(/os\s([0-9_]*)/);
    
    if (iosMatch) {
        const version = parseFloat(iosMatch[1].replace('_', '.'));
        return version < 10.0; // iOS 10 o anterior
    }
    
    return false;
}

/**
 * Detecta si el dispositivo tiene poca memoria
 */
function checkMemoryConstraints(): boolean {
    if (typeof window === 'undefined') return false; // Verificar que estamos en el navegador
    
    try {
        // Verificar si tenemos información de memoria
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            const totalMemory = memory.totalJSHeapSize;
            const usedMemory = memory.usedJSHeapSize;
            const memoryUsage = usedMemory / totalMemory;
            
            // Si usa más del 80% de la memoria disponible, considerarlo bajo memoria
            return memoryUsage > 0.8;
        }
        
        // Fallback: detectar por user agent
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('android 4') || 
               userAgent.includes('android 5') ||
               userAgent.includes('iphone os 9') ||
               userAgent.includes('iphone os 8');
    } catch {
        return false;
    }
}

/**
 * Detecta si el CPU es lento
 */
function checkCPUPerformance(): boolean {
    try {
        // Medir tiempo de ejecución de una operación simple
        const start = performance.now();
        
        // Operación que requiere CPU
        let result = 0;
        for (let i = 0; i < 100000; i++) {
            result += Math.sqrt(i);
        }
        
        const end = performance.now();
        const executionTime = end - start;
        
        // Si toma más de 50ms, considerar CPU lento
        return executionTime > 50;
    } catch {
        return false;
    }
}

/**
 * Detecta la velocidad de conexión
 */
function detectConnectionSpeed(): 'fast' | 'medium' | 'slow' {
    if (typeof window === 'undefined') return 'medium'; // Verificar que estamos en el navegador
    
    try {
        // Verificar si tenemos información de conexión
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            const effectiveType = connection.effectiveType;
            
            switch (effectiveType) {
                case '4g':
                    return 'fast';
                case '3g':
                    return 'medium';
                case '2g':
                case 'slow-2g':
                    return 'slow';
                default:
                    return 'medium';
            }
        }
        
        // Fallback: detectar por user agent
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android 4') || userAgent.includes('android 5')) {
            return 'slow';
        }
        
        return 'medium';
    } catch {
        return 'medium';
    }
}

/**
 * Obtiene todas las capacidades del navegador
 */
export function getBrowserCapabilities(): BrowserCapabilities {
    // Si estamos en el servidor, devolver capacidades por defecto
    if (typeof window === 'undefined') {
        return {
            supportsHttpOnly: true,
            supportsSameSite: true,
            supportsSecureCookies: false,
            supportsLocalStorage: false,
            supportsSessionStorage: false,
            supportsFetch: false,
            supportsPromises: false,
            javascriptVersion: 5,
            isOldAndroid: false,
            isOldIOS: false,
            isLowMemory: false,
            isSlowCPU: false,
            connectionSpeed: 'medium',
            userAgent: 'server'
        };
    }

    return {
        supportsHttpOnly: checkHttpOnlySupport(),
        supportsSameSite: checkSameSiteSupport(),
        supportsSecureCookies: checkSecureCookieSupport(),
        supportsLocalStorage: checkLocalStorageSupport(),
        supportsSessionStorage: checkSessionStorageSupport(),
        supportsFetch: checkFetchSupport(),
        supportsPromises: checkPromisesSupport(),
        javascriptVersion: detectJSVersion(),
        isOldAndroid: checkOldAndroid(),
        isOldIOS: checkOldIOS(),
        isLowMemory: checkMemoryConstraints(),
        isSlowCPU: checkCPUPerformance(),
        connectionSpeed: detectConnectionSpeed(),
        userAgent: navigator.userAgent
    };
}

/**
 * Determina si el navegador es considerado "legacy"
 */
export function isLegacyBrowser(capabilities: BrowserCapabilities): boolean {
    return capabilities.javascriptVersion < 5 ||
           capabilities.isOldAndroid ||
           capabilities.isOldIOS ||
           !capabilities.supportsPromises ||
           !capabilities.supportsFetch;
}

/**
 * Obtiene la configuración de cookies adaptativa
 */
export function getAdaptiveCookieConfig(capabilities: BrowserCapabilities) {
    const isHTTPS = capabilities.supportsSecureCookies;
    const isSlowConnection = capabilities.connectionSpeed === 'slow';
    
    return {
        httpOnly: capabilities.supportsHttpOnly,
        secure: capabilities.supportsSecureCookies && isHTTPS,
        sameSite: capabilities.supportsSameSite ? 'strict' : 'lax' as 'strict' | 'lax',
        maxAge: isSlowConnection ? 60 * 60 * 48 : 60 * 60 * 24, // 48h para conexiones lentas
        path: '/'
    };
}

/**
 * Obtiene el timeout adaptativo basado en las capacidades
 */
export function getAdaptiveTimeout(capabilities: BrowserCapabilities): number {
    const baseTimeout = 5000; // 5 segundos base
    
    if (capabilities.connectionSpeed === 'slow') {
        return baseTimeout * 3; // 15 segundos para conexiones lentas
    } else if (capabilities.connectionSpeed === 'medium') {
        return baseTimeout * 2; // 10 segundos para conexiones medias
    }
    
    return baseTimeout; // 5 segundos para conexiones rápidas
}
