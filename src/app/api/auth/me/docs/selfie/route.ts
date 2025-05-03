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


        console.log('[UPLOAD] Archivo presente:', !!file);

        if (!file) {
            console.warn('[UPLOAD] No se proporcionó ningún archivo');
            return NextResponse.json({
                success: false,
                error: 'No se proporcionó ningún archivo'
            }, { status: 400 });
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                Cookie: `creditoya_token=${token}`,
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        };

        // Crear un FormData para enviar directamente al endpoint de selfie
        const apiFormData = new FormData();
        apiFormData.append('file', file);

        const baseURL = process.env.GATEWAY_API || '';

        // Ahora enviamos directamente el archivo al endpoint de selfie
        const responseDB = await axios.put(
            `${baseURL}/clients/${userId}/document/selfie`,
            apiFormData,
            config
        );

        console.log('[UPLOAD] Respuesta de actualización de selfie:', responseDB.data);

        return NextResponse.json({
            success: true,
            data: "Verificación de imagen con CC actualizada",
        });
    } catch (error: any) {
        console.error('[UPLOAD] Error en petición de subida de imagen:', error);

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