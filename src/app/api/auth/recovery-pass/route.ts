import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Valida un token de recuperación de contraseña
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({
            success: false,
            error: 'Token no proporcionado'
        }, { status: 400 });
    }

    try {
        const baseURL = process.env.GATEWAY_API;
        const response = await axios.get(
            `${baseURL}/password-reset/validate-token?token=${token}`
        );

        return NextResponse.json({
            success: true,
            ...response.data
        });
    } catch (error: any) {
        console.error('Error validando token:', error.response?.status, error.response?.data);

        // Manejar diferentes tipos de errores
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || 'Error al validar el token';

        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: statusCode });
    }
}

/**
 * Restablecer contraseña con un token
 */
export async function POST(request: NextRequest) {
    try {
        // Obtener datos del cuerpo de la solicitud
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({
                success: false,
                error: 'Token y nueva contraseña son requeridos'
            }, { status: 400 });
        }

        const baseURL = process.env.GATEWAY_API!;
        const response = await axios.post(
            `${baseURL}/password-reset/reset`,
            { token, newPassword }
        );

        return NextResponse.json({
            success: true,
            message: 'Contraseña actualizada correctamente',
            ...response.data
        });
    } catch (error: any) {
        console.error('Error al restablecer contraseña:', error.response?.status, error.response?.data);

        // Manejar diferentes tipos de errores
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña';

        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: statusCode });
    }
}