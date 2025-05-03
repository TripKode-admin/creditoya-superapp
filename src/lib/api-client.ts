// api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Define una interfaz para la respuesta estándar
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Clase para el cliente API autenticado
export class AuthenticatedApiClient {
    private axiosInstance: AxiosInstance;
    private tokenCookieName: string;

    constructor(baseURL: string = process.env.GATEWAY_API || '', tokenCookieName: string = 'creditoya_token') {
        this.tokenCookieName = tokenCookieName;
        this.axiosInstance = axios.create({
            baseURL,
            withCredentials: true,
        });
    }

    // Método principal para realizar peticiones autenticadas
    async request<T = any>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<{ response: NextResponse | null; error: any }> {
        try {
            // Obtener y validar el token
            const { token, isValid, error } = await this.getAndValidateToken();

            if (!isValid || !token) {
                return {
                    response: NextResponse.json({
                        success: false,
                        error: error || 'Token inválido o expirado'
                    }, { status: 401 }),
                    error: error
                };
            }

            // Configurar headers con el token
            const requestConfig: AxiosRequestConfig = {
                ...config,
                headers: {
                    ...config?.headers,
                    Authorization: `Bearer ${token}`,
                    Cookie: `${this.tokenCookieName}=${token}`
                }
            };

            // Realizar la petición
            let response: AxiosResponse;
            if (method === 'GET') {
                response = await this.axiosInstance.get(url, requestConfig);
            } else if (method === 'POST') {
                response = await this.axiosInstance.post(url, data, requestConfig);
            } else if (method === 'PUT') {
                response = await this.axiosInstance.put(url, data, requestConfig);
            } else {
                response = await this.axiosInstance.delete(url, requestConfig);
            }

            // Devolver respuesta exitosa
            return {
                response: NextResponse.json({
                    success: true,
                    data: response.data
                }),
                error: null
            };
        } catch (error: any) {
            console.error(`Error en petición ${method} ${url}:`, error.response?.status, error.response?.data);

            // Manejar errores específicos
            if (error.response?.status === 401) {
                return {
                    response: NextResponse.json({
                        success: false,
                        error: 'No autenticado'
                    }, { status: 401 }),
                    error
                };
            }

            // Otros errores
            return {
                response: NextResponse.json({
                    success: false,
                    error: error.response?.data?.error || error.message || 'Error desconocido'
                }, { status: error.response?.status || 500 }),
                error
            };
        }
    }

    // Métodos de conveniencia para diferentes tipos de peticiones
    async get<T = any>(url: string, config?: AxiosRequestConfig) {
        return this.request<T>('GET', url, undefined, config);
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.request<T>('POST', url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.request<T>('PUT', url, data, config);
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig) {
        return this.request<T>('DELETE', url, undefined, config);
    }

    // Método para obtener y validar el token
    private async getAndValidateToken(): Promise<{ token: string | null; isValid: boolean; error: string | null }> {
        try {
            const cookieStore = await cookies();
            const token = cookieStore.get(this.tokenCookieName)?.value || null;

            if (!token) {
                return { token: null, isValid: false, error: 'No se encontró token en cookies' };
            }

            // Decodificar y validar expiración del token
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                return { token, isValid: false, error: 'Formato de token inválido' };
            }

            // Decodificar el payload (segunda parte del token)
            const base64Payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = Buffer.from(base64Payload, 'base64').toString('utf-8');
            const payload = JSON.parse(decodedPayload);

            // Verificar expiración
            if (payload.exp) {
                const expTime = new Date(payload.exp * 1000);
                const now = new Date();

                if (expTime < now) {
                    return { token, isValid: false, error: 'Token expirado' };
                }
            }

            return { token, isValid: true, error: null };
        } catch (error: any) {
            return {
                token: null,
                isValid: false,
                error: `Error al validar token: ${error.message}`
            };
        }
    }
}

// Instancia por defecto para usar directamente
export const apiClient = new AuthenticatedApiClient();