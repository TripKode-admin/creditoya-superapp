import { validateToken } from "@/lib/validate-token";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('creditoya_token')?.value;

    await validateToken(token);

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('user_id') as string;

        if (!file) {
            console.warn('[UPLOAD] No se proporcionó ningún archivo');
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó ningún archivo'
            }, { status: 400 });
        }

        if (!userId) {
            console.warn('[UPLOAD] No se proporcionó ningún identificador de usuario');
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó ningún identificador'
            }, { status: 401 });
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                Cookie: `creditoya_token=${token}`,
                // 'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        };

        const apiFormData = new FormData();
        apiFormData.append('file', file);

        const baseURL = process.env.GATEWAY_API || '';

        const responseDB = await axios.put(
            `${baseURL}/clients/${userId}/document`,
            apiFormData,
            config,
        );

        console.log('[UPLOAD] Respuesta de la API:', responseDB.data);

        return NextResponse.json({
            success: true,
            data: "Verificación de documento de identidad exitosa",
        });
    } catch (error: any) {
        console.error('[UPLOAD] Error en petición de subida de archivo:', error);

        if (error.response?.status === 401) {
            return NextResponse.json({
                success: false,
                error: 'No autenticado'
            }, { status: 401 });
        }

        return NextResponse.json({
            success: false,
            error: error.response?.data?.error || error.message || 'Error desconocido al subir la imagen'
        }, { status: error.response?.status || 500 });
    }
}