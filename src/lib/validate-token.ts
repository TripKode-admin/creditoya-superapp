import { NextResponse } from "next/server";
import { BrowserCapabilities } from './browser-capabilities';

/**
 * Configuración para validación de tokens legacy
 */
interface LegacyTokenConfig {
    skipBase64Padding: boolean;
    handleMalformedTokens: boolean;
    fallbackToServerValidation: boolean;
    allowExpiredTokens: boolean;
    maxTokenAge: number; // en milisegundos
}

/**
 * Resultado de la validación de token
 */
export interface TokenValidationResult {
    isValid: boolean;
    isExpired: boolean;
    isMalformed: boolean;
    payload?: any;
    error?: string;
    requiresServerValidation?: boolean;
}

/**
 * Función para validar el token JWT con soporte para navegadores antiguos
 */
export async function validateToken(
    token: string | undefined, 
    capabilities?: BrowserCapabilities,
    legacyConfig?: Partial<LegacyTokenConfig>
): Promise<void> {
    const result = await validateTokenDetailed(token, capabilities, legacyConfig);
    
    if (!result.isValid) {
        throw new Error(result.error || 'Token inválido o expirado');
    }
}

/**
 * Función detallada para validar el token JWT
 */
export async function validateTokenDetailed(
    token: string | undefined,
    capabilities?: BrowserCapabilities,
    legacyConfig?: Partial<LegacyTokenConfig>
): Promise<TokenValidationResult> {
    const config: LegacyTokenConfig = {
        skipBase64Padding: true,
        handleMalformedTokens: true,
        fallbackToServerValidation: false,
        allowExpiredTokens: false,
        maxTokenAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        ...legacyConfig
    };

    try {
        if (!token) {
            return {
                isValid: false,
                isExpired: false,
                isMalformed: false,
                error: 'No se encontró token en cookies'
            };
        }

        // Validación básica del formato
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            return {
                isValid: false,
                isExpired: false,
                isMalformed: true,
                error: 'Formato de token inválido'
            };
        }

        // Decodificar el payload con manejo robusto
        let payload: any;
        try {
            payload = decodeJWTPayload(tokenParts[1], config);
        } catch (decodeError: any) {
            if (config.handleMalformedTokens) {
                console.warn('Token malformado, intentando decodificación alternativa:', decodeError.message);
                
                // Intentar decodificación alternativa
                try {
                    payload = decodeJWTPayloadAlternative(tokenParts[1]);
                } catch (altError) {
                    return {
                        isValid: false,
                        isExpired: false,
                        isMalformed: true,
                        error: 'No se pudo decodificar el token',
                        requiresServerValidation: config.fallbackToServerValidation
                    };
                }
            } else {
                return {
                    isValid: false,
                    isExpired: false,
                    isMalformed: true,
                    error: decodeError.message,
                    requiresServerValidation: config.fallbackToServerValidation
                };
            }
        }

        // Validar estructura del payload
        if (!payload || typeof payload !== 'object') {
            return {
                isValid: false,
                isExpired: false,
                isMalformed: true,
                error: 'Payload del token inválido'
            };
        }

        // Verificar expiración
        const isExpired = checkTokenExpiration(payload, config);
        if (isExpired && !config.allowExpiredTokens) {
            return {
                isValid: false,
                isExpired: true,
                isMalformed: false,
                payload,
                error: 'Token expirado'
            };
        }

        // Verificar edad del token
        if (payload.iat) {
            const tokenAge = Date.now() - (payload.iat * 1000);
            if (tokenAge > config.maxTokenAge) {
                return {
                    isValid: false,
                    isExpired: false,
                    isMalformed: false,
                    payload,
                    error: 'Token demasiado antiguo'
                };
            }
        }

        return {
            isValid: true,
            isExpired: false,
            isMalformed: false,
            payload
        };

    } catch (error: any) {
        return {
            isValid: false,
            isExpired: false,
            isMalformed: true,
            error: error.message || 'Error al validar el token',
            requiresServerValidation: config.fallbackToServerValidation
        };
    }
}

