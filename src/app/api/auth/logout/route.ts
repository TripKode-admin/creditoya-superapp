// api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        // Intentar hacer logout en el backend (opcional)
        try {
            await axios.post(`${process.env.GATEWAY_API}/auth/logout/client`);
        } catch (error) {
            console.error('Error al hacer logout en el backend:', error);
            // Continuamos incluso si hay error en el backend
        }

        // Crear respuesta y eliminar la cookie
        const response = NextResponse.json({
            success: true
        });

        // Eliminar la cookie
        response.cookies.delete('creditoya_token');

        return response;
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al cerrar sesión'
        }, { status: 500 });
    }
}