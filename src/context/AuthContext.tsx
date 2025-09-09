"use client"

import { AuthContextType, AuthState, LoadingState } from "@/types/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { getBrowserCapabilities, getAdaptiveTimeout, isLegacyBrowser } from "@/lib/browser-capabilities";
import { createStorageManager } from "@/lib/storage-manager";
import { createTokenRefreshManager } from "@/lib/token-refresh-manager";
import { createErrorHandler } from "@/lib/error-handler";
import { applyPolyfills, needsPolyfills } from "@/lib/polyfills";

// Create context
const ClientAuthContext = createContext<AuthContextType | null>(null);

export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        error: null,
        user: null
    });

    const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});
    const router = useRouter();

    // Inicializar capacidades del navegador y sistemas de compatibilidad
    const [browserCapabilities] = useState(() => {
        const capabilities = getBrowserCapabilities();
        
        // Aplicar polyfills si es necesario
        if (needsPolyfills(capabilities)) {
            console.log('🔧 [AUTH] Navegador legacy detectado, aplicando polyfills...');
            applyPolyfills(capabilities);
        }
        
        return capabilities;
    });

    // Inicializar sistemas de compatibilidad
    const [storageManager] = useState(() => createStorageManager(browserCapabilities));
    const [errorHandler] = useState(() => createErrorHandler({
        networkTimeout: getAdaptiveTimeout(browserCapabilities),
        retryStrategy: isLegacyBrowser(browserCapabilities) ? 'exponential-backoff' : 'linear',
        maxRetries: browserCapabilities.connectionSpeed === 'slow' ? 5 : 3,
        offlineMode: 'cache-last-known-state'
    }, browserCapabilities));
    
    const [tokenRefreshManager] = useState(() => createTokenRefreshManager({
        refreshThreshold: isLegacyBrowser(browserCapabilities) ? 0.9 : 0.8, // Refresh más temprano en navegadores antiguos
        maxRetries: browserCapabilities.connectionSpeed === 'slow' ? 5 : 3,
        enableBackgroundRefresh: !isLegacyBrowser(browserCapabilities) // Deshabilitar en navegadores muy antiguos
    }, browserCapabilities, storageManager));

    // Check authentication status on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Usar axios directamente para debuggear
                const res = await axios.get("/api/auth/me", {
                    withCredentials: true,
                    timeout: getAdaptiveTimeout(browserCapabilities)
                });

                console.log('🔍 [CHECK_AUTH] Respuesta directa de axios:', {
                    status: res.status,
                    hasData: !!res.data,
                    dataStructure: res.data ? Object.keys(res.data) : 'no data',
                    success: res.data?.success,
                    hasUser: !!res.data?.data?.user,
                    fullResponse: res.data
                });

                if (res.data?.success && res.data?.data?.user) {
                    console.log('✅ [CHECK_AUTH] Usuario autenticado correctamente');
                    setAuthState({
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        user: res.data.data.user
                    });
                    
                    // Iniciar refresh automático de tokens
                    tokenRefreshManager.startAutoRefresh();
                } else {
                    console.log('❌ [CHECK_AUTH] Usuario no autenticado o datos inválidos');
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error: any) {
                console.log("Auth check: User not authenticated", error);
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    isAuthenticated: false
                }));
            }
        };

        checkAuthStatus();
    }, [browserCapabilities, tokenRefreshManager]);

    const login = async (email: string, password: string): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const result = await errorHandler.handleNetworkError(async () => {
                const res = await axios.post(
                    "/api/auth",
                    { email, password },
                    { 
                        withCredentials: true,
                        timeout: getAdaptiveTimeout(browserCapabilities)
                    }
                );
                return res;
            }, { operation: 'login' });

            console.log('🔍 [LOGIN] Resultado del error handler:', {
                success: result.success,
                hasData: !!result.data,
                dataStructure: result.data ? Object.keys(result.data) : 'no data',
                responseData: result.data?.data ? Object.keys(result.data.data) : 'no response data'
            });

            if (!result.success) {
                console.error('❌ [LOGIN] Error en la operación:', result.error);
                throw new Error(result.error || 'Credenciales inválidas');
            }

            const response = result.data;
            console.log('🔍 [LOGIN] Estructura de respuesta:', {
                hasResponse: !!response,
                hasData: !!response?.data,
                success: response?.data?.success,
                hasUser: !!response?.data?.data?.user
            });

            if (!response?.data) {
                console.error('❌ [LOGIN] Respuesta sin datos:', response);
                throw new Error('Credenciales inválidas');
            }

            if (!response.data.success || !response.data.data?.user) {
                console.error('❌ [LOGIN] Respuesta inválida:', response);
                throw new Error('Credenciales inválidas');
            }

            const { user } = response.data.data;

            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                error: null,
                user
            });

            // Iniciar refresh automático de tokens después del login exitoso
            tokenRefreshManager.startAutoRefresh();

            return true;
        } catch (error: any) {
            let errorMessage = 'Error al iniciar sesión';
            if (error.response?.data) {
                // Si message es un array, toma el primero
                if (Array.isArray(error.response.data.message)) {
                    errorMessage = error.response.data.message[0];
                } else if (typeof error.response.data.message === 'string') {
                    errorMessage = error.response.data.message;
                } else if (typeof error.response.data.error === 'string') {
                    // Solo si no hay message, muestra error
                    errorMessage = error.response.data.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
        
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                isAuthenticated: false,
                error: errorMessage
            }));
            return false;
        }
    };

    const register = async (userData: {
        email: string;
        password: string;
        names: string;
        firstLastName: string;
        secondLastName?: string;
    }): Promise<boolean> => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const result = await errorHandler.handleNetworkError(async () => {
                const res = await axios.post("/api/auth/register", userData, {
                    withCredentials: true,
                    timeout: getAdaptiveTimeout(browserCapabilities)
                });
                return res;
            }, { operation: 'register' });

            console.log('🔍 [REGISTER] Resultado del error handler:', {
                success: result.success,
                hasData: !!result.data,
                dataStructure: result.data ? Object.keys(result.data) : 'no data'
            });

            if (!result.success) {
                console.error('❌ [REGISTER] Error en la operación:', result.error);
                throw new Error(result.error || 'Error en el registro');
            }

            const response = result.data;
            if (!response?.data) {
                console.error('❌ [REGISTER] Respuesta sin datos:', response);
                throw new Error('Error en el registro');
            }
            
            if (!response.data.success || !response.data.data?.user) {
                console.error('❌ [REGISTER] Respuesta inválida:', response);
                throw new Error('Error en el registro');
            }
            
            const { user } = response.data.data;

            if (!user) {
                console.error('❌ [REGISTER] Usuario no encontrado en respuesta:', response);
                throw new Error('Error en el registro');
            }

            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                error: null,
                user
            });

            // Iniciar refresh automático de tokens después del registro exitoso
            tokenRefreshManager.startAutoRefresh();

            return true;
        } catch (error: any) {
            console.error('❌ [REGISTER] Error capturado:', error);
            const errorMessage = error.message || 'Error al registrarse';

            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                isAuthenticated: false,
                error: errorMessage
            }));

            return false;
        }
    };

    const logout = async () => {
        try {
            // Detener refresh automático de tokens
            tokenRefreshManager.stopAutoRefresh();
            
            // Call logout endpoint to invalidate token on server
            await errorHandler.handleNetworkError(async () => {
                return await axios.post("/api/auth/logout", {}, {
                    timeout: getAdaptiveTimeout(browserCapabilities)
                });
            }, { operation: 'logout' });
        } catch (error) {
            console.error("Error during logout:", error);
        }

        // Limpiar almacenamiento local
        storageManager.clear();

        // Reset state
        setAuthState({
            isAuthenticated: false,
            isLoading: false,
            error: null,
            user: null
        });

        // Redirect to home page
        window.location.href = '/';
    };

    // Loading state management functions
    const startLoading = (key: string, message: string = 'Cargando...') => {
        setLoadingStates(prev => ({
            ...prev,
            [key]: { isLoading: true, message, error: null }
        }));
    };

    const stopLoading = (key: string, error: string | null = null) => {
        setLoadingStates(prev => ({
            ...prev,
            [key]: { isLoading: false, message: '', error }
        }));
    };

    const getLoadingState = (key: string): LoadingState => {
        return loadingStates[key] || { isLoading: false, message: '', error: null };
    };

    const withLoading = async <T,>(
        key: string,
        loadingMessage: string,
        operation: () => Promise<T>
    ): Promise<{ success: boolean; data?: T; error?: string }> => {
        startLoading(key, loadingMessage);

        try {
            const result = await operation();
            stopLoading(key);
            return { success: true, data: result };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || 'Error en la operación';
            stopLoading(key, errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    return (
        <ClientAuthContext.Provider value={{
            ...authState,
            login,
            register,
            logout,
            isActivated: () => authState.user ? !authState.user.isBan : false,
            startLoading,
            stopLoading,
            getLoadingState,
            withLoading,
            loadingStates
        }}>
            {children}
        </ClientAuthContext.Provider>
    );
};

export const useClientAuth = (): AuthContextType => {
    const context = useContext(ClientAuthContext);
    if (!context) {
        throw new Error('useClientAuth must be used within a ClientAuthProvider');
    }
    return context;
};