/**
 * Decodifica el payload JWT con manejo robusto
 */
function decodeJWTPayload(encodedPayload: string, config: LegacyTokenConfig): any {
    try {
        // Limpiar el payload
        let cleanPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
        
        // Agregar padding si es necesario (para navegadores antiguos)
        if (!config.skipBase64Padding) {
            while (cleanPayload.length % 4) {
                cleanPayload += '=';
            }
        }

        // Decodificar usando Buffer (Node.js) o atob (navegador)
        let decodedPayload: string;
        
        if (typeof Buffer !== 'undefined') {
            // Entorno Node.js
            decodedPayload = Buffer.from(cleanPayload, 'base64').toString('utf-8');
        } else if (typeof atob !== 'undefined') {
            // Navegador moderno
            decodedPayload = atob(cleanPayload);
        } else {
            // Fallback para navegadores muy antiguos
            decodedPayload = decodeBase64Fallback(cleanPayload);
        }

        return JSON.parse(decodedPayload);
    } catch (error) {
        throw new Error(`Error decodificando payload: ${error}`);
    }
}

/**
 * Decodificación alternativa para tokens malformados
 */
function decodeJWTPayloadAlternative(encodedPayload: string): any {
    try {
        // Intentar diferentes variaciones de padding
        const variations = [
            encodedPayload,
            encodedPayload + '=',
            encodedPayload + '==',
            encodedPayload + '==='
        ];

        for (const variation of variations) {
            try {
                const cleanPayload = variation.replace(/-/g, '+').replace(/_/g, '/');
                let decodedPayload: string;

                if (typeof Buffer !== 'undefined') {
                    decodedPayload = Buffer.from(cleanPayload, 'base64').toString('utf-8');
                } else if (typeof atob !== 'undefined') {
                    decodedPayload = atob(cleanPayload);
                } else {
                    decodedPayload = decodeBase64Fallback(cleanPayload);
                }

                return JSON.parse(decodedPayload);
            } catch {
                continue;
            }
        }

        throw new Error('No se pudo decodificar el token con ninguna variación');
    } catch (error) {
        throw new Error(`Error en decodificación alternativa: ${error}`);
    }
}

/**
 * Fallback para decodificación Base64 en navegadores muy antiguos
 */
function decodeBase64Fallback(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;

    while (i < str.length) {
        const encoded1 = chars.indexOf(str.charAt(i++));
        const encoded2 = chars.indexOf(str.charAt(i++));
        const encoded3 = chars.indexOf(str.charAt(i++));
        const encoded4 = chars.indexOf(str.charAt(i++));

        const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

        result += String.fromCharCode((bitmap >> 16) & 255);
        if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
        if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }

    return result;
}

/**
 * Verifica la expiración del token
 */
function checkTokenExpiration(payload: any, config: LegacyTokenConfig): boolean {
    if (!payload.exp) {
        return false; // No hay información de expiración
    }

    try {
        const expTime = new Date(payload.exp * 1000);
        const now = new Date();
        
        // Agregar un margen de 5 minutos para evitar problemas de sincronización
        const margin = 5 * 60 * 1000; // 5 minutos en milisegundos
        const adjustedNow = new Date(now.getTime() + margin);
        
        return expTime < adjustedNow;
    } catch {
        return true; // Si hay error al verificar, considerar expirado
    }
}

/**
 * Valida el token con configuración adaptativa basada en las capacidades del navegador
 */
export async function validateTokenAdaptive(
    token: string | undefined,
    capabilities: BrowserCapabilities
): Promise<TokenValidationResult> {
    const legacyConfig: Partial<LegacyTokenConfig> = {
        skipBase64Padding: capabilities.javascriptVersion < 5,
        handleMalformedTokens: capabilities.isOldAndroid || capabilities.isOldIOS,
        fallbackToServerValidation: !capabilities.supportsPromises,
        allowExpiredTokens: false,
        maxTokenAge: capabilities.isLowMemory ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 1 día para dispositivos con poca memoria
    };

    return validateTokenDetailed(token, capabilities, legacyConfig);
}