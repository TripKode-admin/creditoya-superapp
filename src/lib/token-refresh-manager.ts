/**
 * Sistema de refresh automático de tokens para mantener la sesión activa
 */

import { BrowserCapabilities } from './browser-capabilities';
import { StorageManager } from './storage-manager';

export interface TokenRefreshConfig {
    refreshThreshold: number; // Porcentaje del tiempo de vida del token (0.8 = 80%)
    maxRetries: number;
    exponentialBackoff: boolean;
    baseDelay: number; // Delay base en milisegundos
    maxDelay: number; // Delay máximo en milisegundos
    enableBackgroundRefresh: boolean;
    refreshEndpoint: string;
}

export interface TokenRefreshResult {
    success: boolean;
    newToken?: string;
    error?: string;
    retryAfter?: number; // Tiempo en milisegundos antes del siguiente intento
}

export class TokenRefreshManager {
    private config: TokenRefreshConfig;
    private capabilities: BrowserCapabilities;
    private storageManager: StorageManager;
    private refreshTimer: NodeJS.Timeout | null = null;
    private isRefreshing: boolean = false;
    private retryCount: number = 0;
    private lastRefreshTime: number = 0;

    constructor(
        config: Partial<TokenRefreshConfig>,
        capabilities: BrowserCapabilities,
        storageManager: StorageManager
    ) {
        this.config = {
            refreshThreshold: 0.8,
            maxRetries: 3,
            exponentialBackoff: true,
            baseDelay: 1000,
            maxDelay: 30000,
            enableBackgroundRefresh: true,
            refreshEndpoint: '/api/auth/refresh',
            ...config
        };
        
        this.capabilities = capabilities;
        this.storageManager = storageManager;
    }

    /**
     * Inicia el sistema de refresh automático
     */
    startAutoRefresh(): void {
        if (!this.config.enableBackgroundRefresh) {
            return;
        }

        this.scheduleNextRefresh();
    }

