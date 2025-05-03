import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Llamar al backend
        const response = await axios.post(
            `${process.env.GATEWAY_API}/auth/login/client`,
            { email, password }
        );

        const { user, accessToken } = response.data;

        // Crear la respuesta con la cookie
        const res = NextResponse.json({
            success: true,
            data: { user }
        });

        // Establecer la cookie
        res.cookies.set({
            name: 'creditoya_token',
            value: accessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 horas en segundos
            path: '/'
        });

        return res;
    } catch (error: any) {
        console.error('Error en login:', error.response?.data);
        
        return NextResponse.json({
            success: false,
            error: error.response?.data?.error || error.message || 'Error al iniciar sesión'
        }, { status: error.response?.status || 500 });
    }
}