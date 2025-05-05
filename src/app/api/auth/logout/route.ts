// api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { validateToken } from '@/lib/validate-token';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;

    await validateToken(token);

    try {
        // Intentar hacer logout en el backend (opcional)
        // try {
        //     await axios.post(`${process.env.GATEWAY_API}/auth/logout/client`);
        // } catch (error) {
        //     console.error('Error al hacer logout en el backend:', error);
        //     // Continuamos incluso si hay error en el backend
        // }

        const isLogout = await axios.post(
            `${process.env.GATEWAY_API}/auth/logout/client`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log(isLogout);

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