/**
 * Sistema mejorado de manejo de errores para dispositivos antiguos
 */

import { BrowserCapabilities } from './browser-capabilities';

export interface ErrorHandlingConfig {
    networkTimeout: number;
    retryStrategy: 'none' | 'linear' | 'exponential-backoff';
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    offlineMode: 'disable' | 'cache-last-known-state' | 'queue-requests';
    enableErrorReporting: boolean;
    errorReportingEndpoint?: string;
}

export interface ErrorContext {
    operation: string;
    timestamp: number;
    userAgent: string;
    capabilities: BrowserCapabilities;
    retryCount: number;
    originalError?: any;
}

export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    retryCount: number;
    totalTime: number;
}

export class ErrorHandler {
    private config: ErrorHandlingConfig;
    private capabilities: BrowserCapabilities;
    private errorQueue: Array<{ error: any; context: ErrorContext }> = [];
    private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true;

    constructor(config: Partial<ErrorHandlingConfig>, capabilities: BrowserCapabilities) {
        this.config = {
            networkTimeout: 15000,
            retryStrategy: 'exponential-backoff',
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            offlineMode: 'cache-last-known-state',
            enableErrorReporting: true,
            ...config
        };
        
        this.capabilities = capabilities;
        
        // Solo configurar event listeners si estamos en el navegador
        if (typeof window !== 'undefined') {
            this.setupEventListeners();
        }
    }

