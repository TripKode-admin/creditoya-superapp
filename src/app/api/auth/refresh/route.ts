import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateTokenAdaptive } from '@/lib/validate-token';
import { getBrowserCapabilities } from '@/lib/browser-capabilities';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        console.log('🔄 [TOKEN_REFRESH] Iniciando refresh de token...');
        
        const cookieStore = await cookies();
        const token = cookieStore.get('creditoya_token')?.value;

        if (!token) {
            console.warn('❌ [TOKEN_REFRESH] No se encontró token en cookies');
            return NextResponse.json({
                success: false,
                error: 'No se encontró token de autenticación'
            }, { status: 401 });
        }

        // Validar el token actual
        try {
            const capabilities = getBrowserCapabilities();
            const validation = await validateTokenAdaptive(token, capabilities);
            
            if (!validation.isValid) {
                console.warn('❌ [TOKEN_REFRESH] Token inválido:', validation.error);
                return NextResponse.json({
                    success: false,
                    error: validation.error || 'Token inválido'
                }, { status: 401 });
            }

            console.log('✅ [TOKEN_REFRESH] Token válido, procediendo con refresh');
        } catch (validationError: any) {
            console.error('❌ [TOKEN_REFRESH] Error validando token:', validationError.message);
            return NextResponse.json({
                success: false,
                error: 'Error validando token'
            }, { status: 401 });
        }

        // Llamar al backend para refrescar el token
        const baseURL = process.env.GATEWAY_API || '';
        if (!baseURL) {
            console.error('❌ [TOKEN_REFRESH] GATEWAY_API no configurado');
            return NextResponse.json({
                success: false,
                error: 'Configuración del servidor incompleta'
            }, { status: 500 });
        }

        try {
            const response = await axios.post(
                `${baseURL}/auth/refresh/client`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 segundos timeout
                }
            );

            const { accessToken, user } = response.data;

            if (!accessToken) {
                throw new Error('No se recibió nuevo token del backend');
            }

            console.log('✅ [TOKEN_REFRESH] Token refrescado exitosamente');

            // Crear respuesta con nueva cookie
            const res = NextResponse.json({
                success: true,
                data: {
                    accessToken,
                    user: user || null
                }
            });

            // Establecer la nueva cookie con configuración adaptativa
            res.cookies.set({
                name: 'creditoya_token',
                value: accessToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 horas
                path: '/'
            });

            return res;

        } catch (backendError: any) {
            console.error('❌ [TOKEN_REFRESH] Error del backend:', {
                status: backendError.response?.status,
                statusText: backendError.response?.statusText,
                data: backendError.response?.data,
                message: backendError.message
            });

            // Manejar diferentes tipos de errores del backend
            if (backendError.response?.status === 401) {
                return NextResponse.json({
                    success: false,
                    error: 'Token expirado o inválido'
                }, { status: 401 });
            }

            if (backendError.response?.status === 429) {
                return NextResponse.json({
                    success: false,
                    error: 'Demasiados intentos de refresh',
                    retryAfter: 60 // 1 minuto
                }, { status: 429 });
            }

            if (backendError.code === 'ECONNABORTED') {
                return NextResponse.json({
                    success: false,
                    error: 'Timeout del servidor backend'
                }, { status: 408 });
            }

            return NextResponse.json({
                success: false,
                error: 'Error interno del servidor'
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('💥 [TOKEN_REFRESH] Error general:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}