    /**
     * Detiene el sistema de refresh automático
     */
    stopAutoRefresh(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Programa el siguiente refresh basado en el token actual
     */
    private scheduleNextRefresh(): void {
        try {
            const token = this.storageManager.get('creditoya_token');
            if (!token) {
                return;
            }

            const payload = this.extractTokenPayload(token);
            if (!payload || !payload.exp) {
                return;
            }

            const now = Date.now();
            const expTime = payload.exp * 1000;
            const tokenLifetime = expTime - now;
            const refreshTime = tokenLifetime * this.config.refreshThreshold;

            // Solo programar si el tiempo de refresh es positivo
            if (refreshTime > 0) {
                this.refreshTimer = setTimeout(() => {
                    this.performRefresh();
                }, refreshTime);

                console.log(`🔄 [TOKEN_REFRESH] Próximo refresh programado en ${Math.round(refreshTime / 1000)} segundos`);
            }
        } catch (error) {
            console.error('Error programando refresh de token:', error);
        }
    }

    /**
     * Realiza el refresh del token
     */
    private async performRefresh(): Promise<void> {
        if (this.isRefreshing) {
            return;
        }

        this.isRefreshing = true;
        this.retryCount = 0;

        try {
            const result = await this.refreshToken();
            
            if (result.success) {
                this.lastRefreshTime = Date.now();
                this.retryCount = 0;
                console.log('✅ [TOKEN_REFRESH] Token refrescado exitosamente');
                
                // Programar el siguiente refresh
                this.scheduleNextRefresh();
            } else {
                console.error('❌ [TOKEN_REFRESH] Error refrescando token:', result.error);
                this.handleRefreshError(result);
            }
        } catch (error: any) {
            console.error('❌ [TOKEN_REFRESH] Error inesperado:', error);
            this.handleRefreshError({ success: false, error: error?.message || 'Error desconocido' });
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Refresca el token haciendo una petición al servidor
     */
    private async refreshToken(): Promise<TokenRefreshResult> {
        try {
            const response = await fetch(this.config.refreshEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                // Timeout adaptativo basado en las capacidades del navegador
                signal: this.createAbortSignal()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.data?.accessToken) {
                // Actualizar el token en el almacenamiento
                this.storageManager.set('creditoya_token', data.data.accessToken);
                
                return {
                    success: true,
                    newToken: data.data.accessToken
                };
            } else {
                throw new Error(data.error || 'Error desconocido en el refresh');
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Maneja errores en el refresh del token
     */
    private handleRefreshError(result: TokenRefreshResult): void {
        if (this.retryCount < this.config.maxRetries) {
            this.retryCount++;
            
            const delay = this.calculateRetryDelay();
            console.log(`🔄 [TOKEN_REFRESH] Reintentando en ${delay}ms (intento ${this.retryCount}/${this.config.maxRetries})`);
            
            setTimeout(() => {
                this.performRefresh();
            }, delay);
        } else {
            console.error('❌ [TOKEN_REFRESH] Máximo número de reintentos alcanzado');
            // Aquí podrías implementar lógica para redirigir al login
            this.handleMaxRetriesReached();
        }
    }

    /**
     * Calcula el delay para el siguiente reintento
     */
    private calculateRetryDelay(): number {
        if (!this.config.exponentialBackoff) {
            return this.config.baseDelay;
        }

        const exponentialDelay = this.config.baseDelay * Math.pow(2, this.retryCount - 1);
        return Math.min(exponentialDelay, this.config.maxDelay);
    }

    /**
     * Maneja el caso cuando se alcanza el máximo número de reintentos
     */
    private handleMaxRetriesReached(): void {
        // Limpiar el token inválido
        this.storageManager.remove('creditoya_token');
        
        // Detener el auto-refresh
        this.stopAutoRefresh();
        
        // Emitir evento para que la aplicación maneje la pérdida de sesión
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tokenRefreshFailed', {
                detail: { reason: 'max_retries_reached' }
            }));
        }
    }

    /**
     * Extrae el payload del token JWT
     */
    private extractTokenPayload(token: string): any {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const payload = parts[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch {
            return null;
        }
    }

    /**
     * Crea un AbortSignal con timeout adaptativo
     */
    private createAbortSignal(): AbortSignal {
        const controller = new AbortController();
        
        // Timeout adaptativo basado en la velocidad de conexión
        let timeout: number;
        switch (this.capabilities.connectionSpeed) {
            case 'slow':
                timeout = 30000; // 30 segundos
                break;
            case 'medium':
                timeout = 15000; // 15 segundos
                break;
            case 'fast':
            default:
                timeout = 10000; // 10 segundos
                break;
        }

        setTimeout(() => {
            controller.abort();
        }, timeout);

        return controller.signal;
    }

    /**
     * Refresca el token manualmente
     */
    async manualRefresh(): Promise<TokenRefreshResult> {
        if (this.isRefreshing) {
            return {
                success: false,
                error: 'Refresh ya en progreso'
            };
        }

        return this.refreshToken();
    }

    /**
     * Obtiene información sobre el estado del refresh
     */
    getRefreshStatus(): {
        isRefreshing: boolean;
        retryCount: number;
        lastRefreshTime: number;
        nextRefreshTime: number | null;
    } {
        return {
            isRefreshing: this.isRefreshing,
            retryCount: this.retryCount,
            lastRefreshTime: this.lastRefreshTime,
            nextRefreshTime: this.refreshTimer ? Date.now() + this.getTimeUntilNextRefresh() : null
        };
    }

    /**
     * Obtiene el tiempo hasta el próximo refresh
     */
    private getTimeUntilNextRefresh(): number {
        // Esta es una implementación simplificada
        // En una implementación real, necesitarías almacenar el tiempo programado
        return 0;
    }

    /**
     * Actualiza la configuración del refresh
     */
    updateConfig(newConfig: Partial<TokenRefreshConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // Reiniciar el auto-refresh con la nueva configuración
        this.stopAutoRefresh();
        this.startAutoRefresh();
    }
}

/**
 * Factory para crear el gestor de refresh de tokens
 */
export function createTokenRefreshManager(
    config: Partial<TokenRefreshConfig>,
    capabilities: BrowserCapabilities,
    storageManager: StorageManager
): TokenRefreshManager {
    return new TokenRefreshManager(config, capabilities, storageManager);
}
