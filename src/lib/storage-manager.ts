/**
 * Estrategias de almacenamiento múltiple para compatibilidad con dispositivos antiguos
 */

import { BrowserCapabilities } from './browser-capabilities';

export type StorageStrategy = 'httpOnly-cookie' | 'localStorage' | 'sessionStorage' | 'memory';

export interface StorageAdapter {
    get(key: string): string | null;
    set(key: string, value: string, options?: any): boolean;
    remove(key: string): boolean;
    clear(): boolean;
}

/**
 * Adaptador para localStorage
 */
class LocalStorageAdapter implements StorageAdapter {
    get(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    set(key: string, value: string): boolean {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    remove(key: string): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    clear(): boolean {
        try {
            localStorage.clear();
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Adaptador para sessionStorage
 */
class SessionStorageAdapter implements StorageAdapter {
    get(key: string): string | null {
        try {
            return sessionStorage.getItem(key);
        } catch {
            return null;
        }
    }

    set(key: string, value: string): boolean {
        try {
            sessionStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    remove(key: string): boolean {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    clear(): boolean {
        try {
            sessionStorage.clear();
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Adaptador para memoria (fallback final)
 */
class MemoryStorageAdapter implements StorageAdapter {
    private storage: Map<string, string> = new Map();

    get(key: string): string | null {
        return this.storage.get(key) || null;
    }

    set(key: string, value: string): boolean {
        try {
            this.storage.set(key, value);
            return true;
        } catch {
            return false;
        }
    }

    remove(key: string): boolean {
        return this.storage.delete(key);
    }

    clear(): boolean {
        try {
            this.storage.clear();
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Adaptador para cookies (solo lectura en el cliente)
 */
class CookieStorageAdapter implements StorageAdapter {
    get(key: string): string | null {
        try {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === key) {
                    return decodeURIComponent(value);
                }
            }
            return null;
        } catch {
            return null;
        }
    }

    set(key: string, value: string): boolean {
        // En el cliente no podemos establecer cookies HTTP-only
        // Esto se maneja en el servidor
        return false;
    }

    remove(key: string): boolean {
        // En el cliente no podemos remover cookies HTTP-only
        return false;
    }

    clear(): boolean {
        return false;
    }
}

/**
 * Gestor de almacenamiento con múltiples estrategias
 */
export class StorageManager {
    private adapters: Map<StorageStrategy, StorageAdapter> = new Map();
    private capabilities: BrowserCapabilities;
    private primaryStrategy!: StorageStrategy;
    private fallbackStrategies!: StorageStrategy[];

    constructor(capabilities: BrowserCapabilities) {
        this.capabilities = capabilities;
        this.initializeAdapters();
        this.determineStrategies();
    }

    private initializeAdapters(): void {
        this.adapters.set('httpOnly-cookie', new CookieStorageAdapter());
        
        if (this.capabilities.supportsLocalStorage) {
            this.adapters.set('localStorage', new LocalStorageAdapter());
        }
        
        if (this.capabilities.supportsSessionStorage) {
            this.adapters.set('sessionStorage', new SessionStorageAdapter());
        }
        
        // Memory storage siempre está disponible como último recurso
        this.adapters.set('memory', new MemoryStorageAdapter());
    }

    private determineStrategies(): void {
        // Determinar estrategia primaria y fallbacks
        if (this.capabilities.supportsHttpOnly) {
            this.primaryStrategy = 'httpOnly-cookie';
            this.fallbackStrategies = ['localStorage', 'sessionStorage', 'memory'];
        } else if (this.capabilities.supportsLocalStorage) {
            this.primaryStrategy = 'localStorage';
            this.fallbackStrategies = ['sessionStorage', 'memory'];
        } else if (this.capabilities.supportsSessionStorage) {
            this.primaryStrategy = 'sessionStorage';
            this.fallbackStrategies = ['memory'];
        } else {
            this.primaryStrategy = 'memory';
            this.fallbackStrategies = [];
        }
    }

    /**
     * Obtiene un valor usando la estrategia primaria y fallbacks
     */
    get(key: string): string | null {
        // Intentar con la estrategia primaria
        const primaryAdapter = this.adapters.get(this.primaryStrategy);
        if (primaryAdapter) {
            const value = primaryAdapter.get(key);
            if (value !== null) {
                return value;
            }
        }

        // Intentar con estrategias de fallback
        for (const strategy of this.fallbackStrategies) {
            const adapter = this.adapters.get(strategy);
            if (adapter) {
                const value = adapter.get(key);
                if (value !== null) {
                    return value;
                }
            }
        }

        return null;
    }

    /**
     * Establece un valor usando la estrategia primaria
     */
    set(key: string, value: string, options?: any): boolean {
        const primaryAdapter = this.adapters.get(this.primaryStrategy);
        if (primaryAdapter) {
            return primaryAdapter.set(key, value, options);
        }

        // Si la estrategia primaria falla, intentar con fallbacks
        for (const strategy of this.fallbackStrategies) {
            const adapter = this.adapters.get(strategy);
            if (adapter) {
                if (adapter.set(key, value, options)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Remueve un valor de todas las estrategias
     */
    remove(key: string): boolean {
        let success = false;

        // Remover de la estrategia primaria
        const primaryAdapter = this.adapters.get(this.primaryStrategy);
        if (primaryAdapter) {
            success = primaryAdapter.remove(key) || success;
        }

        // Remover de estrategias de fallback
        for (const strategy of this.fallbackStrategies) {
            const adapter = this.adapters.get(strategy);
            if (adapter) {
                success = adapter.remove(key) || success;
            }
        }

        return success;
    }

    /**
     * Limpia todas las estrategias
     */
    clear(): boolean {
        let success = false;

        // Limpiar estrategia primaria
        const primaryAdapter = this.adapters.get(this.primaryStrategy);
        if (primaryAdapter) {
            success = primaryAdapter.clear() || success;
        }

        // Limpiar estrategias de fallback
        for (const strategy of this.fallbackStrategies) {
            const adapter = this.adapters.get(strategy);
            if (adapter) {
                success = adapter.clear() || success;
            }
        }

        return success;
    }

    /**
     * Obtiene información sobre las estrategias disponibles
     */
    getStorageInfo(): {
        primary: StorageStrategy;
        fallbacks: StorageStrategy[];
        available: StorageStrategy[];
    } {
        return {
            primary: this.primaryStrategy,
            fallbacks: this.fallbackStrategies,
            available: Array.from(this.adapters.keys())
        };
    }
}

/**
 * Factory para crear el gestor de almacenamiento
 */
export function createStorageManager(capabilities: BrowserCapabilities): StorageManager {
    return new StorageManager(capabilities);
}