    /**
     * Configura los event listeners para manejo de conectividad
     */
    private setupEventListeners(): void {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueuedErrors();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Maneja errores de red con reintentos automáticos
     */
    async handleNetworkError<T>(
        operation: () => Promise<T>,
        context: Partial<ErrorContext> = {}
    ): Promise<RetryResult<T>> {
        const startTime = Date.now();
        let lastError: any;
        
        const fullContext: ErrorContext = {
            operation: 'unknown',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            capabilities: this.capabilities,
            retryCount: 0,
            ...context
        };

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                // Verificar conectividad
                if (!this.isOnline && this.config.offlineMode !== 'disable') {
                    return this.handleOfflineMode(operation, fullContext);
                }

                // Crear timeout adaptativo
                const timeout = this.createAdaptiveTimeout(attempt);
                
                // Ejecutar operación con timeout
                const result = await this.executeWithTimeout(operation, timeout);
                
                console.log('🔍 [ERROR_HANDLER] Operación exitosa:', {
                    operation: fullContext.operation,
                    attempt: attempt + 1,
                    hasResult: !!result,
                    resultType: typeof result,
                    resultKeys: result ? Object.keys(result) : 'no keys'
                });
                
                return {
                    success: true,
                    data: result,
                    retryCount: attempt,
                    totalTime: Date.now() - startTime
                };

            } catch (error: any) {
                lastError = error;
                fullContext.retryCount = attempt;
                fullContext.originalError = error;

                // Determinar si el error es recuperable
                if (!this.isRecoverableError(error) || attempt === this.config.maxRetries) {
                    break;
                }

                // Calcular delay para el siguiente intento
                const delay = this.calculateRetryDelay(attempt);
                console.warn(`⚠️ [ERROR_HANDLER] Reintentando en ${delay}ms (intento ${attempt + 1}/${this.config.maxRetries + 1})`);
                
                await this.sleep(delay);
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        const finalError = this.processError(lastError, fullContext);
        
        return {
            success: false,
            error: finalError.message,
            retryCount: fullContext.retryCount,
            totalTime: Date.now() - startTime
        };
    }

    /**
     * Maneja el modo offline
     */
    private async handleOfflineMode<T>(
        operation: () => Promise<T>,
        context: ErrorContext
    ): Promise<RetryResult<T>> {
        switch (this.config.offlineMode) {
            case 'cache-last-known-state':
                // Intentar obtener estado desde caché
                const cachedData = this.getCachedData(context.operation);
                if (cachedData) {
                    return {
                        success: true,
                        data: cachedData,
                        retryCount: 0,
                        totalTime: 0
                    };
                }
                break;
                
            case 'queue-requests':
                // Encolar la operación para cuando vuelva la conectividad
                this.queueOperation(operation, context);
                break;
        }

        return {
            success: false,
            error: 'Sin conexión a internet',
            retryCount: 0,
            totalTime: 0
        };
    }

    /**
     * Ejecuta una operación con timeout
     */
    private async executeWithTimeout<T>(
        operation: () => Promise<T>,
        timeout: number
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Operación timeout después de ${timeout}ms`));
            }, timeout);

            operation()
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }

    /**
     * Crea un timeout adaptativo basado en el intento y las capacidades
     */
    private createAdaptiveTimeout(attempt: number): number {
        let baseTimeout = this.config.networkTimeout;
        
        // Ajustar timeout basado en la velocidad de conexión
        switch (this.capabilities.connectionSpeed) {
            case 'slow':
                baseTimeout *= 2;
                break;
            case 'medium':
                baseTimeout *= 1.5;
                break;
            case 'fast':
            default:
                break;
        }
        
        // Aumentar timeout en reintentos
        return baseTimeout * (1 + attempt * 0.5);
    }

    /**
     * Determina si un error es recuperable
     */
    private isRecoverableError(error: any): boolean {
        // Errores de red son recuperables
        if (error.name === 'NetworkError' || 
            error.message?.includes('network') ||
            error.message?.includes('timeout') ||
            error.message?.includes('fetch')) {
            return true;
        }
        
        // Errores HTTP 5xx son recuperables
        if (error.status >= 500 && error.status < 600) {
            return true;
        }
        
        // Errores HTTP 429 (Too Many Requests) son recuperables
        if (error.status === 429) {
            return true;
        }
        
        return false;
    }

    /**
     * Calcula el delay para el siguiente reintento
     */
    private calculateRetryDelay(attempt: number): number {
        switch (this.config.retryStrategy) {
            case 'linear':
                return this.config.baseDelay * (attempt + 1);
                
            case 'exponential-backoff':
                const exponentialDelay = this.config.baseDelay * Math.pow(2, attempt);
                return Math.min(exponentialDelay, this.config.maxDelay);
                
            case 'none':
            default:
                return 0;
        }
    }

    /**
     * Procesa y categoriza errores
     */
    private processError(error: any, context: ErrorContext): Error {
        // Categorizar el error
        const errorType = this.categorizeError(error);
        
        // Crear mensaje de error más descriptivo
        const message = this.createErrorMessage(error, errorType, context);
        
        // Reportar error si está habilitado
        if (this.config.enableErrorReporting) {
            this.reportError(error, context, errorType);
        }
        
        return new Error(message);
    }

    /**
     * Categoriza el tipo de error
     */
    private categorizeError(error: any): string {
        if (error.name === 'NetworkError' || error.message?.includes('network')) {
            return 'NETWORK_ERROR';
        }
        
        if (error.message?.includes('timeout')) {
            return 'TIMEOUT_ERROR';
        }
        
        if (error.status >= 400 && error.status < 500) {
            return 'CLIENT_ERROR';
        }
        
        if (error.status >= 500) {
            return 'SERVER_ERROR';
        }
        
        if (error.message?.includes('fetch')) {
            return 'FETCH_ERROR';
        }
        
        return 'UNKNOWN_ERROR';
    }

    /**
     * Crea un mensaje de error más descriptivo
     */
    private createErrorMessage(error: any, errorType: string, context: ErrorContext): string {
        const baseMessage = error.message || 'Error desconocido';
        
        switch (errorType) {
            case 'NETWORK_ERROR':
                return `Error de conexión: ${baseMessage}. Verifica tu conexión a internet.`;
                
            case 'TIMEOUT_ERROR':
                return `La operación tardó demasiado tiempo. Intenta nuevamente.`;
                
            case 'CLIENT_ERROR':
                return `Error en la solicitud: ${baseMessage}`;
                
            case 'SERVER_ERROR':
                return `Error del servidor. Intenta nuevamente más tarde.`;
                
            case 'FETCH_ERROR':
                return `Error al procesar la solicitud: ${baseMessage}`;
                
            default:
                return baseMessage;
        }
    }

    /**
     * Reporta errores al servidor
     */
    private async reportError(error: any, context: ErrorContext, errorType: string): Promise<void> {
        if (!this.config.errorReportingEndpoint) {
            return;
        }

        try {
            const errorReport = {
                type: errorType,
                message: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString(),
                url: window.location.href
            };

            // Enviar reporte de error (sin reintentos para evitar loops)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout corto para reportes
            
            await fetch(this.config.errorReportingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorReport),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
        } catch (reportError) {
            // No hacer nada si falla el reporte de errores
            console.warn('No se pudo reportar el error:', reportError);
        }
    }

    /**
     * Obtiene datos desde caché
     */
    private getCachedData(operation: string): any {
        if (typeof window === 'undefined') return null;
        
        try {
            const cached = localStorage.getItem(`cache_${operation}`);
            if (cached) {
                const data = JSON.parse(cached);
                // Verificar si el caché no ha expirado (1 hora)
                if (Date.now() - data.timestamp < 60 * 60 * 1000) {
                    return data.value;
                }
            }
        } catch {
            // Ignorar errores de caché
        }
        return null;
    }

    /**
     * Encola una operación para ejecutar cuando vuelva la conectividad
     */
    private queueOperation<T>(operation: () => Promise<T>, context: ErrorContext): void {
        this.errorQueue.push({ error: operation, context });
    }

    /**
     * Procesa errores encolados cuando vuelve la conectividad
     */
    private async processQueuedErrors(): Promise<void> {
        if (this.errorQueue.length === 0) {
            return;
        }

        console.log(`🔄 [ERROR_HANDLER] Procesando ${this.errorQueue.length} operaciones encoladas`);
        
        const queue = [...this.errorQueue];
        this.errorQueue = [];

        for (const { error: operation, context } of queue) {
            try {
                await operation();
            } catch (error) {
                console.warn('Error procesando operación encolada:', error);
            }
        }
    }

    /**
     * Utilidad para dormir
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Actualiza la configuración
     */
    updateConfig(newConfig: Partial<ErrorHandlingConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Obtiene estadísticas de errores
     */
    getErrorStats(): {
        queuedErrors: number;
        isOnline: boolean;
        config: ErrorHandlingConfig;
    } {
        return {
            queuedErrors: this.errorQueue.length,
            isOnline: this.isOnline,
            config: this.config
        };
    }
}

/**
 * Factory para crear el manejador de errores
 */
export function createErrorHandler(
    config: Partial<ErrorHandlingConfig>,
    capabilities: BrowserCapabilities
): ErrorHandler {
    return new ErrorHandler(config, capabilities);
}
